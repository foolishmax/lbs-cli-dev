'use strict';

module.exports = init;

function init(name, cmd) {
  console.log('init', name, process.env.CLI_TARGET_PATH);
}
