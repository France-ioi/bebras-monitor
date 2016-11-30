
import {defineAction, addSaga, addReducer, use} from 'epic-linker';
import {call, select, put, take} from 'redux-saga/effects';
import Ticker from 'redux-saga-ticker';

import {asyncGetJson} from './backend_api';

export default function* (deps) {

  yield defineAction('refresh', 'Refresh');
  yield addSaga(function* refresh () {
    for (;;) {
      yield take(deps.refresh);
      let entries = yield call(asyncGetJson, '/top?count=25');
      const timestamp = new Date();
      yield put({type: deps.updateTopEntries, entries});
      yield put({type: deps.refreshDone, timestamp});
    }
  });

  yield defineAction('updateTopEntries', 'TopEntries.Update');
  yield addReducer('updateTopEntries', function (state, action) {
    const {entries} = action;
    return {...state, topEntries: entries};
  });

  yield defineAction('refreshDone', 'Refresh.Done');
  yield addReducer('refreshDone', function (state, action) {
    return {...state, refreshedAt: action.timestamp};
  });

  yield use('isWindowActive');
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

};
