"use strict";

module.exports = core;

const path = require("path");
const semver = require("semver");
const colors = require("colors/safe");
const log = require("@lbs-cli-dev/log");
const pathExists = require("path-exists").sync;
const userHome = require("user-home");
const commander = require("commander");

const init = require("@lbs-cli-dev/init");
const exec = require("@lbs-cli-dev/exec");

const pkg = require("./package.json");
const constant = require("./lib/const");

const cp = require("child_process");

const program = new commander.Command();

async function core() {
  try {
    await prepare();
    registerCommand();

    cp.exec("ls -al", function (err, stdout, stderr) {
      console.log(err, stdout, stderr);
    });
  } catch (e) {
    log.error(e.message);

    if (process.env.LOG_LEVEL === "verbose") {
      console.log(e);
    }
  }
}

async function prepare() {
  checkPkgVersion();
  checkRoot();
  checkUserHome();
  checkEnv();
  await checkGlobalUpdate();
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", false)
    .option("-tp, --targetPath <path>", "是否指定本地调试文件路径", "");

  program
    .command("init [projectName]")
    .option("-f, --force", "是否强制初始化项目")
    .action(exec);

  program.on("option:targetPath", function () {
    process.env.CLI_TARGET_PATH = program.targetPath;
  });

  // 开启debug模式
  program.on("option:debug", function () {
    process.env.LOG_LEVEL = "verbose";
    log.level = process.env.LOG_LEVEL;
  });

  // 未知命令处理
  program.on("command:*", function (obj) {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    console.log(colors.red("未知的命令：" + obj[0]));
    availableCommands.length &&
      console.log(colors.red("可用命令：" + availableCommands.join(",")));
  });

  if (program.args?.length < 1) {
    program.outputHelp();
    console.log();
  }

  program.parse(process.argv);
}

async function checkGlobalUpdate() {
  const { getLastVersion } = require("@lbs-cli-dev/get-npm-info");
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  const lastVersion = await getLastVersion(currentVersion, npmName);

  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      "更新提示",
      colors.yellow(`请手动更新 ${npmName} ，当前版本：${currentVersion}，最新版本：${lastVersion}
更新命令：npm install -g ${npmName}`)
    );
  }
}

function checkEnv() {
  const dotenv = require("dotenv");
  const dotenvPath = path.resolve(userHome, ".env");

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
    cliConfig["cliHome"] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig["cliHome"] = path.join(userHome, constant.DEFAULT_CLI_HOME);
  }

  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red("当前登录用户主目录不存在！"));
  }
}

function checkRoot() {
  const rootCheck = require("root-check");
  rootCheck();
}

function checkPkgVersion() {
  log.info("cli", pkg.version);
}
