# idcard-generator

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## 问题

### cargo(rust包管理器)设置国内镜像
创建 ``C:\Users\[username]\.cargo\config`` 文件，添加如下内容：
```
# 放到 `$HOME/.cargo/config` 文件中
[source.crates-io]
registry = "https://github.com/rust-lang/crates.io-index"

# 替换成你偏好的镜像源
#replace-with = 'sjtu'
replace-with = 'tuna'

# 清华大学
[source.tuna]
registry = "https://mirrors.tuna.tsinghua.edu.cn/git/crates.io-index.git"

# 中国科学技术大学
[source.ustc]
registry = "git://mirrors.ustc.edu.cn/crates.io-index"

# 上海交通大学
[source.sjtu]
registry = "https://mirrors.sjtug.sjtu.edu.cn/git/crates.io-index"

# rustcc社区
[source.rustcc]
registry = "git://crates.rustcc.cn/crates.io-index"
```

### wix3下载失败

```bash
INFO  Check out deployment instructions at https://cli.vuejs.org/guide/deployment.html

   Compiling app v0.1.0 (E:\workspaces\git\idcard-generator-tauri\src-tauri)
    Finished release [optimized] target(s) in 15.34s
info: Verifying wix package
info: Downloading https://github.com/wixtoolset/wix3/releases/download/wix3112rtm/wix311-binaries.zip
Waiting for the debugger to disconnect...
node:internal/process/promises:279
            triggerUncaughtException(err, true /* fromPromise */);
            ^

[Error: failed to bundle project: `Io Error: 由于连接方在一段时间后没有正确答复或连接的主机没有反应，连接尝试失败。 (os error 10060)`: Io Error: 由于连接方在一段时间后没有正确答复或连接的主机没有反应，连接尝试失败。 (os error 10060)] {
  code: 'GenericFailure'
}

Node.js v17.8.0
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
Waiting for the debugger to disconnect...
```

下载wix3(https://github.com/wixtoolset/wix3/releases/download/wix3112rtm/wix311-binaries.zip)包，解压到项目 ``src-tauri/WixTools`` 目录下。

