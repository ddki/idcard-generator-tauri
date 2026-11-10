# 📄 更新日志

## [2.0.1](https://github.com/ddki/idcard-generator-tauri/compare/v2.0.0...v2.0.1) (2026-11-10)

### 🐛 修复缺陷 | A bug fix

- :bug: 修复年龄计算与历史记录写入的问题 ([d49e1f5](https://github.com/ddki/idcard-generator-tauri/commit/d49e1f5d023710b75cb2c50049a3dca073b68565))
- :bug: 修复闪屏可能一直停留的问题 ([49ba955](https://github.com/ddki/idcard-generator-tauri/commit/49ba9556ade4ba9cde4e5c209d2b295a0577f440))

### 📦️ 构建相关 | Changes that affect the build system or external dependencies

- :package: 同步权限变更后的 tauri schema ([875b1de](https://github.com/ddki/idcard-generator-tauri/commit/875b1de88275a89ec27de43df3f6335d1970959e))

### 🔨 其他修改 | Other changes that do not modify src or test files

- :lock: 启用 CSP 并精简插件权限 ([36a807d](https://github.com/ddki/idcard-generator-tauri/commit/36a807d450f3b8e2cec536e87332c0bd638a5004))
- **deps:** :arrow_up: 升级前后端依赖并修复已知漏洞 ([6d8c133](https://github.com/ddki/idcard-generator-tauri/commit/6d8c133d102c8e677522dfaaa56bbde27df3c205))

## [2.0.0](https://github.com/ddki/idcard-generator-tauri/compare/v0.1.13...v2.0.0) (2026-10-28)

### 📦️ 构建相关 | Changes that affect the build system or external dependencies

- :package: 版本号升至 `2.0.0`，与 Tauri 2 大版本对齐；`master` 此后按 `v2.x` 编号发布
- :package: Tauri v1 维护线改用独立分支 `tauri-v1`（版本自 `v1.0.0` 起），与本分支互不影响

### 🔨 其他修改 | Other changes that do not modify src or test files

- :hammer: 本次仅调整版本号与分支发版策略，功能与 `v0.1.13` 保持一致

## [0.1.13](https://github.com/ddki/idcard-generator-tauri/compare/v0.1.12...v0.1.13) (2026-10-28)

### ✨ 新增功能 | A new feature

- :sparkles: 支持人像照片选择与裁剪 ([c30a6d7](https://github.com/ddki/idcard-generator-tauri/commit/c30a6d7adcb79b50e074763d88f466186a20ded7))

### 📦️ 构建相关 | Changes that affect the build system or external dependencies

- :package: 同步 Cargo.lock 版本与 tauri 生成的 schema ([73ce620](https://github.com/ddki/idcard-generator-tauri/commit/73ce620a6e6c8d4c904169eb092d605da467507d))

### 🔨 其他修改 | Other changes that do not modify src or test files

- :hammer: 移除未使用的 JSX 工具链依赖 ([c31d68c](https://github.com/ddki/idcard-generator-tauri/commit/c31d68c23e842bdbe9eedce1bc3cbf66591d097a))

## [0.1.12](https://github.com/ddki/idcard-generator-tauri/compare/v0.1.11...v0.1.12) (2026-10-27)

### 🔨 其他修改 | Other changes that do not modify src or test files

- :hammer: 清理未使用依赖并优化开发期依赖预构建 ([cf24355](https://github.com/ddki/idcard-generator-tauri/commit/cf243550af9e0d8310ded5da4056c966e6d0a3ed))

## [0.1.11](https://github.com/ddki/idcard-generator-tauri/compare/v0.1.10...v0.1.11) (2026-10-27)

### ✨ 新增功能 | A new feature

- :sparkles: 完善设置弹窗、历史记录与自动更新 ([e9322f7](https://github.com/ddki/idcard-generator-tauri/commit/e9322f7d530f07fd7b2c7905cd34acbec8aa6486))

### 🐛 修复缺陷 | A bug fix

- :bug: use HKCU keypath for wix per-user install ([9e50c6f](https://github.com/ddki/idcard-generator-tauri/commit/9e50c6fce04b1c11f739b73efa73dada67b7e992))

### ♻️ 代码重构 | A code change that neither fixes a bug nor adds a feature

- :recycle: refine card viewers and add version utils ([16e8960](https://github.com/ddki/idcard-generator-tauri/commit/16e89602e25be2850f64501f03578bded3a52f11))

### 📦️ 构建相关 | Changes that affect the build system or external dependencies

- :package: eslint9 flat config and wix installer template ([6b0934f](https://github.com/ddki/idcard-generator-tauri/commit/6b0934f58b18f2444fe659fe03d71b83c3b87d51))

### 🎡 持续集成 | Changes to our CI configuration files and scripts

- :ferris_wheel: expand release matrix and upgrade github actions ([693a267](https://github.com/ddki/idcard-generator-tauri/commit/693a267816448df2c59f2ae9214cfa2fc0c00f61))

### 🔨 其他修改 | Other changes that do not modify src or test files

- **deps:** :arrow_up: upgrade tauri to 2.12.5 and refresh toolchain ([b4a4d52](https://github.com/ddki/idcard-generator-tauri/commit/b4a4d5226592075eebbd04aec181cb62a04a678f))

## [0.1.10](https://github.com/ddki/idcard-generator-tauri/compare/v0.1.9...v0.1.10) (2024-10-11)

### ✨ 新增功能 | A new feature

- :sparkles: upgrade tauri to 2.0.2 ([da6a566](https://github.com/ddki/idcard-generator-tauri/commit/da6a5662a47a2e7822fcc63376ba90ccdb0dd4d4))

## [0.1.9](https://github.com/ddki/idcard-generator-tauri/compare/v0.1.8...v0.1.9) (2024-05-31)

### 📦️ 构建相关 | Changes that affect the build system or external dependencies

- :package: update volta toolchain version ([7a8f0d9](https://github.com/ddki/idcard-generator-tauri/commit/7a8f0d917ab2a9e60b902ea28e7c528235e3a987))

### 🎡 持续集成 | Changes to our CI configuration files and scripts

- :ferris_wheel: upgrade github action pnpm v8-v9, nodejs to v21 ([f337bef](https://github.com/ddki/idcard-generator-tauri/commit/f337befb2c0d9c5916c117e7a4a30f8152313229))

### 🔨 其他修改 | Other changes that do not modify src or test files

- :hammer: upgrade dependencies version ([d4343a6](https://github.com/ddki/idcard-generator-tauri/commit/d4343a6c571419538920520004114ed967c87bd0))

## [0.1.8](https://github.com/ddki/idcard-generator-tauri/compare/v0.1.7...v0.1.8) (2024-02-27)

## [0.1.7](https://github.com/ddki/idcard-generator-tauri/compare/v0.1.6...v0.1.7) (2024-02-26)

## [0.1.6](https://github.com/ddki/idcard-generator-tauri/compare/...v0.1.6) (2024-02-26)

### ✨ 新增功能 | A new feature

- :sparkles: upgrade tauri2,refactor,ui,ci,etc ([f08e3db](https://github.com/ddki/idcard-generator-tauri/commit/f08e3db2b771afdd5a3aa45c8a0d4be656283d27))
- **web:** :sparkles: add google analytics support ([9d967be](https://github.com/ddki/idcard-generator-tauri/commit/9d967be535c3a6f5ee2171311a678c7a823863f8))

### 🎡 持续集成 | Changes to our CI configuration files and scripts

- :ferris_wheel: support github action page ([386d557](https://github.com/ddki/idcard-generator-tauri/commit/386d5578ee3ed2807a31548db5f1dde973263bc5))

## [0.1.5](///compare/v0.1.4...v0.1.5) (2023-06-15)

### 🐛 修复缺陷 | A bug fix

- :bug: 无法加载图片；菜单外部链接地址错误 d5eb414

## 0.1.4 (2023-06-15)

### 📝 文档更新 | Documentation only changes

- :memo: remove gif 81b5d95

### ♻️ 代码重构 | A code change that neither fixes a bug nor adds a feature

- :recycle: 迁移代码 1 fc93aaa
- :recycle: upgrade tauri2、 tauri-vite-app-template 66e027f

### ✨ 新增功能 | A new feature

- :sparkles: 从 master 迁移功能性代码，布局调整，程序后台常驻等 4a53394

### 🐛 修复缺陷 | A bug fix

- :bug: ts replaceAll()方法异常，闪屏，v-md-editor fcc567f
