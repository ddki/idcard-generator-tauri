<template>
	<div class="app-shell">
		<div v-if="showDisclaimer" class="flex h-6 flex-row flex-nowrap justify-center pl-4">
			<div class="flex flex-nowrap justify-center">
				<span class="h-full font-bold text-red-500">
					本软件仅支持用于学习测试，请在使用软件的过程中遵守当地法律法规，禁止任何违法行为。
				</span>
			</div>
		</div>
		<el-config-provider>
			<el-header class="app-header">
				<HeaderMenu class="app-menu" :active="routerPath" />
				<el-button class="app-setting" text circle title="设置" aria-label="设置" @click="settingVisible = true">
					<svg
						viewBox="0 0 24 24"
						width="18"
						height="18"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="3" />
						<path
							d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10.5 3V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
						/>
					</svg>
				</el-button>
			</el-header>
			<!-- 只缓存两个列表页，图片页依赖 query 参数，必须重新创建 -->
			<router-view v-slot="{ Component }">
				<keep-alive :include="keepAliveViews">
					<component :is="Component" />
				</keep-alive>
			</router-view>
			<SettingDialog v-model="settingVisible" @settings-changed="refreshDisclaimer" />
		</el-config-provider>
	</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listen } from '@tauri-apps/api/event'
import HeaderMenu from './HeaderMenuViewer.vue'
import SettingDialog from '@/components/SettingDialog.vue'
import { useRoute } from 'vue-router'
import { isDesktop, loadSettings } from '@/utils/SettingUtils'
import { checkUpdate, installUpdateAndRelaunch } from '@/utils/UpdaterUtils'

const route = useRoute()
const routerPath = ref(route.path)
const settingVisible = ref(false)
/** 首页顶部的合规提示，默认显示，可在设置中关闭 */
const showDisclaimer = ref(true)

/** 需要保留状态的页面（组件名需与 defineOptions 里声明的 name 一致） */
const keepAliveViews = ['IdCardViewer', 'FprCardViewer']

let unlistenOpenSetting: (() => void) | null = null
let unlistenCheckUpdate: (() => void) | null = null

onMounted(async () => {
	if (isDesktop()) {
		// 托盘菜单里的「设置」通过事件唤起这里的弹窗
		unlistenOpenSetting = await listen('open-setting', () => {
			settingVisible.value = true
		})
		// 托盘菜单里的「检查更新」由前端驱动完整更新流程
		unlistenCheckUpdate = await listen('check-update', () => {
			void runUpdate(true)
		})
	}

	await refreshDisclaimer()
	await checkUpdateOnStart()
})

onUnmounted(() => {
	unlistenOpenSetting?.()
	unlistenOpenSetting = null
	unlistenCheckUpdate?.()
	unlistenCheckUpdate = null
})

watch(
	() => route.path,
	(newPath) => {
		routerPath.value = newPath
	}
)

/** 按设置项决定首页是否显示合规提示 */
async function refreshDisclaimer() {
	try {
		const settings = await loadSettings()
		showDisclaimer.value = settings.showDisclaimer
	} catch (error) {
		console.error('读取首页提示设置失败：', error)
	}
}

/** 启动时按设置项检查更新，发现新版本先征求用户同意 */
async function checkUpdateOnStart() {
	if (!isDesktop()) {
		return
	}

	try {
		const settings = await loadSettings()
		if (!settings.checkUpdateOnStart) {
			return
		}
		await runUpdate(false)
	} catch (error) {
		console.error('启动时检查更新失败：', error)
	}
}

/**
 * 执行一次完整更新流程。
 * @param interactive 托盘/手动触发时为 true：会提示「已是最新版本」等反馈
 */
async function runUpdate(interactive: boolean) {
	try {
		const result = await checkUpdate()
		if (!result.shouldUpdate) {
			if (interactive) {
				ElMessage.success('当前已是最新版本')
			}
			return
		}

		await ElMessageBox.confirm(`发现新版本 ${result.version}，是否立即更新？`, '发现更新', {
			confirmButtonText: '立即更新',
			cancelButtonText: '稍后再说',
			type: 'info'
		})

		await installUpdateAndRelaunch()
	} catch (error) {
		// 用户选择「稍后再说」时 ElMessageBox 会 reject('cancel')，不视为异常
		if (error !== 'cancel' && error !== 'close') {
			console.error('检查更新失败：', error)
			if (interactive) {
				ElMessage.error('获取更新失败，请检查网络后重试')
			}
		}
	}
}
</script>

<style lang="less" scoped>
/* 整页纵向铺满：顶部提示 + 头部 + 内容区（内容区自己瓜分剩余高度） */
.app-shell {
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 0;
}

.app-header {
	display: flex;
	flex: none;
	align-items: center;
	position: relative;
	padding-right: 16px;
}

.app-menu {
	flex: 1;
	min-width: 0;
}

/* 右上角设置按钮 */
.app-setting {
	flex: none;
	margin-left: auto;
	color: var(--el-text-color-regular);
}
</style>
