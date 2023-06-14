<template>
	<div class="about">
		<section>
			项目基于 tauri 开发。 Windows 运行依赖于 MicrosoftEdgeWebView2Runtime，Windows10
			2004版本以后系统内置WebView2Runtime，之前版本系统需要安装它， 官方下载地址：<a
				href="https://developer.microsoft.com/zh-cn/microsoft-edge/webview2/#download-section"
				>https://developer.microsoft.com/zh-cn/microsoft-edge/webview2/#download-section</a
			>
		</section>
		<h2>免责声明</h2>
		<section style="color: red">
			<b>本项目仅支持用于学习测试，请在使用软件的过程中，遵守当地法律，禁止任何违法行为。</b>
		</section>
		<h2>客户端</h2>
		<h3>Windows</h3>
		<section>
			依赖环境MicrosoftEdgeWebView2Runtime地址：<a
				href="https://developer.microsoft.com/zh-cn/microsoft-edge/webview2/#download-section"
				>https://developer.microsoft.com/zh-cn/microsoft-edge/webview2/#download-section</a
			>
		</section>
		<section>
			程序地址：<a href="https://github.com/ddki/idcard-generator-tauri/releases"
				>https://github.com/ddki/idcard-generator-tauri/releases</a
			>
		</section>
		<h2>提BUG</h2>
		<section>
			<a href="https://github.com/ddki/idcard-generator-tauri/issues"
				>https://github.com/ddki/idcard-generator-tauri/issues</a
			>
		</section>
		<h2>参与开发</h2>
		<section>
			<a href="https://github.com/ddki/idcard-generator-tauri">https://github.com/ddki/idcard-generator-tauri</a>
		</section>
	</div>
</template>

<style>
@media (min-width: 1024px) {
	.about {
		min-height: 100vh;
		display: flex;
		align-items: center;
	}
}
</style>
