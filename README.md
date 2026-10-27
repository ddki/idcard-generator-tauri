<div align="center" id="top"> 
  <img src="./public/favicon.ico" alt="Idcard Generator" />

&#xa0;

<a href="https://ddki.github.io/idcard-generator-tauri/">Online</a>

</div>

<h1 align="center">Idcard Generator</h1>

<p align="center">
  <a href="https://github.com/ddki/idcard-generator-tauri/releases">
    <img alt="Github release" src="https://img.shields.io/github/release/ddki/idcard-generator-tauri">
  </a>

  <a href="#">
    <img alt="Github top language" src="https://img.shields.io/github/languages/top/ddki/idcard-generator-tauri">
  </a>

  <a href="#">
    <img alt="Github language count" src="https://img.shields.io/github/languages/count/ddki/idcard-generator-tauri">
  </a>

  <a href="#">
    <img alt="Repository size" src="https://img.shields.io/github/repo-size/ddki/idcard-generator-tauri">
  </a>

  <a href="https://github.com/ddki/idcard-generator-tauri/blob/master/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/ddki/idcard-generator-tauri">
  </a>

  <a href="https://github.com/ddki/idcard-generator-tauri/issues">
    <img alt="Github issues" src="https://img.shields.io/github/issues/ddki/idcard-generator-tauri" />
  </a>

  <a href="https://github.com/ddki/idcard-generator-tauri/forks">
    <img alt="Github forks" src="https://img.shields.io/github/forks/ddki/idcard-generator-tauri" />
  </a>

  <a href="https://github.com/ddki/idcard-generator-tauri/stargazers">
    <img alt="Github stars" src="https://img.shields.io/github/stars/ddki/idcard-generator-tauri" />
  </a>
</p>

<!-- Status -->

<!-- <h4 align="center">
	🚧  Idcard Generator 🚀 Under construction...  🚧
</h4>

<hr> -->

<p align="center">
  <a href="#dart-about">About</a> &#xa0; | &#xa0; 
  <a href="#computer-system-support">System Support</a> &#xa0; | &#xa0;
  <a href="#sparkles-features">Features</a> &#xa0; | &#xa0;
  <a href="#rocket-technologies">Technologies</a> &#xa0; | &#xa0;
  <a href="#white_check_mark-requirements">Requirements</a> &#xa0; | &#xa0;
  <a href="#checkered_flag-starting">Starting</a> &#xa0; | &#xa0;
  <a href="#memo-license">License</a> &#xa0; | &#xa0;
  <a href="https://github.com/ddki" target="_blank">Author</a>
</p>

<br>

## :dart: About

中国居民身份证生成工具。

项目基于 tauri 开发。 Windows 运行依赖于 MicrosoftEdgeWebView2Runtime，Windows10 2004 版本以后系统内置 WebView2Runtime，之前版本系统需要安装它， 官方下载地址：https://developer.microsoft.com/zh-cn/microsoft-edge/webview2/#download-section

