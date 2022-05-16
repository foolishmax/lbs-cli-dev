"use strict";

const log = require("@lbs-cli-dev/log");

const Command = require("@lbs-cli-dev/command");

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || "";
    this.force = !!this._cmd.force;

    log.verbose("projectName", this.projectName);
    log.verbose("force", this.force);
  }

  exec() {
    console.log("init 的业务逻辑");
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;
