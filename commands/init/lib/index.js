"use strict";

const fs = require("fs");
const fse = require("fs-extra");
const inquirer = require("inquirer");

const log = require("@lbs-cli-dev/log");
const Command = require("@lbs-cli-dev/command");

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || "";
    this.force = !!this._cmd.force;

    log.verbose("projectName", this.projectName);
    log.verbose("force", this.force);
  }

  async exec() {
    try {
      const ret = await this.prepare();
      console.log("ret", ret);
    } catch (e) {
      log.error(e.message);
    }
  }

  async prepare() {
    const localPath = process.cwd();

    if (!this.isDirEmpty(localPath)) {
      let _continue = false;

      if (!this.force) {
        _continue = (
          await inquirer.prompt({
            type: "confirm",
            name: "_continue",
            default: false,
            message: "当前文件夹不为空，是否继续创建项目？",
          })
        )._continue;

        if (!_continue) return;
      }

      if (_continue || this.force) {
        const { _confirmDelete } = await inquirer.prompt({
          type: "confirm",
          name: "_confirmDelete",
          fault: false,
          message: "是否确认清空当前目录下的文件？",
        });

        if (_confirmDelete) {
          fse.emptyDirSync(localPath);
        }
      }
    }
  }

  isDirEmpty(localPath) {
    let fileList = fs.readdirSync(localPath);
    fileList = fileList.filter(
      (file) => !file.startsWith(".") && ["node_modules"].indexOf(file) < 0
    );

    return !fileList || !fileList.length;
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;
