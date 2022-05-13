#!/usr/bin/env node

const importLocal = require("import-local");

if (importLocal(__filename)) {
  require('npmlog').info('cli', 'using local version of lbs-cli-dev')
} else {
  require('.')(process.argv.slice(2));
}