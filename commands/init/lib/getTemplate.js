const request = require("@lbs-cli-dev/request");

module.exports = function () {
  return request({
    url: `/project/template`,
  });
};
