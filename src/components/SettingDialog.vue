<template>
	<el-dialog
		v-model="visible"
		title="设置"
		align-center
		append-to-body
		:close-on-click-modal="false"
		class="setting-dialog"
	>
		<el-tabs v-model="activeTab">
			<el-tab-pane label="系统设置" name="system">
				<div class="setting-list">
					<div class="setting-row">
						<div class="setting-row__text">
							<span class="setting-row__title">开机自启</span>
							<span class="setting-row__desc">系统启动时自动运行本程序</span>
						</div>
						<el-switch
							v-model="form.autostart"
							:loading="pending.autostart"
							:disabled="!desktop"
							@change="onAutostartChange"
						/>
					</div>
					<div class="setting-row">
						<div class="setting-row__text">
							<span class="setting-row__title">后台常驻</span>
							<span class="setting-row__desc">关闭窗口时最小化到托盘，而不是退出程序</span>
						</div>
						<el-switch
							v-model="form.closeToTray"
							:loading="pending.closeToTray"
							:disabled="!desktop"
							@change="onCloseToTrayChange"
						/>
					</div>
					<div class="setting-row">
						<div class="setting-row__text">
							<span class="setting-row__title">启动时检查更新</span>
							<span class="setting-row__desc">程序启动后在后台检查是否有新版本</span>
						</div>
						<el-switch v-model="form.checkUpdateOnStart" :disabled="!desktop" @change="onCheckUpdateOnStartChange" />
					</div>
					<div class="setting-row">
						<div class="setting-row__text">
							<span class="setting-row__title">历史记录上限</span>
							<span class="setting-row__desc">超出上限后自动丢弃最旧的记录</span>
						</div>
						<el-input-number
							v-model="form.historyLimit"
							class="setting-row__control"
							:min="HISTORY_LIMIT_MIN"
							:max="HISTORY_LIMIT_MAX"
							:step="10"
							:disabled="!desktop"
							@change="onHistoryLimitChange"
						/>
					</div>
					<div class="setting-row">
						<div class="setting-row__text">
							<span class="setting-row__title">首页显示提示</span>
							<span class="setting-row__desc"> 在首页顶部显示“仅用于学习测试，请遵守当地法律法规”的提示 </span>
						</div>
						<el-switch v-model="form.showDisclaimer" @change="onShowDisclaimerChange" />
					</div>
				</div>
				<el-alert
					v-if="!desktop"
					class="setting-alert"
					type="info"
					:closable="false"
					show-icon
					title="网页版仅支持界面显示设置，系统级设置请在桌面客户端中使用"
				/>
			</el-tab-pane>
			<el-tab-pane label="存储设置" name="storage">
				<div v-loading="storageLoading" class="storage">
					<div class="setting-row">
						<div class="setting-row__text">
							<span class="setting-row__title">数据目录</span>
							<span class="setting-row__desc">历史记录等用户数据的存放位置，切换后自动迁移</span>
						</div>
						<div class="setting-row__actions">
							<el-button size="small" type="primary" :disabled="!desktop" @click="onChangeDataDir">
								更改目录
							</el-button>
							<el-button size="small" :disabled="!storage?.custom" @click="onResetDataDir"> 恢复默认 </el-button>
						</div>
					</div>
					<div class="storage__path">
						<code>{{ storage?.dataDir || '—' }}</code>
						<el-button link type="primary" size="small" :disabled="!storage" @click="onOpenPath(storage?.dataDir)">
							打开
						</el-button>
					</div>

					<div class="storage__divider"></div>

					<div v-for="item in dirEntries" :key="item.label" class="storage__dir">
						<div class="storage__dir-text">
							<span class="storage__dir-label">{{ item.label }}</span>
							<span class="storage__dir-path">{{ item.path }}</span>
						</div>
						<el-button link type="primary" size="small" @click="onOpenPath(item.path)">打开</el-button>
					</div>

					<div class="storage__divider"></div>

					<div class="setting-row">
						<div class="setting-row__text">
							<span class="setting-row__title">缓存清理</span>
							<span class="setting-row__desc">
								{{ storage ? `${formatBytes(storage.cacheBytes)} · ${storage.cacheFiles} 个文件` : '—' }}
							</span>
						</div>
						<el-button size="small" :loading="clearing" :disabled="!storage" @click="onClearCache">
							清理缓存
						</el-button>
					</div>

					<el-alert
						v-if="!desktop"
						class="setting-alert"
						type="info"
						:closable="false"
						show-icon
						title="网页版不支持存储设置，请在桌面客户端中使用"
					/>
				</div>
			</el-tab-pane>
			<el-tab-pane label="关于" name="about">
				<div class="about">
					<img class="about__logo" :src="logo" alt="应用图标" />
					<div class="about__info">
						<span class="about__name">身份证生成器</span>
						<span class="about__version">版本 {{ appVersion }}</span>
					</div>
				</div>
				<div class="about__actions">
					<el-button type="primary" :loading="checking" @click="onCheckUpdate">检查更新</el-button>
				</div>
			</el-tab-pane>
		</el-tabs>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import logo from '@/assets/logo.png'
