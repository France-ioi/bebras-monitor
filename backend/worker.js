

import Redis from 'redis';
import bluebird from 'bluebird';
import {createStore, applyMiddleware} from 'redux';
import {default as sagaMiddlewareFactory, END, delay} from 'redux-saga';
import {all, call, cps, select, put, take, fork, takeEvery, takeLatest, actionChannel} from 'redux-saga/effects'
import Ticker from 'redux-saga-ticker';
import Immutable from 'immutable';
import fs from 'fs';
import dns from 'dns';

import {getKeyIP} from './utils';
import LiveSet from './live_set';

bluebird.promisifyAll(Redis.RedisClient.prototype);
bluebird.promisifyAll(Redis.Multi.prototype);

const maxFetchInterval = 8000; // ms

const PerIpKeys = [
    'activity.pass',
    'answer.pass',
    'checkPassword.fail',
    'checkPassword.pass',
//    'checkPassword.total',
    'closeContest.pass',
    'createTeam.public',
    'createTeam.private',
//    'createTeam.total',
    'destroySession',
    'error',
    'getRemainingTime.fail',
    'getRemainingTime.pass',
//    'getRemainingTime.total',
    'loadContestData.pass',
    'loadIndex',
    'loadOther.data',
    'loadOther.fail',
//    'loadOther.total',
    'loadPublicGroups',
    'loadSession.found',
    'loadSession.new',
//    'loadSession.total',
    'request.total',
    'solutions.pass'
];

/*const PerIpKeys = {
  answer: 'answer.total',
  checkPassword: 'checkPassword.total',
  closeContest: 'closeContest.total',
  createTeam: 'createTeam.total',
  destroySession: 'destroySession',
  getRemainingTime: 'getRemainingTime.total',
  loadContestData: 'loadContestData.total',
  loadPublicGroups: 'loadPublicGroups',
  loadSession: 'loadSession.total',
  solutions: 'solutions.total',
  loadOther: 'loadOther.total',
  loadIndex: 'loadIndex',
  request: 'request.total'
};*/

