
import {createStore, applyMiddleware} from 'redux';
import {END} from 'redux-saga';
import sagaMiddlewareFactory from 'redux-saga';
import {call, cps, put} from 'redux-saga/effects'
import Redis from 'redis';
import bluebird from 'bluebird';

bluebird.promisifyAll(Redis.RedisClient.prototype);
bluebird.promisifyAll(Redis.Multi.prototype);

const redis = Redis.createClient(process.env.REDIS_URL);

function reducer (state, action) {
  return state;
}

function redisGet (key) {
  return cps([redis, redis.get], 'version')
}

function hexToBytes (hex) {
  var bytes = [];
  for (var i = 0; i < hex.length; i += 2)
    bytes.push(parseInt(hex.substr(i, 2), 16));
  return bytes;
}

function* main () {
  let count = 0;
  const infoMap = {};
  while (true) {
    let key = yield cps([redis, redis.lpop], 'activity_queue');
    let infos = infoMap[key];
    const now = Date.now();
    if (!infos) {
      infos = infoMap[key] = {
        skipUntil: now + 60000,
        skipCount: 0
      };
    } else {
      if (now < infos.skipUntil) {
        infos.skipCount += 1;
        continue;
      }
      infos.skipUntil = now + 60000;
    }
    // console.log('key', key);
    if (!key) {
      console.log(`queue is empty after ${count} keys`);
      count = 0;
      key = yield cps([redis, redis.blpop], 'activity_queue', 0);
    }
    count += 1;
    var md = /^IP\(([0-9a-f]+)\)$/.exec(key);
    if (md) {
      const hexIp = md[1];
      const ip = hexToBytes(hexIp);
      const ipStr = ip.join('.');
      const checkPasswordTotal = parseInt(yield cps([redis, redis.get], `c.${key}.checkPassword.total`));
      if (checkPasswordTotal > 1000) {
        console.log('blacklisting ', hexIp, ipStr);
        yield cps([redis, redis.sadd], 'blacklist', hexIp);
        // yield cps([redis, redis.set], `a.${hexIp}`, 'b');
      }
    }
  }
}

const sagaMiddleware = sagaMiddlewareFactory();
const store = createStore(
  reducer,
  applyMiddleware(sagaMiddleware)
);
sagaMiddleware.run(main);
