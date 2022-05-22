"use strict";

module.exports = {
  isObject,
  spinnerStart,
  sleep,
  exec,
  execAsync,
};

function isObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

function spinnerStart(message, spinnerStr = "|/-\\") {
  const Spinner = require("cli-spinner").Spinner;

  const spinner = new Spinner(message + " %s");
  spinner.setSpinnerString(spinnerStr);
  spinner.start();

  return spinner;
}

function sleep(timeout = 1000) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

function exec(command, args, options) {
  const win32 = process.platform === "win32";
  const cmd = win32 ? "cmd" : command;
  const cmdArgs = win32 ? ["/c"].concat(command, args) : args;

  return require("child_process").spawn(cmd, cmdArgs, options || {});
}

function execAsync(command, args, options) {
  return new Promise((resolve, reject) => {
    const res = exec(command, args, options);

    res.on("error", (e) => reject(e));

    res.on("exit", (c) => resolve(c));
  });
}
