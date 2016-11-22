
import {createStore, applyMiddleware} from 'redux';
import {END} from 'redux-saga';
import sagaMiddlewareFactory from 'redux-saga';
import {call, cps, select, put, take, fork} from 'redux-saga/effects'
import Ticker from 'redux-saga-ticker';
import Redis from 'redis';
import bluebird from 'bluebird';
import Immutable from 'immutable';
import fs from 'fs';
import dns from 'dns';

import LiveSet from './live_set';

bluebird.promisifyAll(Redis.RedisClient.prototype);
bluebird.promisifyAll(Redis.Multi.prototype);

const redis = Redis.createClient(process.env.REDIS_URL);

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
      liveSetCapacity: 1000
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
  default:
    return state;
  }
}

function getElementByKey (state, key) {
  return state.liveSet.get(key);
}

function hexToBytes (hex) {
  var bytes = [];
  for (var i = 0; i < hex.length; i += 2)
    bytes.push(parseInt(hex.substr(i, 2), 16));
  return bytes;
}

function* followActivityQueue () {
  let count = 0, key, element, now;
  const infoMap = {};
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
    element = yield select(getElementByKey, key);
    now = Date.now();
    if (element && now < element.updatedAt + 60000) {
      // TODO: schedule a fetch at updatedAt + 60s
      continue;
    }
    yield put({type: 'FETCH', key});
  }
}

function* fetchCounters () {
  while (true) {
    let {key} = yield take('FETCH');
    let md = /^IP\(([0-9a-f]+)\)$/.exec(key);
    if (md) {
      yield call(fetchIpCounters, key, md[1]);
    }
  }
}

function* fetchIpCounters (key, hexIp) {
  const ip = hexToBytes(hexIp);
  const ipStr = ip.join('.');
  const now = Date.now();
  // Preserve any data stored in the previous entry.
  const prevEntry = yield select(getElementByKey, key);
  const entry = prevEntry ? {...prevEntry, updatedAt: now} : {key: key, ip: ipStr, total: 0, updatedAt: now};
  const counterKeys = Object.keys(PerIpKeys);
  const keys = counterKeys.map(ckey => `c.${key}.${PerIpKeys[ckey]}`);
  const counters = yield cps([redis, redis.mget], keys);
  counterKeys.forEach(function (ckey, i) {
    const strValue = counters[i];
    const value = strValue === null ? 0 : parseInt(strValue);
    entry[ckey] = value;
    entry.total += value;
  });
  yield put({type: 'SET_ENTRY', entry});
  if (!entry.hasOwnProperty('domains')) {
    yield fork(reverseLookup, key, ipStr);
  }
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
  yield fork(followActivityQueue);
  yield fork(fetchCounters);
  yield fork(minuteCron);
}

export default function start () {
  const sagaMiddleware = sagaMiddlewareFactory();
  const store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware)
  );
  store.dispatch({type: 'INIT'});
  sagaMiddleware.run(mainSaga);
  return store;
};
