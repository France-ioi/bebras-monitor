
import request from 'superagent';

export const asyncGetJson = function (path) {
  return new Promise(function (resolve, reject) {
    var req = request.get(path);
    req.end(function (err, res) {
      if (err || !res.ok)
        return reject({err, res});
      resolve(res.body);
    });
  });
};

export const asyncPostJson = function (path, body) {
  return new Promise(function (resolve, reject) {
    var req = request.post(path);
    if (body) {
      req.set('Accept', 'application/json');
      req.send(body);
    }
    req.end(function (err, res) {
      if (err || !res.ok)
        return reject({err, res});
      resolve(res.body);
    });
  });
};
