'use strict';

const { isObject } = require('@lbs-cli-dev/utils');

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

  getRootFile() {

  }
}

module.exports = Package;