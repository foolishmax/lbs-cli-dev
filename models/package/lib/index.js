'use strict';

const path = require('path');
const pkgDir = require('pkg-dir').sync;

const { isObject } = require('@lbs-cli-dev/utils');
const formatPath = require('@lbs-cli-dev/format-path');
class Package {
  constructor(options) {
    if (!options) {
      throw new Error('Package类的options参数不能为空！')
    }
    if (!isObject(options)) {
      throw new Error('Package类的options参数必须为对象！')
    }

    this.targetPath = options.targetPath;
    this.storePath = options.storePath;
    this.packageName = options.packageName;
    this.packageVersion = options.packageVersion;
  }

  exists() {

  }

  install() {

  }

  update() {

  }

  getRootFilePath() {
    const dir = pkgDir(this.targetPath);

    if (dir) {
      const pkgFile = require(path.resolve(dir, 'package.json'));

      if (pkgFile?.main) {
        // (macOS/Window)路径兼容
        return formatPath(path.resolve(dir, pkgFile?.main));
      }
    }

    return null;
  }
}

module.exports = Package;