'use strict';

const path = require('path');

module.exports = formatPath;

function formatPath(_path) {
  if (_path && typeof _path === 'string') {
    if (path.sep === '/') {
      return _path;
    } else {
      return _path.replace(/\\/g, '/');
    }
  }

  return _path;
}
