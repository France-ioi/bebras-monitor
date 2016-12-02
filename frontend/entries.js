
import {defineAction, addReducer, addSaga} from 'epic-linker';
import {take, call, fork} from 'redux-saga/effects'

import {asyncPostJson} from './backend_api';

export default function* (deps) {

  yield defineAction('setEntryAction', 'Entry.SetAction');
  yield defineAction('showEntry', 'Entry.Show');
  yield defineAction('selectEntry', 'Entry.Select');

  yield addReducer('showEntry', function (state, action) {
    return {...state, pointedEntryKey: action.key};
  });

  yield addReducer('selectEntry', function (state, action) {
    if (action.key === state.selectedEntryKey) {
      return {...state, selectedEntryKey: undefined};
    }
    return {...state, selectedEntryKey: action.key};
  });

  yield addSaga(function* () {
    while (true) {
      const {key, action} = yield take(deps.setEntryAction);
      yield fork(setAction, key, action);
    }
  });

  function* setAction (key, action) {
    try {
      yield call(asyncPostJson, '/setAction', {key, action});
      // TODO: success feedback / refresh entry
    } catch (ex) {
      // TODO: error feedback
      console.log('setAction failed', ex);
    }
  }

};
