import { isDesktop } from './SettingUtils'

export interface UpdateCheckResult {
	/** 是否有可用更新 */
	shouldUpdate: boolean
	/** 远端版本号 */
	version?: string
}

/**
 * 检查更新。
 * v1 的 updater 把「检查」和「安装」拆成两个 API，检查只返回清单，安装需要单独触发。
 */
export async function checkUpdate(): Promise<UpdateCheckResult> {
	if (!isDesktop()) {
		return { shouldUpdate: false }
	}

	const { checkUpdate: check } = await import('@tauri-apps/api/updater')
	const { shouldUpdate, manifest } = await check()
	return { shouldUpdate, version: manifest?.version }
}

/** 下载并安装更新，安装完成后重启应用 */
export async function installUpdateAndRelaunch(): Promise<void> {
	const { installUpdate } = await import('@tauri-apps/api/updater')
	await installUpdate()

	const { relaunch } = await import('@tauri-apps/api/process')
	await relaunch()
}
