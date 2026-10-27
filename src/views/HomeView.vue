<template>
	<div class="h-6 flex flex-row flex-nowrap justify-center pl-4">
		<div class="flex flex-nowrap justify-center">
			<span class="text-red-500 font-bold h-full">
				本软件仅支持用于学习测试，请在使用软件的过程中，遵守当地法律，禁止任何违法行为！
			</span>
		</div>
	</div>
	<el-config-provider>
		<el-header class="app-header">
			<HeaderMenu :active="routerPath" />
			<span class="app-version">v{{ appVersion }}</span>
		</el-header>
		<router-view />
	</el-config-provider>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import HeaderMenu from './HeaderMenuViewer.vue'
import { useRoute, useRouter } from 'vue-router'
import { getAppVersion } from '@/utils/VersionUtils'

const router = useRouter()
const route = useRoute()
const routerPath = ref(route.path)
const appVersion = ref('')

onMounted(async () => {
	appVersion.value = await getAppVersion()
})

watch(
	() => route.path,
	(newPath) => {
		routerPath.value = newPath
	}
)
</script>

<style lang="less" scoped>
.app-header {
	position: relative;
}

/* 右上角版本号：绝对定位，不影响横向菜单布局 */
.app-version {
	position: absolute;
	top: 50%;
	right: 20px;
	color: var(--el-text-color-secondary);
	font-size: 12px;
	line-height: 1;
	user-select: none;
	transform: translateY(-50%);
}
</style>
