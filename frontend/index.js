
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {link, include, defineAction, addReducer} from 'epic-linker';

import AppView from './app_view';
import EntryPanel from './entry_panel';
import Entries from './entries';
import ActivityTab from './activity_tab';
import ActionsTab from './actions_tab';
import Navigation from './navigation';
import WindowActive from './window_active';
import Refresh from './refresh';

import 'normalize.css!';
import './base.scss!';
import './style.scss!';

const {store, scope, start} = link(function* (deps) {

  yield defineAction('init', 'Init');
  yield addReducer('init', function (state, action) {
    return {
      topEntries: [],
      activeTabKey: 'activity'
    };
  });

  yield include(AppView);

  yield include(Entries);
  yield include(EntryPanel);
  yield include(ActivityTab);
  yield include(ActionsTab);
  yield include(Navigation([
    {key: 'activity', label: "Activity", view: 'ActivityTab'},
    {key: 'actions', label: "Actions", view: 'ActionsTab'}
  ]));

  yield include(WindowActive);
  yield include(Refresh);

});

store.dispatch({type: scope.init});
start();
store.dispatch({type: scope.refresh});

const container = document.getElementById('react-container');
ReactDOM.render(<Provider store={store}><scope.App/></Provider>, container);
