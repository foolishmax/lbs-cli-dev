"use strict";

const path = require("path");
const Package = require("@lbs-cli-dev/package");
const log = require("@lbs-cli-dev/log");

module.exports = exec;

const SETTINGS = {
  // init: "@lbs-cli-dev/init",
  init: "@imooc-cli/init",
};

const CACHE_DIR = "dependencies";

async function exec() {
  const homePath = process.env.CLI_HOME_PATH;
  let targetPath = process.env.CLI_TARGET_PATH;
  let storePath = "";
  let pkg;
  log.verbose("targetPath", targetPath);
  log.verbose("homePath", homePath);

  const cmd = arguments[arguments.length - 1];
  const cmdName = cmd.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = "latest";

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR);
    storePath = path.resolve(targetPath, "node_modules");

    log.verbose("targetPath", targetPath);
    log.verbose("storePath", storePath);

    pkg = new Package({
      targetPath,
      storePath,
      packageName,
      packageVersion,
    });

    if (await pkg.exists()) {
      await pkg.update();
    } else {
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
  }

  const rootFile = pkg.getRootFilePath();

  if (rootFile) {
    try {
      require(rootFile).call(null, Array.from(arguments));
    } catch (e) {
      log.error(e.message);
    }
  }
}
