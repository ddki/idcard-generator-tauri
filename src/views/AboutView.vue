<template>
	<div class="about">
		<v-md-preview :text="content"></v-md-preview>
	</div>
</template>

<script setup lang="ts">
const content = `
## 😃 简介

项目基于 [Tauri](https://tauri.app/) 开发。 Windows 运行依赖于 MicrosoftEdgeWebView2Runtime，Windows10 2004版本以后系统内置 WebView2Runtime，之前版本系统需要安装它，官方下载地址：[webview2](https://developer.microsoft.com/zh-cn/microsoft-edge/webview2/#download-section)

## ⚠️ 免责声明

<section style="color: red"><b>本项目仅支持用于学习测试，请在使用软件的过程中，遵守当地法律，禁止任何违法行为。</b></section>

## 💻 客户端

### 🔳 Windows [⬇️](https://github.com/ddki/idcard-generator-tauri/releases)

依赖环境MicrosoftEdgeWebView2Runtime地址：[MicrosoftEdgeWebView2Runtime](https://developer.microsoft.com/zh-cn/microsoft-edge/webview2/#download-section)

## 🐛 提BUG

[issues](https://github.com/ddki/idcard-generator-tauri/issues)

## 🏗️ 参与开发

[idcard-generator-tauri](https://github.com/ddki/idcard-generator-tauri)

`
</script>
