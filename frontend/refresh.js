
import {use, defineAction, defineSelector, defineView, addSaga, addReducer} from 'epic-linker';
import EpicComponent from 'epic-component';
import React from 'react';
import classnames from 'classnames';
import {Button} from 'react-bootstrap';
import {call, select, put, take} from 'redux-saga/effects';
import Ticker from 'redux-saga-ticker';

import {asyncPostJson} from './backend_api';

export default function* (deps) {

  yield defineAction('refresh', 'Refresh');
  yield addSaga(function* refresh () {
    for (;;) {
      const timestamp = new Date();
      yield take(deps.refresh);
      try {
        yield put({type: deps.refreshStarted});
        const query = {max_top_entries: 25};
        const result = yield call(asyncPostJson, '/refresh', query);
        if (result.entries) {
          yield put({type: deps.updateEntries, entries: result.entries});
        }
        if (result.topEntries) {
          yield put({type: deps.updateTopEntries, keys: result.topEntries});
        }
        yield put({type: deps.refreshDone, timestamp});
      } catch (ex) {
        console.log('backend refresh failed', ex);
        let message;
        if (ex.res) {
          message = `${ex.res.statusCode} ${ex.res.statusText}`;
        } else {
          message = ex.toString();
        }
        yield put({type: deps.refreshFailed, timestamp, message});
      }
    }
  });

  yield defineAction('updateEntries', 'Entries.Update');
  yield addReducer('updateEntries', function (state, action) {
    const {entries} = action;
    // XXX build actions list here
    return {...state, entries};
  });

  yield defineAction('updateTopEntries', 'TopEntries.Update');
  yield addReducer('updateTopEntries', function (state, action) {
    const {keys} = action;
    return {...state, topKeys: keys};
  });

  yield defineAction('refreshStarted', 'Refresh.Started');
  yield addReducer('refreshStarted', function (state, action) {
    return {...state, refreshPending: true};
  });

  yield defineAction('refreshDone', 'Refresh.Done');
  yield addReducer('refreshDone', function (state, action) {
    return {...state, refreshPending: false, refreshError: false, refreshedAt: action.timestamp};
  });

  yield defineAction('refreshFailed', 'Refresh.Failed');
  yield addReducer('refreshFailed', function (state, action) {
    return {...state, refreshPending: false, refreshError: action.message, refreshedAt: action.timestamp};
  });

  // Automatically refresh every 3s if the window is active.
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

  yield defineSelector('RefreshSelector', function (state, props) {
    const {refreshPending, refreshedAt, refreshError, isActive} = state;
    return {refreshPending, refreshedAt, refreshError, isActive};
  });

  yield defineView('Refresh', 'RefreshSelector', EpicComponent(self => {

    const onRefresh = function () {
      self.props.dispatch({type: deps.refresh});
    };

    self.render = function () {
      const {refreshPending, refreshedAt, refreshError, isActive} = self.props;
      return (
        <div className="refresh-control">
          {refreshedAt &&
            (refreshError
              ? <span className="refreshedAt refreshError" title={refreshError}>refresh failed at {refreshedAt.toISOString()}</span>
              : <span className="refreshedAt">refreshed at {refreshedAt.toISOString()}</span>)}
          <Button onClick={onRefresh} bsStyle={isActive ? 'default' : 'primary'}>
            <i className={classnames(['fa', 'fa-refresh', refreshPending && 'fa-spin'])}/>
          </Button>
        </div>
      );
    };

  }));

};
