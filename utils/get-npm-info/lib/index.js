'use strict';

const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver');

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getLastVersion,
  getDefaultRegistry
};

async function getLastVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  const gtVersions = getSemverVersions(baseVersion, versions);

  if (gtVersions?.length) {
    return gtVersions[0];
  }
}

function getSemverVersions(baseVersion, versions) {
  return versions
    .filter(version => semver.satisfies(version, `^${baseVersion}`))
    .sort((a, b) => semver.gt(b, a));
}

async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);

  if (data) {
    return Object.keys(data.versions);
  }

  return [];
}

function getNpmInfo(npmName, registry) {
  if (!npmName) {
    return null;
  }

  const registryUrl = registry || getDefaultRegistry();
  const npmUrl = urlJoin(registryUrl, npmName);

  return axios.get(npmUrl).then(response => {
    if (response.status === 200) {
      return response.data;
    }

    return null;
  }).catch(err => {
    return Promise.reject(err);
  })
}

function getDefaultRegistry(isOriginal = false) {
  return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org';
}
