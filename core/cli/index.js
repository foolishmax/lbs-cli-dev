'use strict';

module.exports = core;

const path = require('path');
const semver = require('semver');
const colors = require('colors/safe');
const log = require('@lbs-cli-dev/log');
const pathExists = require('path-exists').sync;
const userHome = require('user-home');
const dedent = require('dedent');

const pkg = require('./package.json');
const constant = require('./lib/const');

let args;

async function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkInputArgs();
    checkEnv();
    checkGlobalUpdate();
  } catch(e) {
    log.error(e.message);
  }
}

async function checkGlobalUpdate() {
  const {getLastVersion} = require('@lbs-cli-dev/get-npm-info');
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  const lastVersion = await getLastVersion(currentVersion, npmName)

  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn('更新提示',colors.yellow(`请手动更新 ${npmName} ，当前版本：${currentVersion}，最新版本：${lastVersion}
更新命令：npm install -g ${npmName}`));
  }
}

function checkEnv() {
  const dotenv = require('dotenv');
  const dotenvPath = path.resolve(userHome, '.env');

  if (pathExists(dotenvPath)) {
    dotenv.config({
      path: dotenvPath,
    });
  }
  createDefaultConfig();
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  };

  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME)
  }

  process.env.CLI_HOME_PATH = cliConfig.cliHome;
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

  if (!semver.gte(currentVersion, lowestNodeVersion)) {
    throw new Error(colors.red(`lbs-cli-dev 需要安装 v${lowestNodeVersion} 以上版本的 Node.js`))
  }
}

function checkPkgVersion() {
  log.info('cli', pkg.version)
}
