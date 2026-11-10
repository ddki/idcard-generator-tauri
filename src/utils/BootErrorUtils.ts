/**
 * 首屏加载失败提示。
 *
 * 启动阶段主窗口可能因为异步路由 chunk 加载失败、首屏脚本异常而一片空白。
 * 这种情况下 Element Plus 的 chunk 往往同样不可用，因此这里只用原生 DOM
 * 画一个最小提示，保证用户能看到发生了什么，并能一键重载。
 */

/** 错误详情最多展示的字符数，避免整段堆栈把界面撑破 */
const MAX_DETAIL_LENGTH = 300

let shown = false

function buildOverlay(detail: string) {
	const overlay = document.createElement('div')
	overlay.setAttribute('role', 'alert')
	overlay.style.cssText = [
		'position:fixed',
		'inset:0',
		'z-index:9999',
		'display:flex',
		'flex-direction:column',
		'align-items:center',
		'justify-content:center',
		'gap:12px',
		'box-sizing:border-box',
		'padding:24px',
		'background:#fff',
		'color:#303133',
		'font:14px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif',
		'text-align:center'
	].join(';')

	const title = document.createElement('strong')
	title.textContent = '界面加载失败'
	title.style.cssText = 'font-size:16px;font-weight:600'

	const message = document.createElement('span')
	message.textContent = '请点击下方按钮重新加载；如果仍然失败，请关闭应用后重新打开。'
	message.style.cssText = 'max-width:420px;color:#606266'

	const reason = document.createElement('code')
	reason.textContent = detail
	reason.style.cssText = [
		'max-width:520px',
		'box-sizing:border-box',
		'overflow-wrap:anywhere',
		'padding:8px 12px',
		'border-radius:6px',
		'background:#f5f7fa',
		'color:#909399',
		'font-size:12px'
	].join(';')

	const retry = document.createElement('button')
	retry.type = 'button'
	retry.textContent = '重新加载'
	retry.style.cssText = [
		'margin-top:4px',
		'padding:8px 20px',
		'border:1px solid #dcdfe6',
		'border-radius:6px',
		'background:#fff',
		'color:#303133',
		'font:inherit',
		'cursor:pointer'
	].join(';')
	retry.addEventListener('click', () => window.location.reload())

	overlay.append(title, message, reason, retry)
	return overlay
}

/**
 * 上报启动期错误：打印到控制台，并在主窗口为空白时给出可见提示。
 *
 * 幂等：只展示一次，避免启动阶段多个错误叠加出多层遮罩。
 */
export function reportBootError(error: unknown): void {
	console.error('[boot]', error)

	if (shown || typeof document === 'undefined') {
		return
	}
	shown = true

	const raw = error instanceof Error ? `${error.name}: ${error.message}` : String(error ?? '未知错误')
	const detail = raw.length > MAX_DETAIL_LENGTH ? `${raw.slice(0, MAX_DETAIL_LENGTH)}…` : raw
	const host = document.body ?? document.documentElement

	host.appendChild(buildOverlay(detail))
}