各系统与 CPU 架构的支持情况见 [System Support](#computer-system-support)。

## :computer: System Support

发布包由 GitHub Actions 在 `windows-latest`、`macos-latest`、`ubuntu-22.04`、`ubuntu-22.04-arm` 上构建，因此：

- Linux 产物基于 Ubuntu 22.04 编译，要求 **glibc ≥ 2.35**，并依赖 **webkit2gtk-4.1 + libsoup3**；
- Linux arm64 构建使用 GitHub 的 arm runner，**仅公开仓库可用**；
- 每个平台同时提供 **x86_64(amd64)** 与 **arm64(aarch64)** 产物（Windows 仅 x64）。

| 系统                               | 架构                  | 支持 | 说明                                                                   |
| ---------------------------------- | --------------------- | ---- | ---------------------------------------------------------------------- |
| Windows 10 2004+ / Windows 11      | x64                   | ✅   | 依赖 WebView2 Runtime，Win10 2004 起系统内置                           |
| macOS 10.15+                       | arm64 (Apple Silicon) | ✅   | dmg / app                                                              |
| macOS 10.15+                       | x86_64 (Intel)        | ✅   | dmg / app，在 Apple Silicon runner 上交叉编译                          |
| Ubuntu 22.04+                      | x86_64 / arm64        | ✅   | deb / rpm / AppImage                                                   |
| Debian 12+                         | x86_64 / arm64        | ✅   | 使用 deb 包                                                            |
| deepin 23+                         | x86_64 / arm64        | ✅   | Debian 12 底座，使用 deb 包                                            |
| 统信 UOS V25（2500）               | x86_64 / arm64        | ✅   | Debian 12 底座，使用 deb 包                                            |
| 麒麟 V11                           | x86_64 / arm64        | ✅   | Debian 12 底座，使用 deb 包                                            |
| deepin 20.x（20.1 ~ 20.9）         | —                     | ❌   | Debian 10 底座、glibc 2.28、webkit2gtk-4.0，低于构建基线               |
| 统信 UOS V20（1050 / 1060 / 1070） | —                     | ❌   | Debian 10 底座、glibc 2.28、webkit2gtk-4.0，Tauri v2 应用无法运行      |
| 麒麟 V10（SP1 / SP2 / SP3）        | —                     | ❌   | Debian 10 底座、glibc 2.28、webkit2gtk-4.0，低于构建基线               |
| Fedora                             | x86_64 / arm64        | ⚠️   | 提供 rpm 产物，但未在 Fedora 上实机验证，依赖包名可能与 rpm 声明不一致 |

> 说明：Linux 依赖库缺失时，deb 可通过 `sudo apt install -y libwebkit2gtk-4.1-0 libayatana-appindicator3-1` 补齐。

### 程序版本与国产系统对照

下表根据仓库 git 历史整理（`v0.1.4` 起才有 CI 发布流水线；Tauri 版本取自各 tag 的 `src-tauri/Cargo.toml`）：

| 程序版本                       | Tauri 版本         | Linux 构建环境                                   | 可运行的国产系统              |
| ------------------------------ | ------------------ | ------------------------------------------------ | ----------------------------- |
| v0.1.0 ~ v0.1.3                | 1.0.0-rc.2         | 无 GitHub Actions，未产出官方 Linux 安装包       | —（仅有本地 / Windows 产物）  |
| v0.1.4 ~ v0.1.9                | 2.0.0-alpha ~ beta | ubuntu-latest（当时为 Ubuntu 22.04，glibc 2.35） | UOS V25、deepin 23+、麒麟 V11 |
| v0.1.10 及以后（含当前开发版） | 2.0.1 ~ 2.12.x     | ubuntu-22.04 / ubuntu-22.04-arm                  | UOS V25、deepin 23+、麒麟 V11 |

**关于 UOS V20 该用哪个版本：没有任何已发布版本可用。** 原因：

1. Tauri 1.x 时期（`v0.1.0 ~ v0.1.3`）仓库还没有发布流水线，也就没有官方的 Linux 包；
2. 从 `v0.1.4` 开始有了流水线，但 Tauri 已经升级到 2.x，构建机固定为 Ubuntu 22.04，产物要求 glibc ≥ 2.35 与 webkit2gtk-4.1；
3. UOS V20 / deepin 20.x / 麒麟 V10 是 Debian 10 底座，只有 glibc 2.28 与 webkit2gtk-4.0，运行时会直接报 glib 或 webkit 库缺失。

若确实需要在 UOS V20 上使用，只能自行在 V20 环境里用 Tauri 1.x 源码（`v0.1.3` 及更早）编译并自行降级依赖，这不属于官方支持范围，也不再随项目更新。

## ⚠️ 免责声明

_本项目仅支持用于学习测试，请在使用软件的过程中，遵守当地法律，禁止任何违法行为。_

## :sparkles: Features

:heavy_check_mark: 生成假的身份证信息;\
:heavy_check_mark: 生成假的身份证照片;

## :rocket: Technologies

The following tools were used in this project:

- [tauri-vite-app-template](https://github.com/ddki/tauri-vite-app-template)

## :white_check_mark: Requirements

Before starting :checkered_flag:, you need to have [Git](https://git-scm.com), [Node](https://nodejs.org/en/), [Rust](https://www.rust-lang.org/) installed.

## :checkered_flag: Starting

```bash
# Clone this project
$ git clone https://github.com/ddki/idcard-generator-tauri

# Access
$ cd idcard-generator-tauri

# Install dependencies
$ pnpm install

# Run the project
$ pnpm run tauri:dev

```

## :memo: License

This project is under license from GPL-3.0. For more details, see the [LICENSE](LICENSE) file.

Made with :heart: by <a href="https://github.com/ddki" target="_blank">ddki</a>

&#xa0;

<a href="#top">Back to top</a>
