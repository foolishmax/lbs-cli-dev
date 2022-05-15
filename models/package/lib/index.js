"use strict";

const path = require("path");
const pkgDir = require("pkg-dir").sync;
const pathExists = require("path-exists").sync;
const npmInstall = require("npminstall");
const fse = require("fs-extra");

const { isObject } = require("@lbs-cli-dev/utils");
const formatPath = require("@lbs-cli-dev/format-path");
const {
  getDefaultRegistry,
  getNpmLatestVersion,
} = require("@lbs-cli-dev/get-npm-info");

class Package {
  constructor(options) {
    if (!options) {
      throw new Error("Package类的options参数不能为空！");
    }
    if (!isObject(options)) {
      throw new Error("Package类的options参数必须为对象！");
    }

    this.targetPath = options.targetPath;
    this.storePath = options.storePath;
    this.packageName = options.packageName;
    this.packageVersion = options.packageVersion;
    this.cacheFilePathPrefix = this.packageName.replace("/", "_");
  }

  get cacheFilePath() {
    return path.resolve(
      this.storePath,
      `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`
    );
  }

  async prepare() {
    if (this.storePath && !pathExists(this.storePath)) {
      fse.mkdirpSync(this.storePath);
    }

    if (this.packageVersion === "latest") {
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }
  }

  async exists() {
    if (this.storePath) {
      await this.prepare();

      return pathExists(this.cacheFilePath);
    } else {
      return pathExists(this.targetPath);
    }
  }

  async install() {
    await this.prepare();
    npmInstall({
      root: this.targetPath,
      storeDir: this.storePath,
      registry: getDefaultRegistry(),
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
    });
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(
      this.storePath,
      `_${this.cacheFilePath}@${packageVersion}@${this.packageName}`
    );
  }

  async update() {
    await this.prepare();

    const latestPackageVersion = await getNpmLatestVersion(this.packageName);
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);

    if (!pathExists(latestFilePath)) {
      await npmInstall({
        root: this.targetPath,
        storeDir: this.storePath,
        registry: getDefaultRegistry(),
        pkgs: [
          {
            name: this.packageName,
            version: latestPackageVersion,
          },
        ],
      });
    }

    this.packageVersion = latestPackageVersion;
  }

  getRootFilePath() {
    function _getRootFile(targetPath) {
      const dir = pkgDir(targetPath);

      if (dir) {
        const pkgFile = require(path.resolve(dir, "package.json"));

        if (pkgFile?.main) {
          // (macOS/Window)路径兼容
          return formatPath(path.resolve(dir, pkgFile?.main));
        }
      }

      return null;
    }

    if (this.storePath) {
      return _getRootFile(this.cacheFilePath);
    } else {
      return _getRootFile(this.targetPath);
    }
  }
}

module.exports = Package;
