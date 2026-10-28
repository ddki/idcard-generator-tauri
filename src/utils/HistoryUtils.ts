import { invoke } from '@tauri-apps/api/tauri'
import { isDesktop } from './SettingUtils'

/** 历史记录类型：身份证 / 外国人永久居留证 */
export type HistoryType = 'idcard' | 'fprcard'

export interface HistoryRecord {
	id: string
	type: HistoryType
	/** 毫秒时间戳 */
	createdAt: number
	/** 本次生成的条数 */
	count: number
	/** 列表上展示的摘要 */
	summary: string
	/** 完整生成结果，用于展开查看 */
	items: Array<Record<string, unknown>>
}

interface HistoryPayload {
	updatedAt: number
	entries: HistoryRecord[]
}

const WEB_STORAGE_KEY = 'idcard-generator:history'

function readWebHistory(): HistoryRecord[] {
	try {
		const raw = localStorage.getItem(WEB_STORAGE_KEY)
		if (!raw) {
			return []
		}
		const parsed = JSON.parse(raw) as HistoryRecord[]
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

export async function loadHistory(): Promise<HistoryRecord[]> {
	if (!isDesktop()) {
		return readWebHistory()
	}

	try {
		const payload = await invoke<HistoryPayload>('history_load')
		return Array.isArray(payload?.entries) ? payload.entries : []
	} catch (error) {
		console.error('读取历史记录失败：', error)
		return []
	}
}

export async function saveHistory(records: HistoryRecord[]): Promise<void> {
	if (!isDesktop()) {
		localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(records))
		return
	}

	await invoke('history_save', { entries: records })
}

/**
 * 追加一条历史记录，并按上限裁剪。
 * 返回裁剪后的完整列表，调用方可直接用于刷新界面。
 */
export async function appendHistory(record: HistoryRecord, limit: number): Promise<HistoryRecord[]> {
	const current = await loadHistory()
	const next = [record, ...current].slice(0, Math.max(1, limit))
	await saveHistory(next)
	return next
}

export async function clearHistory(): Promise<void> {
	if (!isDesktop()) {
		localStorage.removeItem(WEB_STORAGE_KEY)
		return
	}

	await invoke('history_clear')
}

/** 生成一条历史记录的 id */
export function createHistoryId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
