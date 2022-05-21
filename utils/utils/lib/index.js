"use strict";

module.exports = {
  isObject,
  spinnerStart,
  sleep,
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