import { getAppVersion } from '@/utils/VersionUtils'
import {
	DEFAULT_SETTINGS,
	HISTORY_LIMIT_MAX,
	HISTORY_LIMIT_MIN,
	applyAutostart,
	applyCloseToTray,
	isDesktop,
	loadSettings,
	normalizeHistoryLimit,
	saveSetting,
	type AppSettings
} from '@/utils/SettingUtils'
import {
	chooseDirectory,
	clearCache,
	formatBytes,
	getStorageInfo,
	openPath,
	resetDataDir,
	setDataDir,
	type StorageInfo
} from '@/utils/StorageUtils'

const visible = defineModel<boolean>({ default: false })
const emit = defineEmits<{ (event: 'settings-changed'): void }>()

const desktop = isDesktop()
const activeTab = ref('system')
const checking = ref(false)
const appVersion = ref('')

const form = reactive<AppSettings>({
	autostart: false,
	closeToTray: false,
	checkUpdateOnStart: false,
	historyLimit: DEFAULT_SETTINGS.historyLimit,
	showDisclaimer: DEFAULT_SETTINGS.showDisclaimer
})

const pending = reactive({
	autostart: false,
	closeToTray: false
})

/** 每次打开弹窗都重新读取，避免显示过期状态 */
async function refresh() {
	Object.assign(form, await loadSettings())
	appVersion.value = await getAppVersion()
	await refreshStorage()
}

const storage = ref<StorageInfo | null>(null)
const storageLoading = ref(false)
const clearing = ref(false)

const dirEntries = computed(() => {
	const info = storage.value
	if (!info) {
		return []
	}
	return [
		{ label: '配置目录', path: info.appConfigDir },
		{ label: '应用数据目录', path: info.appDataDir },
		{ label: '本地数据目录', path: info.appLocalDataDir },
		{ label: '缓存目录', path: info.appCacheDir },
		{ label: '日志目录', path: info.appLogDir }
	]
})

async function refreshStorage() {
	if (!desktop) {
		return
	}
	storageLoading.value = true
	try {
		storage.value = await getStorageInfo()
	} finally {
		storageLoading.value = false
	}
}

const onHistoryLimitChange = async (value: number | undefined) => {
	const limit = normalizeHistoryLimit(value)
	form.historyLimit = limit
	try {
		await saveSetting('historyLimit', limit)
		ElMessage.success(`历史记录最多保留 ${limit} 条`)
	} catch (error) {
		console.error('保存历史记录上限失败：', error)
		ElMessage.error('设置保存失败')
	}
}

const onChangeDataDir = async () => {
	try {
		const selected = await chooseDirectory(storage.value?.dataDir)
		if (!selected) {
			return
		}
		storage.value = await setDataDir(selected)
		ElMessage.success('数据目录已更新，历史记录已迁移')
	} catch (error) {
		console.error('切换数据目录失败：', error)
		ElMessage.error(String(error))
	}
}

const onResetDataDir = async () => {
	try {
		storage.value = await resetDataDir()
		ElMessage.success('已恢复默认数据目录')
	} catch (error) {
		console.error('恢复默认数据目录失败：', error)
		ElMessage.error(String(error))
	}
}

const onClearCache = async () => {
	try {
		await ElMessageBox.confirm('确定要清理缓存吗？缓存中的临时数据将被删除，历史记录不受影响。', '清理缓存', {
			confirmButtonText: '清理',
			cancelButtonText: '取消',
			type: 'warning'
		})
	} catch {
		return
	}

	clearing.value = true
	try {
		const freed = await clearCache()
		await refreshStorage()
		ElMessage.success(`已清理缓存，释放 ${formatBytes(freed)}`)
	} catch (error) {
		console.error('清理缓存失败：', error)
		ElMessage.error(String(error))
	} finally {
		clearing.value = false
	}
}

const onOpenPath = async (path?: string) => {
	if (!path) {
		return
	}
	try {
		await openPath(path)
	} catch (error) {
		console.error('打开目录失败：', error)
		ElMessage.error('打开目录失败')
	}
}

watch(visible, async (opened) => {
	if (opened) {
		await refresh()
	}
})

const onAutostartChange = async (value: boolean | string | number) => {
	const enabled = Boolean(value)
	pending.autostart = true
	try {
		// 先写系统，成功后再落盘，保证 UI 与真实状态一致
		const actual = await applyAutostart(enabled)
		form.autostart = actual
		await saveSetting('autostart', actual)
		ElMessage.success(actual ? '已开启开机自启' : '已关闭开机自启')
	} catch (error) {
		console.error('开机自启设置失败：', error)
		form.autostart = !enabled
		ElMessage.error('开机自启设置失败')
	} finally {
		pending.autostart = false
	}
}

