'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const rootDir = path.resolve(path.dirname(__dirname));
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(rootDir, 'backend', 'views'));

const isDevelopment = process.env.NODE_ENV !== 'production';
console.log(`running in ${isDevelopment ? 'development' : 'production'} mode`);

const staticAssets = {
  // Static files (no build step) are served at /assets
  '/assets': {
    localPath: 'assets'
  },
  // Built files (transpiled js, minified css, etc) are served at /build
  '/build': {
    localPath: 'build'
  },
  // The package manager files are served at /jspm_packages
  '/jspm_packages': {
    localPath: 'jspm_packages',
    enabled: isDevelopment
  },
  // Source frontend files are served at /src
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

app.post('/api', function (req, res) {
  res.json({success: false});
});

const server = http.createServer(app);
const listen = process.env.LISTEN || 8001;
server.listen(listen);
console.log(`listening on ${listen}`);
