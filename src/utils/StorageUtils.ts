import { invoke } from '@tauri-apps/api/core'
import { isDesktop } from './SettingUtils'

export interface StorageInfo {
	appConfigDir: string
	appDataDir: string
	appLocalDataDir: string
	appCacheDir: string
	appLogDir: string
	/** 当前生效的数据目录，历史记录等用户数据存放在这里 */
	dataDir: string
	/** 是否被自定义过 */
	custom: boolean
	cacheBytes: number
	cacheFiles: number
	historyBytes: number
}

export async function getStorageInfo(): Promise<StorageInfo | null> {
	if (!isDesktop()) {
		return null
	}

	try {
		return await invoke<StorageInfo>('storage_info')
	} catch (error) {
		console.error('读取存储信息失败：', error)
		return null
	}
}

/**
 * 调用系统原生目录选择器（不是 UI 框架自绘的树形选择）。
 * Tauri 的 dialog 插件在 Windows 上走 IFileOpenDialog，macOS/Linux 走系统原生面板，
 * 能拿到带盘符的真实绝对路径，这是纯 UI 组件做不到的。
 */
export async function chooseDirectory(defaultPath?: string): Promise<string | null> {
	if (!isDesktop()) {
		return null
	}

	const { open } = await import('@tauri-apps/plugin-dialog')
	const selected = await open({
		directory: true,
		multiple: false,
		title: '选择数据目录',
		defaultPath
	})

	return typeof selected === 'string' ? selected : null
}

export async function setDataDir(path: string): Promise<StorageInfo> {
	return await invoke<StorageInfo>('set_data_dir', { path })
}

export async function resetDataDir(): Promise<StorageInfo> {
	return await invoke<StorageInfo>('reset_data_dir')
}

/** 清空缓存目录，返回释放的字节数 */
export async function clearCache(): Promise<number> {
	return await invoke<number>('clear_cache')
}

/** 用系统文件资源管理器打开目录 */
export async function openPath(path: string): Promise<void> {
	const { open } = await import('@tauri-apps/plugin-shell')
	await open(path)
}

/** 字节数转可读文本 */
export function formatBytes(bytes: number): string {
	if (!bytes || bytes <= 0) {
		return '0 B'
	}
	const units = ['B', 'KB', 'MB', 'GB', 'TB']
	const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
	const value = bytes / Math.pow(1024, index)
	return `${value >= 100 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`
}
