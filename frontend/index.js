
import React from 'react';
import {Button} from 'react-bootstrap';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {call, cps, select, put, take, fork} from 'redux-saga/effects';
import Ticker from 'redux-saga-ticker';
import EpicComponent from 'epic-component';
import {link, include, defineAction, defineSelector, defineView, addReducer, addSaga, use} from 'epic-linker';
import request from 'superagent';

import WindowActive from './window_active';

import './style.scss!';


export const asyncGetJson = function (path) {
  return new Promise(function (resolve, reject) {
    var req = request.get(path);
    req.end(function (err, res) {
      if (err || !res.ok)
        return reject({err, res});
      resolve(res.body);
    });
  });
};

export const asyncPostJson = function (path, body) {
  return new Promise(function (resolve, reject) {
    var req = request.post(path);
    if (body) {
      req.set('Accept', 'application/json');
      req.send(body);
    }
    req.end(function (err, res) {
      if (err || !res.ok)
        return reject({err, res});
      resolve(res.body);
    });
  });
};

const {store, scope, start} = link(function* (deps) {

  yield defineAction('init', 'App.Init');
  yield defineAction('refresh', 'App.Refresh');
  yield defineAction('refreshDone', 'App.Refresh.Done');
  yield defineAction('updateTopEntries', 'TopEntries.Update');

  yield addReducer('init', function (state, action) {
    return {
      topEntries: []
    };
  });

  yield addSaga(refresh);
  yield addReducer('refreshDone', function (state, action) {
    return {...state, refreshedAt: action.timestamp};
  });

  yield addReducer('updateTopEntries', function (state, action) {
    const {entries} = action;
    return {...state, topEntries: entries};
  });

  yield include(WindowActive);
  yield use('setWindowActive');
  yield addReducer('setWindowActive', function (state, action) {
    const {isActive} = action;
    return {...state, isActive};
  });
  yield defineSelector('isWindowActive', function (state) {
    return state.isActive;
  });

  yield defineSelector('AppSelector', function (state, props) {
    const {refreshedAt, topEntries} = state;
    return {refreshedAt, topEntries};
  });

  yield defineView('App', 'AppSelector', EpicComponent(self => {

    const onRefresh = function () {
      self.props.dispatch({type: deps.refresh});
    };

    const renderEntry = function (entry) {
      const {key, ip, total, domains} = entry;
      return (
        <div className="entry-table" key={key}>
          <span className="entry-key">{key}</span>
          <span className="entry-ip number">{ip}</span>
          <span className="entry-total number">{total}</span>
          <span className="entry-domain number">
            {domains === undefined ? 'unknown' :
             domains === false ? 'not found' :
             domains.join(',')}</span>
        </div>
      );
    };

    self.render = function () {
      const {refreshedAt, topEntries} = self.props;
      return (
        <div className="container">
          <div id="top" className="row">
            <div className="pull-right">
              {refreshedAt && <span className="refreshedAt">refreshed at {refreshedAt.toISOString()}</span>}
              <Button onClick={onRefresh}><i className="fa fa-refresh"/></Button>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {topEntries && <div>{topEntries.map(renderEntry)}</div>}
            </div>
          </div>
        </div>
      );
    };

  }));

  function* refresh () {
    for (;;) {
      yield take(deps.refresh);
      let entries = yield call(asyncGetJson, '/top?count=25');
      const timestamp = new Date();
      yield put({type: deps.updateTopEntries, entries});
      yield put({type: deps.refreshDone, timestamp});
    }
  }

  yield addSaga(function* autoRefresh () {
    const channel = Ticker(3000);
    while (true) {
      yield take(channel);
      let isActive = yield select(deps.isWindowActive);
      if (isActive) {
        yield put({type: deps.refresh});
      }
    }
  });

});

store.dispatch({type: scope.init});
start();
store.dispatch({type: scope.refresh});

const container = document.getElementById('react-container');
ReactDOM.render(<Provider store={store}><scope.App/></Provider>, container);