const onCloseToTrayChange = async (value: boolean | string | number) => {
	const enabled = Boolean(value)
	pending.closeToTray = true
	try {
		await applyCloseToTray(enabled)
		ElMessage.success(enabled ? '已开启后台常驻' : '已关闭后台常驻')
	} catch (error) {
		console.error('后台常驻设置失败：', error)
		form.closeToTray = !enabled
		ElMessage.error('后台常驻设置失败')
	} finally {
		pending.closeToTray = false
	}
}

/** 首页合规提示开关：保存后通知首页立即刷新 */
const onShowDisclaimerChange = async (value: boolean | string | number) => {
	const enabled = Boolean(value)
	try {
		await saveSetting('showDisclaimer', enabled)
		emit('settings-changed')
		ElMessage.success(enabled ? '已显示首页提示' : '已隐藏首页提示')
	} catch (error) {
		console.error('首页提示设置失败：', error)
		form.showDisclaimer = !enabled
		ElMessage.error('设置保存失败')
	}
}

const onCheckUpdateOnStartChange = async (value: boolean | string | number) => {
	const enabled = Boolean(value)
	try {
		await saveSetting('checkUpdateOnStart', enabled)
	} catch (error) {
		console.error('更新检查设置失败：', error)
		form.checkUpdateOnStart = !enabled
		ElMessage.error('设置保存失败')
	}
}

const onCheckUpdate = async () => {
	if (checking.value) {
		return
	}
	checking.value = true
	try {
		const { check } = await import('@tauri-apps/plugin-updater')
		const update = await check()
		if (update?.available) {
			await update.downloadAndInstall()
			const { relaunch } = await import('@tauri-apps/plugin-process')
			await relaunch()
			return
		}
		ElMessage.success('当前已是最新版本')
	} catch (error) {
		console.error('检查更新失败：', error)
		ElMessage.error('获取更新失败，请检查网络后重试')
	} finally {
		checking.value = false
	}
}
</script>

<style lang="less" scoped>
.setting-list {
	display: flex;
	flex-direction: column;
	padding: 4px 0;
}

.setting-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 24px;
	padding: 14px 4px;
	border-bottom: 1px solid var(--el-border-color-lighter);

	&:last-child {
		border-bottom: none;
	}
}

.setting-row__text {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.setting-row__title {
	font-size: 14px;
	color: var(--el-text-color-primary);
}

.setting-row__desc {
	font-size: 12px;
	line-height: 1.5;
	color: var(--el-text-color-secondary);
}

.setting-alert {
	margin-top: 12px;
}

.setting-row__control {
	flex: none;
	width: 140px;
}

.setting-row__actions {
	display: flex;
	flex: none;
	gap: 8px;
}

.storage {
	display: flex;
	flex-direction: column;
}

.storage__path {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 0 4px;

	code {
		flex: 1;
		min-width: 0;
		padding: 6px 10px;
		overflow: hidden;
		border-radius: 6px;
		background: var(--el-fill-color);
		font-size: 12px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}

.storage__divider {
	height: 1px;
	margin: 14px 0;
	background: var(--el-border-color-lighter);
}

.storage__dir {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 8px 4px;
}

.storage__dir-text {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
}

.storage__dir-label {
	font-size: 13px;
	color: var(--el-text-color-primary);
}

.storage__dir-path {
	font-size: 12px;
	line-height: 1.4;
	color: var(--el-text-color-secondary);
	word-break: break-all;
}

.about {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 8px 4px 20px;
}

.about__logo {
	width: 56px;
	height: 56px;
	border-radius: 12px;
}

.about__info {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.about__name {
	font-size: 16px;
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.about__version {
	font-size: 13px;
	color: var(--el-text-color-secondary);
}

.about__actions {
	display: flex;
	gap: 8px;
	padding: 0 4px;
}
</style>

<!-- 弹窗被 teleport 到 body，样式需要非 scoped 才能命中内部结构 -->
<style lang="less">
.setting-dialog.el-dialog {
	// 固定尺寸，切换 tab 时不跳动
	width: 620px;
	height: 560px;
	display: flex;
	flex-direction: column;
	padding: 0;
	overflow: hidden;
	border-radius: 16px;
	box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
}

.setting-dialog .el-dialog__header {
	flex: none;
	padding: 2rem 2rem 1.25rem;
	margin-right: 0;
	border-bottom: 1px solid var(--el-border-color-lighter);
}

.setting-dialog .el-dialog__title {
	font-size: 18px;
	font-weight: 600;
	line-height: 1;
}

.setting-dialog .el-dialog__headerbtn {
	top: 1.75rem;
	right: 1.5rem;
	width: 32px;
	height: 32px;
	font-size: 18px;
}

.setting-dialog .el-dialog__body {
	flex: 1;
	min-height: 0;
	padding: 1.25rem 2rem 2rem;
	overflow-y: auto;
}

.setting-dialog .el-tabs__header {
	margin-bottom: 1.25rem;
}

.setting-dialog .el-tabs__item {
	height: 40px;
	font-size: 14px;
}
</style>
