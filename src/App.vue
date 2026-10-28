<script setup lang="ts">
import { invoke } from '@tauri-apps/api/tauri'
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { isDesktop } from '@/utils/SettingUtils'

onMounted(async () => {
	// 纯 Web 构建没有闪屏窗口
	if (!isDesktop()) {
		return
	}

	// 等渲染帧与字体就绪后再切到主窗口，避免主窗口先显示一帧空白
	await new Promise<void>((resolve) => {
		requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
	})
	if (document.fonts?.ready) {
		await document.fonts.ready
	}

	await invoke('close_splashscreen')
})
</script>

<template>
	<Suspense>
		<RouterView />
	</Suspense>
</template>

<style scoped></style>
