<template>
	<div class="p-4">
		<el-form label-suffix="：" label-width="auto">
			<el-form-item label="开机自启">
				<el-radio-group v-model="form.autostart">
					<el-radio value="true">开启</el-radio>
					<el-radio value="false">关闭</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="后台常驻">
				<el-radio-group v-model="form.singleInstance">
					<el-radio value="true">开启</el-radio>
					<el-radio value="false">关闭</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="onSubmit">保存</el-button>
			</el-form-item>
		</el-form>
	</div>
	<div class="p-4">
		<span class="pt-4 pr-8">
			版本：<el-tag type="primary">V{{ appVersion }}</el-tag>
		</span>
		<span class="pt-4">
			<el-button type="success" @click="checkUpdate()">检查更新</el-button>
		</span>
	</div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { getVersion } from '@tauri-apps/api/app'
import { Store } from '@tauri-apps/plugin-store'
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { ElMessage } from 'element-plus'

const appVersion = await getVersion()

const store = new Store('settings.json')

const singleInstance = await store.get('single-instance')
const autostart = await store.get('autostart')

console.log('singleInstance: ', singleInstance)
console.log('autostart: ', autostart)

const form = reactive({
	singleInstance: singleInstance as boolean,
	autostart: autostart as boolean
})

const onSubmit = async () => {
	await store.set('single-instance', form.singleInstance)
	await store.set('autostart', form.autostart)
	await store.save()
}

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
</script>
