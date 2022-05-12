# [lerna](https://github.com/lerna/lerna) 开发脚手架流程

## 脚手架项目初始化

- 初始化 npm 项目
  ```
  npm init -y
  ```
- 安装 lerna
  ```
  npm i -D lerna
  ```
- lerna 初始化项目
  ```
  lerna init
  ```

## 创建 package

- 创建包
  ```
  $ lerna create <name> [loc]
  ```
- 安装依赖

  ```
  // 默认安装所有的包中
  // 可以通过lerna add -h 查看其中的 Examples
  $ lerna add <package>[@version] [--dev] [--exact] [--peer]
  ```

- 链接依赖
  ```
  $ lerna link
  ```

## 脚手架开发和测试

- 执行 shell 脚本

  ```
  // 执行上下文是packages目录
  // lerna exec -- rm -rf node_modules/  该命令会在所有package中执行删除node_modules的操作
  lerna exec

  ```

- 执行 npm 命令
  ```
  lerna run
  ```
- 清空依赖
  ```
  lerna clean
  ```
- 重装依赖
  ```
  lerna bootstrap
  ```

## 脚手架发布上线

- 版本控制
  ```
  lerna version
  bump version
  ```
- 查看上版本以来的所有变更
  ```
  lerna changed
  ```
- 查看 diff
  ```
  lerna diff
  ```
- 项目发布
  ```
  lerna publish
  ```
