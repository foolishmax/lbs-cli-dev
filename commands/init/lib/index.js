"use strict";

const fs = require("fs");
const fse = require("fs-extra");
const semver = require("semver");
const inquirer = require("inquirer");

const log = require("@lbs-cli-dev/log");
const Command = require("@lbs-cli-dev/command");

const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";

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

    return this.getProjectInfo();
  }

  async getProjectInfo() {
    const projectInfo = {};
    const { _type } = await inquirer.prompt({
      type: "list",
      message: "请选择初始化类型",
      name: "_type",
      default: TYPE_PROJECT,
      choices: [
        {
          name: "项目",
          value: TYPE_PROJECT,
        },
        {
          name: "组件",
          value: TYPE_COMPONENT,
        },
      ],
    });

    if (_type === TYPE_PROJECT) {
      const o = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "请输入项目名称",
          default: "",
          validate: function (v) {
            const done = this.async();
            const valid =
              /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(
                v
              );
            setTimeout(() => {
              if (!valid) {
                done("请输入合法的名称");
                return;
              }
              done(null, true);
            }, 0);
          },
          filter: function (v) {
            return v;
          },
        },
        {
          type: "input",
          name: "projectVersion",
          message: "请输入项目版本号",
          default: "1.0.0",
          validate: function (v) {
            const done = this.async();
            setTimeout(() => {
              if (!Boolean(semver.valid(v))) {
                done("请输入合法的版本号");
                return;
              }
              done(null, true);
            }, 0);
          },
          filter: function (v) {
            return !!semver.valid(v) ? semver.valid(v) : v;
          },
        },
      ]);
      console.log(o);
    }

    if (_type === TYPE_COMPONENT) {
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
