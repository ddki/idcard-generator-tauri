<template>
	<div class="h-6 flex flex-row flex-nowrap justify-between pl-4">
		<div class="flex flex-nowrap justify-center">
			<span class="text-red-500 font-bold h-full"
				>本项目仅支持用于学习测试，请在使用软件的过程中，遵守当地法律，禁止任何违法行为。</span
			>
		</div>
		<div class="flex flex-nowrap justify-center w-32 pr-4">
			<button class="text-blue-500" type="button" @click="checkUpdate()">检查更新</button>
		</div>
	</div>
	<el-config-provider>
		<el-header>
			<HeaderMenu :active="routerPath" />
		</el-header>
		<router-view />
	</el-config-provider>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import HeaderMenu from './HeaderMenuViewer.vue'
import { useRoute } from 'vue-router'
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { ElMessage } from 'element-plus'

const route = useRoute()
const routerPath = ref(route.path)

const checkUpdate = async () => {
	try {
		const update = await check()
		if (update?.available) {
			await update.downloadAndInstall()
			await relaunch()
		}
	} catch (e) {
		console.log(e)
		ElMessage.error('获取更新失败，无法连接更新服务（GitHub Gist）')
	}
}

watch(
	() => route.path,
	(newPath) => {
		routerPath.value = newPath
	}
)
</script>
