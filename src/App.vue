<script setup lang="ts">
import { invoke } from '@tauri-apps/api/tauri'
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { isDesktop } from '@/utils/SettingUtils'

/**
 * 各环节等待上限（毫秒）。
 * 主窗口是以 `visible: false` 创建的，而 WebKitGTK（UOS v20 / 麒麟等 Linux 发行版）不会给
 * 不可见窗口分配合成帧，`requestAnimationFrame` 与字体加载都可能永远不回调。
 * 如果只依赖 rAF，前端就拿不到“可以切换”的信号，闪屏会一直挂着，
 * 直到用户点击托盘“设置”把主窗口显示出来（此时才开始有帧）才被关闭。
 */
const FRAME_TIMEOUT = 300
const FONT_TIMEOUT = 300
const TOTAL_TIMEOUT = 3000

/** 给任意等待加超时兜底，且不让异常中断闪屏切换流程 */
function withTimeout(task: Promise<unknown>, ms: number): Promise<void> {
	return Promise.race([
		task.then(
			() => undefined,
			() => undefined
		),
		new Promise<void>((resolve) => setTimeout(resolve, ms))
	])
}

/** 等两帧再切换：DOM 已经有内容，主窗口显示出来才不会先闪一帧空白 */
function waitForPaint(): Promise<void> {
	return new Promise<void>((resolve) => {
		let settled = false
		const done = () => {
			if (settled) {
				return
			}
			settled = true
			resolve()
		}
		requestAnimationFrame(() => requestAnimationFrame(done))
		setTimeout(done, FRAME_TIMEOUT)
	})
}

async function handoffToMainWindow() {
	// 纯 Web 构建没有闪屏窗口
	if (!isDesktop()) {
		return
	}

	const prepare = async () => {
		await waitForPaint()
		if (document.fonts?.ready) {
			await withTimeout(document.fonts.ready, FONT_TIMEOUT)
		}
	}

	// 兜底：即使渲染/字体环节卡死，也必须把闪屏切掉
	await withTimeout(prepare(), TOTAL_TIMEOUT)

	await invoke('close_splashscreen').catch(() => undefined)
}

onMounted(handoffToMainWindow)
</script>

<template>
	<Suspense>
		<RouterView />
	</Suspense>
</template>

<style scoped></style>
