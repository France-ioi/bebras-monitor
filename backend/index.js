'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import Redis from 'redis';
import colors from 'colors/safe';

import Worker from './worker';

const isDevelopment = process.env.NODE_ENV !== 'production';
console.log(`running in ${isDevelopment ? colors.red('development') : colors.green('production')} mode`);

const rootDir = path.resolve(path.dirname(__dirname));
const app = express();
const redis = Redis.createClient(process.env.REDIS_URL);
const workerStore = Worker();

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

app.get('/top', function (req, res) {
  const {liveSet} = workerStore.getState();
  res.json(liveSet.view(parseInt(req.query.count)));
});

function onSignal (options, err) {
  if (options.dump) {
    const {liveSet} = workerStore.getState();
    const dump = liveSet.view();
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
process.on('uncaughtException', onSignal.bind(null, {exit: true, status: 1, dump: 'alt', source: 'EXCEPT'}));

try {
  const dumpStr = fs.readFileSync('dump.json', 'utf8');
  const dump = JSON.parse(dumpStr);
  workerStore.dispatch({type: 'LOAD', dump});
  const count = workerStore.getState().liveSet.size();
  console.log(colors.green(`loaded ${count} entries`));
  workerStore.dispatch({type: 'START'});
} catch (ex) {
  console.log(colors.red('no dump found'), ex);
}

const server = http.createServer(app);
const listen = process.env.LISTEN || 8001;
server.listen(listen);
console.log(`listening on ${colors.bold(listen)}`);
