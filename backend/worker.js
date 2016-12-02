
import {createStore, applyMiddleware} from 'redux';
import {default as sagaMiddlewareFactory, END, takeEvery, takeLatest} from 'redux-saga';
import {call, cps, select, put, take, fork, actionChannel} from 'redux-saga/effects'
import Ticker from 'redux-saga-ticker';
import Immutable from 'immutable';
import fs from 'fs';
import dns from 'dns';

import LiveSet from './live_set';

const maxFetchInterval = 3000; // ms

const PerIpKeys = {
  answer: 'answer.total',
  checkPassword: 'checkPassword.total',
  closeContest: 'closeContest.total',
  createTeam: 'createTeam.total',
  destroySession: 'destroySession',
  getRemainingTime: 'getRemainingTime.total',
  loadContestData: 'loadContestData.total',
  loadPublicGroups: 'loadPublicGroups',
  loadSession: 'loadSession.total',
  solutions: 'solutions.total'
};

function reducer (state, action) {
  switch (action.type) {
  case 'INIT':
    return {
      liveSet: new LiveSet(),
      liveSetCapacity: 1000,
      redis: action.redis
    };
  case 'LOAD':
    return {...state, liveSet: state.liveSet.mutated(function (copy) {
      copy.load(action.dump);
    })};
  case 'SET_ENTRY':
    return {...state, liveSet: state.liveSet.mutated(function (copy) {
      copy.set(action.entry);
      if (copy.size() > state.liveSetCapacity) {
        const ejected = copy.extractMinTotal(); // or copy.extractLru();
        console.log('ejected', ejected)
      }
    })};
  case 'UPDATE_ENTRY':
    {
      const {key, update} = action;
      const oldEntry = state.liveSet.get(key);
      if (!oldEntry) {
        return state;
      }
      return {...state, liveSet: state.liveSet.mutated(function (copy) {
        copy.set({...oldEntry, ...update});
      })};
    }
  case 'PRUNE_ENTRIES':
    return {...state, liveSet: state.liveSet.mutated(function (copy) {
      // Prune entries that haven't been touched in 1 hour.
      copy.prune(Date.now() - 60 * 60 * 1000);
    })};
  case 'UPDATE_ACTION_MAP': {
    const {actionMap} = action;
    return {...state, actionMap};
  }
  default:
    return state;
  }
}

function getEntryByKey (state, key) {
  return state.liveSet.get(key);
}

function hexToBytes (hex) {
  var bytes = [];
  for (var i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bytes;
}

function getKeyIP (key) {
  const md = /^IP\(([0-9a-f]+)\)$/.exec(key);
  if (!md) {
    return;
  }
  const hexIp = md[1];
  return hexToBytes(hexIp).join('.');
}

function* reloadActionMap () {
  console.log('reloading action map');
  const redis = yield select(state => state.redis);
  const keys = yield cps([redis, redis.smembers], 'action_set');
  const actionMap = {};
  if (keys.length !== 0) {
    const actions = yield cps([redis, redis.mget], keys.map(key => `a.${key}`));
    keys.forEach(function (key, i) {
      actionMap[key] = {action: actions[i]};
    });
  }
  yield put({type: 'UPDATE_ACTION_MAP', actionMap});
  // Ensure entries that have an action are loaded.
  yield keys.map(key => call(ensureEntryLoaded, key));
}

function* ensureEntryLoaded (key) {
  const entry = yield select(getEntryByKey, key);
  if (!entry) {
    put({type: 'LOAD_ENTRY', key})
  }
}

function* followActivityQueue () {
  let count = 0, key, entry, now;
  const infoMap = {};
  const redis = yield select(state => state.redis);
  while (true) {
    // lpop returns the key, or null
    key = yield cps([redis, redis.lpop], 'activity_queue');
    if (!key) {
      // console.log(`queue is empty after ${count} keys`);
      count = 0;
      // blpop returns [queue, value]
      let res = yield cps([redis, redis.blpop], 'activity_queue', 0);
      key = res[1];
    }
    count += 1;
    entry = yield select(getEntryByKey, key);
    now = Date.now();
    // Limit to 1 fetch per second.
    if (entry && now < entry.updatedAt + maxFetchInterval) {
      // TODO: schedule a fetch at updatedAt + maxFetchInterval
      continue;
    }
    yield put({type: 'LOAD_ENTRY', key});
  }
}

function* loadEntry (action) {
  const {key} = action;
  const ip = getKeyIP(key);
  if (!ip) return;
  // Preserve any data stored in the previous entry.
  const prevEntry = yield select(getEntryByKey, key);
  const entry = prevEntry ? {...prevEntry} : {key, ip};
  entry.updatedAt = Date.now();
  let total = 0;
  const counterKeys = Object.keys(PerIpKeys);
  const keys = counterKeys.map(ckey => `c.${key}.${PerIpKeys[ckey]}`);
  const redis = yield select(state => state.redis);
  const counters = yield cps([redis, redis.mget], keys);
  counterKeys.forEach(function (ckey, i) {
    const strValue = counters[i];
    const value = strValue === null ? 0 : parseInt(strValue);
    entry[ckey] = value;
    total += value;
  });
  entry.total = total;
  yield put({type: 'SET_ENTRY', entry});
  if (!entry.hasOwnProperty('domains')) {
    yield fork(reverseLookup, key, ip);
  }
}

function* setEntryAction (action) {
  const redis = yield select(state => state.redis);
  if (action.action === '') {
    yield cps([redis, redis.del], `a.${action.key}`);
    yield cps([redis, redis.srem], 'action_set', action.key);
  } else {
    yield cps([redis, redis.set], `a.${action.key}`, action.action);
    yield cps([redis, redis.sadd], 'action_set', action.key);
  }
  yield put({type: 'RELOAD_ACTION_MAP'});
}

function* reverseLookup (key, ip) {
  let domains;
  try {
    domains = yield cps(dns.reverse, ip);
  } catch (ex) {
    domains = false;
  }
  yield put({type: 'UPDATE_ENTRY', key, update: {domains}});
}

function* minuteCron () {
  const channel = Ticker(60 * 1000);
  while (true) {
    yield take(channel);
    yield put({type: 'PRUNE_ENTRIES'});
  }
}

function* mainSaga () {
  yield take('START');
  yield takeLatest('RELOAD_ACTION_MAP', reloadActionMap);
  yield takeEvery('LOAD_ENTRY', loadEntry);
  yield takeEvery('CHANGE_ENTRY_ACTION', setEntryAction);
  yield fork(followActivityQueue);
  yield fork(minuteCron);
  yield call(reloadActionMap);
}

export default function start (redis) {
  const sagaMiddleware = sagaMiddlewareFactory();
  const store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware)
  );
  store.dispatch({type: 'INIT', redis});
  sagaMiddleware.run(mainSaga);
  return store;
};
