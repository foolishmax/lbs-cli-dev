'use strict';

const Package = require('@lbs-cli-dev/package');

module.exports = exec;

function exec() {
  const pkg = new Package();
  console.log(pkg);
  console.log(process.env.CLI_TARGET_PATH);
}
