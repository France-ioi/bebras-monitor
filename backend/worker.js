

import Redis from 'redis';
import bluebird from 'bluebird';
import {createStore, applyMiddleware} from 'redux';
import {default as sagaMiddlewareFactory, END, delay} from 'redux-saga';
import {all, call, cps, select, put, take, fork, takeEvery, takeLatest, actionChannel} from 'redux-saga/effects'
import Ticker from 'redux-saga-ticker';
import Immutable from 'immutable';
import fs from 'fs';
import dns from 'dns';
import colors from 'colors/safe';
import * as math from 'mathjs';

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

const ConfigKeys = [
    'response_queue_size',
    'response_queue_size',
    'counters.local_cache_size',
    'counters.ttl',
    'counters.local_maximum',
    'counters.reload_interval',
    'counters.flush_interval',
    'counters.flush_ratio',
    'counters.debug',
    'counters.quiet',
    'activity_cache.max_entries',
    'activity_cache.threshold',
    'activity_cache.debug',
    'action_cache.max_entries',
    'action_cache.reload_interval',
    'action_cache.debug',
];

function reducer (state, action) {
  switch (action.type) {
  case 'INIT':
    return {
      config: {},
      liveSet: new LiveSet(),
      liveSetCapacity: 1000,
      logs: [],
      redisUrl: action.redisUrl,
      rules: {}
    };
  case 'LOAD':
    return {...state, liveSet: state.liveSet.mutated(function (copy) {
      copy.load(action.dump);
    })};
  case 'LOAD_RULES':
    return {...state, rules: action.rules};
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
  case 'UPDATE_CONFIG': {
    const {config} = action;
    return {...state, config};
  }
  case 'ADD_LOG': {
    const {logs} = state;
    const {logMsg} = action;
    logs.unshift(logMsg);
    logs = logs.slice(0, 100);
    return {...state, logs};
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
    if(!entry.ruleCounters) { entry.ruleCounters = {}; }
    let total = 0;
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

function* analyzeEntryRules(rules, entry, entryCounters, isLongTerm) {
  const ruleType = isLongTerm ? 'LT ' : 'ST ';
  for(var idx in rules) {
    const rule = rules[idx];
    const ruleValue = math.evaluate(rule.counter, entryCounters);
    if(isLongTerm) {
      entry.ruleCounters[rule.name] = ruleValue;
    }

    if(ruleValue >= 0) { continue; }

    var newAction = null;
    if(rule.action == 'log') {
      yield log(ruleType + 'rule "' + rule.label + '" -> ' + ruleValue + ' for ' + entry.key);
    } else if(rule.action == 'reset') {
      newAction = '';
    } else if(rule.action == 'reset-' && ['r', 'b'].includes(entry.action)) {
      newAction = '';
    } else if(rule.action && ['r', 'b', 'w', 'W'].includes(rule.action)) {
      newAction = rule.action;
    }
    if(newAction !== null && newAction != entry.action) {
      yield log('Action changed from \'' + entry.action + '\' to \'' + newAction + '\' for ' + entry.key + ' (' + ruleType + 'rule "' + rule.label + '" -> ' + ruleValue + ')');
      yield put({type: 'CHANGE_ENTRY_ACTION', key: entry.key, action});
      yield delay(10);
    }
  }
}

function* analyzeLongTerm() {
  const {liveSet, rules} = yield select(state => state);
  if(!rules.longterm) { return; }
  const entries = liveSet.dump();
  const analyzeAfter = Date.now() - 60 * 1000;
  for(var key in entries) {
    var entry = entries[key];
    if(!entry.counters || entry.updatedAt < analyzeAfter) { continue; }
    yield call(analyzeEntryRules, rules.longterm, entry, entry.counters, true);
  }
}

function* analyzeShortTerm(ipKeyValues) {
  const actionMap = yield select(state => state.actionMap);
  const rules = yield select(state => state.rules);
  if(!rules.shortterm) { return; }
  for(var ip in ipKeyValues) {
    const entry = yield select(getEntryByKey, ip);
    const shortEntry = entry ? entry : {key: ip, action: ''};
    PerIpKeys.map(key => {
      ipKeyValues[ip][key.replace('.', '_')] = 0;
    });
    yield call(analyzeEntryRules, rules.shortterm, shortEntry, ipKeyValues[ip]);
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
      ipKeyValues[ip][action.replace('.', '_')] = parseInt(counterValues[i]);
    });

    // Load updated counters
    for(var key in ipKeyValues) {
      yield put({type: 'LOAD_ENTRY', key});
    }

    yield call(analyzeShortTerm, ipKeyValues);
  }
}

function* refreshExpiry() {
  // Refresh expiry for all keys of a live client, to avoid some keys expiring
  // before others. If a client is in the liveSet, then it hasn't been pruned
  // yet and can be considered active.
  const redis = yield call(getRedisClient);
  const liveSet = yield select(state => state.liveSet);
  const expiryDate = Date.now() - 60 * 60 * 1000;
  const dump = liveSet.dump();
  for(var idx in dump) {
    const entry = dump[idx];
    for(var key in entry.counters) {
      if(entry.counters[key] == 0) { continue; }
      const curKey = 'c.' + entry.key + '.' + key.replace('_', '.');
//      console.log('Refreshing expiry for ' + curKey);
      yield cps([redis, redis.expire], curKey, 80 * 60);
    };
  };
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

function* loadConfig () {
  const redis = yield call(getRedisClient);
  const configMgetValues = yield cps([redis, redis.mget], ConfigKeys.map(key => 'config.' + key));
  var configValues = {};
  ConfigKeys.forEach(function (key, i) {
    configValues[key] = configMgetValues[i] || '';
  });
  yield put({type: 'UPDATE_CONFIG', config: configValues});
}

function* loadRules () {
  // Load rules from JSON
  try {
    const rulesStr = fs.readFileSync('rules.json', 'utf8');
    const rules = JSON.parse(rulesStr);
    yield put({type: 'LOAD_RULES', rules});
  } catch (ex) {
    console.log(colors.red('Error loading rules JSON'), ex);
  }
}

function* minuteCron () {
  const channel = Ticker(60 * 1000);
  var uptimeMinutes = 0;
  while (true) {
    yield take(channel);
    yield call(analyzeLongTerm);
    if(uptimeMinutes % 5 == 0) {
      yield put({type: 'PRUNE_ENTRIES'});
    }
    if(uptimeMinutes % 60 == 0) {
      yield call(refreshExpiry);
    }
    yield call(loadRules);
    uptimeMinutes++;
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
  yield call(loadConfig);
  yield call(loadRules);
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
