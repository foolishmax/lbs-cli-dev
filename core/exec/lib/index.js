'use strict';

const Package = require('@lbs-cli-dev/package');
const log = require('@lbs-cli-dev/log');

module.exports = exec;

const SETTINGS = {
  init: '@lbs-cli-dev/init'
}

function exec() {
  const targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  log.verbose('targetPath', targetPath);
  log.verbose('homePath', homePath);

  const cmd = arguments[arguments.length - 1];
  const cmdName = cmd.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'lastest';

  const pkg = new Package({
    targetPath,
    packageName,
    packageVersion,
  });
  console.log(pkg);
}