function reducer (state, action) {
  switch (action.type) {
  case 'INIT':
    return {
      liveSet: new LiveSet(),
      liveSetCapacity: 1000,
      logs: [],
      redisUrl: action.redisUrl
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
  case 'ADD_LOG': {
    const {logs} = state;
    const {logMsg} = action;
    logs.unshift(logMsg);
    logs.slice(0, 50);
    return state;
  }
  default:
    return state;
  }
}

function* log(str) {
  const logMsg = '[' + (new Date()).toISOString().slice(0, 19) + '] ' + str;
  yield put({type: 'ADD_LOG', logMsg});
  console.log(logMsg);
}

function getEntryByKey (state, key) {
  return state.liveSet.get(key);
}

function* getRedisClient () {
  const url = yield select(state => state.redisUrl);
  return Redis.createClient(url);
}

function* reloadActionMap () {
  console.log('reloading action map');
  const redis = yield call(getRedisClient);
  const keys = yield cps([redis, redis.smembers], 'action_set');
  const actionMap = {};
  console.log('keys in action_set', keys);
  if (keys.length !== 0) {
    const actions = yield cps([redis, redis.mget], keys.map(key => `a.${key}`));
    var expiredActions = [];
    keys.forEach(function (key, i) {
      if(!actions[i]) {
        return;
      }
      actionMap[key] = {action: actions[i]};
    });
    for(var key in expiredActions) {
      yield put({type: 'CHANGE_ENTRY_ACTION', key, action: ''});
    }
  }
  yield put({type: 'UPDATE_ACTION_MAP', actionMap});
  // Ensure entries that have an action are loaded.
  yield all(keys.map(key => call(ensureEntryLoaded, key)));
}

function* ensureEntryLoaded (key) {
  const entry = yield select(getEntryByKey, key);
  if (!entry) {
    put({type: 'LOAD_ENTRY', key})
  }
}

function* followActivityQueue () {
  // Currently unused

  let count = 0, key, entry, now;
  const infoMap = {};
  const redis = yield call(getRedisClient);
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

function* loadEntryTask () {
  const redis = yield call(getRedisClient);
  while (true) {
    const action = yield take('LOAD_ENTRY');
    const {key} = action;
    const ip = getKeyIP(key);
    if (!ip) continue;
    // Preserve any data stored in the previous entry.
    const prevEntry = yield select(getEntryByKey, key);
    const entry = prevEntry ? {...prevEntry} : {key, ip};
    entry.updatedAt = Date.now();
    if(!entry.counters) { entry.counters = {}; }
    let total = 0;
//    const counterKeys = Object.keys(PerIpKeys);
    const keys = PerIpKeys.map(ckey => `c.${key}.${ckey}`);
    const counters = yield cps([redis, redis.mget], keys);
    PerIpKeys.forEach(function (ckey, i) {
      const strValue = counters[i];
      const value = strValue === null ? 0 : parseInt(strValue);
      entry.counters[ckey.replace('.', '_')] = value;
      total += value;
    });
    entry.total = total;
    yield put({type: 'SET_ENTRY', entry});
    if (!entry.hasOwnProperty('domains')) {
      yield fork(reverseLookup, key, ip);
    }
  }
}

function* setEntryAction (action) {
  const redis = yield call(getRedisClient);
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

function* analyzeShortTerm(ipKeyValues) {
  const actionMap = yield select(state => state.actionMap);
  for(var ip in ipKeyValues) {
    if(actionMap[ip]) {
//      console.log('skipped ' + ip + ' which has action ' + actionMap[ip].action);
      return;
    }

    // do something
//    var action = 'b';
//    yield put({type: 'CHANGE_ENTRY_ACTION', key: ip, action});
//    yield delay(10);
  }
}

function* analyzeLongTerm() {
  const liveSet = yield select(state => state.liveSet);
  const keySet = new Set();
  const allEntries = liveSet.getTopEntries();
  allEntries.forEach(key => keySet.add(key));
  const entries = liveSet.mget(keySet);
  for(var key in entries) {
    var entry = entries[key];

    // do something
//    var action = 'b';
//    yield put({type: 'CHANGE_ENTRY_ACTION', key: ip, action});
//    yield delay(10);
  }
}

function* liveUpdateWorker () {
  const channel = Ticker(1 * 1000);
  const redis = yield call(getRedisClient);
  const ipActionRegexp = /c\.(IP\([^)]*\))\.(.*)/;
  var lastTimestamp = null;
  var curTimestamp = null
  while(true) {
    // Wait for new timestamp to analyse
    while(lastTimestamp == curTimestamp) {
        yield take(channel);
        curTimestamp = Math.floor(Date.now() / 10000);
    }
    lastTimestamp = curTimestamp;

    // Lookup keys
    const timestampKey = 'd(' + (curTimestamp - 1) + ').c.IP*';
    const counterKeys = yield cps([redis, redis.keys], timestampKey);
    if(!counterKeys.length) { continue; }

    // Get counters
    const counterValues = yield cps([redis, redis.mget], counterKeys);
    var ipKeyValues = {};
    counterKeys.forEach(function (key, i) {
      const [, ip, action] = ipActionRegexp.exec(key);
      if(!ipKeyValues[ip]) { ipKeyValues[ip] = {}; }
      ipKeyValues[ip][action] = parseInt(counterValues[i]);
    });

    // Load updated counters
    for(var key in ipKeyValues) {
      yield put({type: 'LOAD_ENTRY', key});
    }

//    console.log(timestampKey);
//    console.log(ipKeyValues);
//    yield log('test');
    yield call(analyzeShortTerm, ipKeyValues);
  }
}

function* minuteCron () {
  const channel = Ticker(1 * 1000);
  while (true) {
    yield take(channel);
    yield call(analyzeLongTerm);
    yield put({type: 'PRUNE_ENTRIES'});
  }
}

function* findLiveClients () {
  const redis = yield call(getRedisClient);
  const ipActionRegexp = /c\.(IP\([^)]*\))/;

  const counterKeys = yield cps([redis, redis.keys], "c.IP(*");

  var ips = new Set();
  counterKeys.forEach(function(key, i) {
    const ip = ipActionRegexp.exec(key)[1];
    ips.add(ip);
  });

  console.log('Found ' + ips.size + ' clients');
  var puts = [];
  for(var key of ips) {
    yield put({type: 'LOAD_ENTRY', key});
    yield delay(100);
  }
}

function* mainSaga () {
  yield take('START');
  yield takeLatest('RELOAD_ACTION_MAP', reloadActionMap);
  yield fork(loadEntryTask);
  yield takeEvery('CHANGE_ENTRY_ACTION', setEntryAction);
  //yield fork(followActivityQueue);
  yield fork(liveUpdateWorker);
  yield fork(minuteCron);
  yield call(reloadActionMap);
  yield call(findLiveClients);
}

export default function start (redisUrl) {
  const sagaMiddleware = sagaMiddlewareFactory();
  const store = createStore(
    reducer,
    null,
    applyMiddleware(sagaMiddleware)
  );
  store.dispatch({type: 'INIT', redisUrl});
  console.log('starting main saga');
  sagaMiddleware.run(mainSaga);
  return store;
};
