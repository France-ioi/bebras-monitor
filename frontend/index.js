
window.App = {
  start: function (container, options) {
    container.innerText = "failed";
  }
};

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware, compose} from 'redux';
import {default as createSagaMiddleware} from 'redux-saga';
import {all, call} from 'redux-saga/effects';

React.PropTypes = PropTypes;

import {link} from './linker';
import AppBundle from './app_view';
import RefreshBundle from './refresh';
import EntriesBundle from './entries';
import EntryPanelBundle from './entry_panel';
import WindowActiveBundle from './window_active';

import 'normalize.css';
import './base.scss';
import './style.scss';

function reduceInit (state, {payload: {debug, actions, selectors, views}}) {
  return {
    ...state, debug, actions, selectors, views,
    topEntries: [], activeTabKey: 'activity'
  };
}

const rootBundle = {
  actionBuilders: {
    init: ({debug, actions, selectors, views}) => ({type: 'init', payload: {debug, actions, selectors, views}}),
  },
  actionReducers: {
    '@@redux/INIT': (state, _action) => ({}),
    'init': reduceInit,
  },
  lateReducer: function (state, action) {
    if (state.debug) {
      console.log('reduced', action, state);
    }
    return state;
  },
  includes: [
    AppBundle,
    RefreshBundle,
    EntriesBundle,
    EntryPanelBundle,
    WindowActiveBundle
  ]
};

function promiseMiddleware () {
  return next => (action) => {
    if (!action.meta) {
      action.meta = {};
    }
    /* Action either does not require or is already equipped with a promise. */
    if (action.meta.promise !== true) {
      return next(action);
    }
    action.meta.promise = new Promise(function (resolve, reject) {
      /* Update the action, otherwise the saga emitter and the store middleware
         may create two promises for the same action. */
      action.meta.resolve = resolve;
      action.meta.reject = reject;
      next(action);
    });
    return action.meta.promise;
  };
}

function bindActions (store, actionBuilders) {
  const actions = {};
  Object.keys(actionBuilders).forEach(function (key) {
    const actionBuilder = actionBuilders[key];
    actions[key] = (...args) => store.dispatch(actionBuilder(...args));
  });
  return actions;
}

window.App.start = function (container) {
  const {actionBuilders, reducer, sagas, views, selectors} = link(rootBundle);
  const sagaMiddleware = createSagaMiddleware({emitter: promiseMiddleware()});
  const enhancer = compose(
    applyMiddleware(sagaMiddleware),
    applyMiddleware(promiseMiddleware)
  );
  const store = createStore(safeReducer, null, enhancer);
  const actions = bindActions(store, actionBuilders);
  Object.assign(window.App, {store, actions, runSagas});
  actions.init({debug: true, actions, selectors, views});
  runSagas();
  actions.refresh();
  ReactDOM.render(<Provider store={store}><views.App/></Provider>, container);
  function safeReducer (state, action) {
    try {
      return reducer(state, action);
    } catch (ex) {
      console.log('uncaught exception in reducer', action, ex);
    }
  }
  function runSagas () {
    sagaMiddleware.run(function* () {
      try {
        console.log('all', all);
        yield all(sagas.map(saga => call(saga, actionBuilders, selectors)));
      } catch (ex) {
        console.log('uncaught exception in root saga', ex);
      }
    });
  }
};
