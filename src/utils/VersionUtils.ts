/**
 * 获取应用版本号。
 *
 * Tauri 环境下读取应用包版本（tauri.conf.json 的 version）；
 * 纯 Web 构建（GitHub Pages）没有 Tauri API，回退到构建时注入的 package.json 版本。
 */
export async function getAppVersion(): Promise<string> {
	try {
		const { getVersion } = await import('@tauri-apps/api/app')
		return await getVersion()
	} catch {
		return __APP_VERSION__
	}
}
