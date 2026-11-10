/**
 * 桌面端界面保护：禁用刷新、开发者工具与右键菜单。
 *
 * 抽成独立文件而不是内联 <script>，是为了让生产环境的 CSP 不需要为
 * splashscreen/index 这类静态页面额外放行内联脚本。
 */
document.addEventListener('keydown', function (event) {
	if (
		event.key === 'F5' ||
		(event.ctrlKey && event.key.toLowerCase() === 'r') ||
		(event.metaKey && event.key.toLowerCase() === 'r')
	) {
		event.preventDefault()
	}
	if (
		event.key === 'F12' ||
		(event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'i') ||
		(event.metaKey && event.shiftKey && event.key.toLowerCase() === 'i')
	) {
		event.preventDefault()
	}
})

document.addEventListener('contextmenu', function (event) {
	event.preventDefault()
})
