'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import Redis from 'redis';

import Worker from './worker';

const isDevelopment = process.env.NODE_ENV !== 'production';
console.log(`running in ${isDevelopment ? 'development' : 'production'} mode`);

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
  console.log('static', urlPath, fullPath);
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

//   return redis.mget(keys, function (err, values) {...}

const server = http.createServer(app);
const listen = process.env.LISTEN || 8001;
server.listen(listen);
console.log(`listening on ${listen}`);
