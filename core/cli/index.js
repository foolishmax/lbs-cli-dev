'use strict';

module.exports = core;

const sermver = require('semver');
const colors = require('colors/safe');
const log = require('@lbs-cli-dev/log');
const pathExists = require('path-exists').sync;
const userHome = require('user-home');

const pkg = require('./package.json');
const constant = require('./lib/const');

let args;

function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkInputArgs();
  } catch(e) {
    log.error(e.message);
  }
}

function checkInputArgs() {
  const minimist = require('minimist');
  args = minimist(process.argv.slice(2));

  checkArgs();
}

function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose';
  } else {
    process.env.LOG_LEVEL = 'info';
  }
  log.level = process.env.LOG_LEVEL;
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在！'));
  }
}

function checkRoot() {
  const rootCheck = require('root-check');
  rootCheck();
}

function checkNodeVersion() {
  const currentVersion = process.version;
  const lowestNodeVersion = constant.LOWEST_NODE_VERSION;

  if (!sermver.gte(currentVersion, lowestNodeVersion)) {
    throw new Error(colors.red(`lbs-cli-dev 需要安装 v${lowestNodeVersion} 以上版本的 Node.js`))
  }
}

function checkPkgVersion() {
  log.info('cli', pkg.version)
}
