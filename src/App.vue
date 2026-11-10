<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import router from '@/router'
import { reportBootError } from '@/utils/BootErrorUtils'
import { isDesktop } from '@/utils/SettingUtils'

/** 超时兜底：隐藏窗口里 rAF 可能被节流，字体/路由也可能长时间不 resolve */
function timeout(ms: number) {
	return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

onMounted(async () => {
	// 纯 Web 构建没有闪屏窗口
	if (!isDesktop()) {
		return
	}

	try {
		// 等首个路由（含重定向与异步路由组件）解析完成，避免闪屏消失时主窗口还是空白
		await Promise.race([router.isReady(), timeout(3000)])
		// 等渲染帧与字体就绪后再切到主窗口，避免主窗口先显示一帧空白
		await Promise.race([
			new Promise<void>((resolve) => {
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
			}),
			timeout(300)
		])
		if (document.fonts?.ready) {
			await Promise.race([document.fonts.ready, timeout(500)])
		}
	} catch (error) {
		// 首屏异常不应该把用户留在闪屏上：给出可见提示，交由下面的 finally 关闭闪屏
		reportBootError(error)
	} finally {
		// 关闭失败（命令未注册等）也不阻塞界面：Rust 侧还有超时兜底
		await invoke('close_splashscreen').catch(() => {})
	}
})
</script>

<template>
	<Suspense>
		<RouterView />
	</Suspense>
</template>

<style scoped></style>
