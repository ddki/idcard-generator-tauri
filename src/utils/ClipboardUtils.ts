import { ElMessage } from 'element-plus'

/**
 * 复制文本到剪贴板。
 *
 * 直接调用 clipboard API 在部分环境（非 secure context、WebView 权限受限）会 reject，
 * 这里统一降级到 execCommand 并给出可见反馈，避免"点了没反应"。
 *
 * @returns 是否复制成功
 */
export async function copyText(text: string): Promise<boolean> {
	const value = text ?? ''
	if (!value.trim()) {
		return false
	}

	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(value)
		} else {
			fallbackCopy(value)
		}
		ElMessage.success('已复制')
		return true
	} catch {
		try {
			fallbackCopy(value)
			ElMessage.success('已复制')
			return true
		} catch {
			ElMessage.error('复制失败，请手动选中后复制')
			return false
		}
	}
}

/** 旧内核/非安全上下文下的兜底复制 */
function fallbackCopy(value: string): void {
	const textarea = document.createElement('textarea')
	textarea.value = value
	textarea.setAttribute('readonly', '')
	textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0'
	document.body.appendChild(textarea)
	textarea.select()

	const copied = (() => {
		try {
			return document.execCommand('copy')
		} finally {
			document.body.removeChild(textarea)
		}
	})()

	if (!copied) {
		throw new Error('execCommand copy failed')
	}
}
