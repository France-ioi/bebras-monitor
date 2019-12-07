
import React from 'react';
import classnames from 'classnames';
import {Button} from 'react-bootstrap';
import {connect} from 'react-redux';
import {call, select, put, take, takeEvery} from 'redux-saga/effects';
import Ticker from 'redux-saga-ticker';

import {asyncPostJson} from './backend_api';

function* refreshSaga ({refreshStarted, refreshCompleted, refreshFailed}) {
  try {
    yield put(refreshStarted());
    const query = {max_top_entries: 100};
    const result = yield call(asyncPostJson, 'refresh', query);
    yield put(refreshCompleted(new Date(), result));
  } catch (ex) {
    console.log('backend refresh failed', ex);
    let message;
    if (ex.res) {
      message = `${ex.res.statusCode} ${ex.res.statusText}`;
    } else {
      message = ex.toString();
    }
    yield put(refreshFailed(new Date(), message));
  }
}

function refreshStartedReducer (state, _action) {
  return {...state, refreshPending: true};
}

function refreshCompletedReducer (state, {payload: {timestamp, result}}) {
  const {entries, topEntries, logs} = result;
  return {...state, entries, topKeys: topEntries, logs, refreshPending: false, refreshError: false, refreshedAt: timestamp};
}

function refreshFailedReducer (state, {payload: {timestamp, message}}) {
  return {...state, refreshPending: false, refreshError: message, refreshedAt: timestamp};
}

/* Automatically refresh every 3s if the window is active. */
function* autoRefreshSaga ({refresh}, {isWindowActive}) {
  const channel = Ticker(3000);
  while (true) {
    yield take(channel);
    let isActive = yield select(isWindowActive);
    if (isActive) {
      yield put(refresh());
    }
  }
}

class RefreshControl extends React.PureComponent {
  render () {
    const {refreshPending, refreshedAt, refreshError, isActive} = this.props;
    return (
      <div className="refresh-control">
        {refreshedAt &&
          (refreshError
            ? <span className="refreshedAt refreshError" title={refreshError}>{"refresh failed at "}{refreshedAt.toISOString()}</span>
            : <span className="refreshedAt">{"refreshed at "}{refreshedAt.toISOString()}</span>)}
        <Button onClick={this.onRefresh} bsStyle={isActive ? 'default' : 'primary'}>
          <i className={classnames(['fa', 'fa-refresh', refreshPending && 'fa-spin'])}/>
        </Button>
      </div>
    );
  }
  onRefresh = () => {
    this.props.refresh();
  };
}

function RefreshControlSelector (state, props) {
  const {actions: {refresh}, refreshPending, refreshedAt, refreshError, isActive} = state;
  return {refresh, refreshPending, refreshedAt, refreshError, isActive};
}

export default {
  actionBuilders: {
    refresh: () => ({type: 'Refresh', meta: {promise: true}}),
    refreshStarted: () => ({type: 'Refresh.Started'}),
    refreshCompleted: (timestamp, result) => ({type: 'Refresh.Completed', payload: {timestamp, result}}),
    refreshFailed: (timestamp, message) => ({type: 'Refresh.Failed', payload: {timestamp, message}}),
  },
  actionReducers: {
    'Refresh.Started': refreshStartedReducer,
    'Refresh.Completed': refreshCompletedReducer,
    'Refresh.Failed': refreshFailedReducer,
  },
  sagas: [
    function* (actions) { yield takeEvery('Refresh', refreshSaga, actions); },
    autoRefreshSaga
  ],
  views: {
    RefreshControl: connect(RefreshControlSelector)(RefreshControl)
  }
};
