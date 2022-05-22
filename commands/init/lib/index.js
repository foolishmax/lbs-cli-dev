"use strict";

const fs = require("fs");
const path = require("path");
const userHome = require("user-home");
const Package = require("@lbs-cli-dev/package");
const fse = require("fs-extra");
const semver = require("semver");
const inquirer = require("inquirer");

const log = require("@lbs-cli-dev/log");
const Command = require("@lbs-cli-dev/command");
const { spinnerStart, sleep, execAsync } = require("@lbs-cli-dev/utils");

const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";

const getTemplate = require("./getTemplate");

const TEMPLATE_TYPE_NORMAL = "normal";
const TEMPLATE_TYPE_CUSTOM = "custom";

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || "";
    this.force = !!this._cmd.force;

    log.verbose("projectName", this.projectName);
    log.verbose("force", this.force);
  }

  async exec() {
    try {
      const projectInfo = await this.prepare();
      if (projectInfo) {
        log.verbose("projectInfo", projectInfo);
        this.projectInfo = projectInfo;
        await this.downloadTemplate();
        await this.installTemplate();
      }
    } catch (e) {
      log.error(e.message);
    }
  }

  async installTemplate() {
    if (this.templateInfo) {
      const type = this.templateInfo.type;
      if (!type) {
        this.templateInfo.type = TEMPLATE_TYPE_NORMAL;
      }
      if (type === TEMPLATE_TYPE_NORMAL) {
        await this.installNormalTemplate();
      } else if (type === TEMPLATE_TYPE_CUSTOM) {
        await this.installCustomTemplate();
      } else {
        throw new Error("unrecognized template type!");
      }
    } else {
      throw new Error("template information does not exist!");
    }
  }

  async installNormalTemplate() {
    const spinner = spinnerStart("installing...");
    await sleep();

    try {
      const templatePath = path.resolve(
        this.templateNpm.cacheFilePath,
        "template"
      );
      const targetPath = process.cwd();
      fse.ensureDirSync(templatePath);
      fse.ensureDirSync(targetPath);
      fse.copySync(templatePath, targetPath);
    } catch (e) {
      throw e;
    } finally {
      spinner.stop(true);
      log.success("install complete");
    }

    let installResultCode;
    const { installCMD, startCMD } = this.templateInfo;
    if (installCMD) {
      const [cmd, ...args] = installCMD.split(" ");
      installResultCode = await execAsync(cmd, args, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    }

    if (installResultCode !== 0) {
      throw new Error("dependencies failed during installation");
    }

    if (startCMD) {
      const [cmd, ...args] = startCMD.split(" ");
      await execAsync(cmd, args, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    }
  }

  async installCustomTemplate() {
    console.log("install custom template");
  }

  async downloadTemplate() {
    const { template } = this.projectInfo;
    const templateInfo = this.template.find(
      (item) => item.npmName === template
    );
    this.templateInfo = templateInfo;

    const { npmName, version } = templateInfo;
    const targetPath = path.resolve(userHome, ".lbs-cli", "template");
    const storePath = path.resolve(
      userHome,
      ".lbs-cli",
      "template",
      "node_modules"
    );
    const templateNpm = new Package({
      targetPath,
      storePath,
      packageName: npmName,
      packageVersion: version,
    });

    if (!(await templateNpm.exists())) {
      const spinner = spinnerStart("downloading...");
      await sleep();
      try {
        await templateNpm.install();
      } catch (e) {
        throw new Error(e);
      } finally {
        if (await templateNpm.exists()) {
          log.success("download complete");
          this.templateNpm = templateNpm;
        }
        spinner.stop(true);
      }
    } else {
      const spinner = spinnerStart("updating...");
      await sleep();
      try {
        await templateNpm.update();
      } catch (e) {
        throw new Error(e);
      } finally {
        if (await templateNpm.exists()) {
          log.success("update complete");
          this.templateNpm = templateNpm;
        }
        spinner.stop(true);
      }
    }
  }

  async prepare() {
    const template = await getTemplate();
    if (!template || !template.length) {
      throw new Error("template does not exist");
    }
    this.template = template;
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
    let projectInfo = {};
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
      const project = await inquirer.prompt([
        {
          type: "input",
          name: "_name",
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
          name: "_version",
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
        {
          type: "list",
          name: "_template",
          message: "请选择项目模版",
          choices: this.createTemplateChoice(),
        },
      ]);
      projectInfo = {
        type: _type,
        name: project._name,
        template: project._template,
        version: project._version,
      };
    }

    if (_type === TYPE_COMPONENT) {
    }

    return projectInfo;
  }

  createTemplateChoice() {
    return this.template.map((item) => ({
      value: item.npmName,
      name: item.name,
    }));
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
