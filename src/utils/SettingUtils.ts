import { invoke } from '@tauri-apps/api/core'
import { Store } from '@tauri-apps/plugin-store'

/** 设置项存储文件名（Rust 端关闭窗口时读取同一个文件） */
export const SETTINGS_STORE_FILE = 'settings.json'

/** 历史记录条数上限的取值范围 */
export const HISTORY_LIMIT_MIN = 10
export const HISTORY_LIMIT_MAX = 5000

export interface AppSettings {
	/** 开机自启 */
	autostart: boolean
	/** 后台常驻：关闭主窗口时隐藏到托盘而不是退出 */
	closeToTray: boolean
	/** 启动时自动检查更新 */
	checkUpdateOnStart: boolean
	/** 历史记录最多保留条数 */
	historyLimit: number
	/** 首页顶部显示学习测试 / 合规提示 */
	showDisclaimer: boolean
}

/** 开关默认关闭，历史记录默认保留 20 条，合规提示默认开启 */
export const DEFAULT_SETTINGS: Readonly<AppSettings> = Object.freeze({
	autostart: false,
	closeToTray: false,
	checkUpdateOnStart: false,
	historyLimit: 20,
	showDisclaimer: true
})

/** 设置项 -> store 键名 */
const SETTING_KEYS: Record<keyof AppSettings, string> = {
	autostart: 'autostart',
	closeToTray: 'close-to-tray',
	checkUpdateOnStart: 'check-update-on-start',
	historyLimit: 'history-limit',
	showDisclaimer: 'show-disclaimer'
}

/** 纯 Web 构建没有 Tauri Store，用 localStorage 保存界面偏好 */
const WEB_STORAGE_KEY = 'idcard-generator:settings'

/** 旧版本把“后台常驻”写在 single-instance 键下，读取时兼容一次 */
const LEGACY_CLOSE_TO_TRAY_KEY = 'single-instance'

/**
 * 是否运行在 Tauri 容器内。
 * 纯 Web 构建（GitHub Pages）没有 Tauri API，设置项需要降级处理。
 */
export function isDesktop(): boolean {
	return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

/** 把任意值收敛到合法的历史上限范围 */
export function normalizeHistoryLimit(value: unknown): number {
	const limit = Number(value)
	if (!Number.isFinite(limit)) {
		return DEFAULT_SETTINGS.historyLimit
	}
	return Math.min(HISTORY_LIMIT_MAX, Math.max(HISTORY_LIMIT_MIN, Math.round(limit)))
}

let storePromise: Promise<Store> | null = null

function getStore(): Promise<Store> {
	if (!storePromise) {
		storePromise = Store.load(SETTINGS_STORE_FILE, { autoSave: false })
	}
	return storePromise
}

/** 读取 Web 端的界面偏好 */
function readWebSettings(): Partial<AppSettings> {
	try {
		const raw = localStorage.getItem(WEB_STORAGE_KEY)
		return raw ? (JSON.parse(raw) as Partial<AppSettings>) : {}
	} catch {
		return {}
	}
}

/** 读取全部设置，缺失项回退到默认值 */
export async function loadSettings(): Promise<AppSettings> {
	if (!isDesktop()) {
		const stored = readWebSettings()
		return {
			...DEFAULT_SETTINGS,
			...stored,
			historyLimit: normalizeHistoryLimit(stored.historyLimit)
		}
	}

	try {
		const store = await getStore()
		const [autostart, closeToTray, legacyCloseToTray, checkUpdateOnStart, historyLimit, showDisclaimer] =
			await Promise.all([
				store.get<boolean>(SETTING_KEYS.autostart),
				store.get<boolean>(SETTING_KEYS.closeToTray),
				store.get<boolean>(LEGACY_CLOSE_TO_TRAY_KEY),
				store.get<boolean>(SETTING_KEYS.checkUpdateOnStart),
				store.get<number>(SETTING_KEYS.historyLimit),
				store.get<boolean>(SETTING_KEYS.showDisclaimer)
			])

		return {
			autostart: autostart ?? DEFAULT_SETTINGS.autostart,
			closeToTray: closeToTray ?? legacyCloseToTray ?? DEFAULT_SETTINGS.closeToTray,
			checkUpdateOnStart: checkUpdateOnStart ?? DEFAULT_SETTINGS.checkUpdateOnStart,
			historyLimit: normalizeHistoryLimit(historyLimit),
			showDisclaimer: showDisclaimer ?? DEFAULT_SETTINGS.showDisclaimer
		}
	} catch (error) {
		console.error('读取设置失败：', error)
		return { ...DEFAULT_SETTINGS }
	}
}

/** 写入单个设置项并立即落盘 */
export async function saveSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
	if (!isDesktop()) {
		localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify({ ...readWebSettings(), [key]: value }))
		return
	}

	const store = await getStore()
	await store.set(SETTING_KEYS[key], value)
	await store.save()
}

/** 切换“后台常驻”：落盘后通知 Rust 端，关闭窗口的行为立即改变 */
export async function applyCloseToTray(enabled: boolean): Promise<void> {
	await saveSetting('closeToTray', enabled)

	if (!isDesktop()) {
		return
	}

	await invoke('set_close_to_tray', { enabled })
}

/**
 * 把开机自启同步到系统（Windows 注册表 / macOS LaunchAgent / Linux desktop 文件）。
 * 返回系统侧的真实状态，便于 UI 在失败时回滚。
 */
export async function applyAutostart(enabled: boolean): Promise<boolean> {
	if (!isDesktop()) {
		return enabled
	}

	const autostart = await import('@tauri-apps/plugin-autostart')
	await (enabled ? autostart.enable() : autostart.disable())
	return await autostart.isEnabled()
}
