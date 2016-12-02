'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import Redis from 'redis';
import bluebird from 'bluebird';
import colors from 'colors/safe';

import Worker from './worker';

const isDevelopment = process.env.NODE_ENV !== 'production';
console.log(`running in ${isDevelopment ? colors.red('development') : colors.green('production')} mode`);

bluebird.promisifyAll(Redis.RedisClient.prototype);
bluebird.promisifyAll(Redis.Multi.prototype);
const redis = Redis.createClient(process.env.REDIS_URL);

const rootDir = path.resolve(path.dirname(__dirname));
const app = express();
const workerStore = Worker(redis);

app.set('view engine', 'pug');
app.set('views', path.join(rootDir, 'backend', 'views'));
if (!isDevelopment) {
  app.use(compression());
}

const staticAssets = {
  // Static files (no build step) are served at /assets.
  '/assets': {
    localPath: 'assets'
  },
  // Built files (transpiled js, minified css, etc) are served at /build.
  '/build': {
    localPath: 'build'
  },
  // The package manager files are served at /jspm_packages.
  // This is needed in production for dependency assets (fonts, images, css).
  '/jspm_packages': {
    localPath: 'jspm_packages'
  },
  // Source frontend files are served at /src.
  '/src': {
    localPath: 'frontend',
    enabled: isDevelopment
  }
};
Object.keys(staticAssets).forEach(function (urlPath) {
  const options = staticAssets[urlPath];
  if ('enabled' in options && !options.enabled) {
    return;
  }
  let fullPath = path.join(rootDir, options.localPath);
  // console.log('static', urlPath, fullPath);
  app.use(urlPath, express.static(fullPath));
});

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.render('index', {development: isDevelopment});
});

app.post('/refresh', function (req, res) {
  const query = req.body;
  const {max_top_entries} = query;
  const view = {};
  const {liveSet, actionMap} = workerStore.getState();
  const keySet = new Set();
  // TODO: get entries from actionMap
  const actionKeys = Object.keys(actionMap);
  actionKeys.forEach(key => keySet.add(key));
  if (max_top_entries) {
    // XXX make topEntries a list of keys, adding entries to view.entries object
    view.topEntries = liveSet.getTopEntries(parseInt(max_top_entries));
    view.topEntries.forEach(key => keySet.add(key));
  }
  const entries = view.entries = liveSet.mget(keySet);
  actionKeys.forEach(function (key) {
    const infos = actionMap[key];
    entries[key] = {...entries[key], action: infos.action};
  });
  res.json(view);
});

app.post('/setAction', function (req, res) {
  const query = req.body;
  const {key, action} = query;
  workerStore.dispatch({type: 'CHANGE_ENTRY_ACTION', key, action});
  res.end();
});

function onSignal (options, err) {
  if (options.source === 'EXCEPT') {
    console.log(err);
  }
  if (options.dump) {
    const {liveSet} = workerStore.getState();
    const dump = liveSet.dump();
    const dumpStr = JSON.stringify(dump);
    const dumpFn = options.dump === 'alt' ? 'alt_dump.json' : 'dump.json';
    fs.writeFileSync(dumpFn, dumpStr, 'utf8');
    console.log(colors.green(`saved ${dump.length} entries`));
  }
  if (options.exit) {
    process.exit(options.status || 0);
  }
}
process.on('exit', onSignal.bind(null, {source: 'exit'}));
process.on('SIGINT', onSignal.bind(null, {exit: true, status: 1, dump: true, source: 'INT'}));
process.on('SIGHUP', onSignal.bind(null, {exit: true, status: 0, dump: true, source: 'HUP'}));
process.on('SIGUSR1', onSignal.bind(null, {exit: false, dump: true, source: 'USR1'}));
process.on('uncaughtException', onSignal.bind(null, {exit: true, status: 1, dump: 'alt', source: 'EXCEPT'}));

try {
  const dumpStr = fs.readFileSync('dump.json', 'utf8');
  const dump = JSON.parse(dumpStr);
  workerStore.dispatch({type: 'LOAD', dump});
  const count = workerStore.getState().liveSet.size();
  console.log(colors.green(`loaded ${count} entries`));
} catch (ex) {
  console.log(colors.red('no dump found'), ex);
}
workerStore.dispatch({type: 'START'});

const server = http.createServer(app);
const listen = process.env.LISTEN || 8001;
server.listen(listen);
console.log(`PID ${process.pid} listening on ${colors.bold(listen)}`);
