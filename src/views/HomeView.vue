<template>
	<h2>与 rust 交互</h2>
	<button class="bg-blue-400 text-light-100 pt-2 pb-2 pl-4 pr-4 hover:text-yellow-200" @click="btnClick">
		调用rust
	</button>
	<p>rust返回信息：{{ message }}</p>

	<div>
		<h2 class="bg-gray-400">事件event</h2>
		<div class="flex-1">
			<a href="https://next--tauri.netlify.app/next/references/architecture/inter-process-communication/">
				link: 进程通信模型
			</a>
		</div>

		<h3 class="bg-gray-300">前端调用</h3>
		<div class="grid gap-2 grid-cols-2 p-2">
			<div class="border-solid border-[2px] border-black">
				<button class="m-2 bg-blue-400 p-2" @click="fontGrobalListenEventClick">全局事件</button>
				<p class="grid gap-0 grid-cols-1 p-2">
					<span class="border-[1px]">event.id = {{ state.fontGrobalListenEvent.id }}</span>
					<span class="border-[1px]">event.event = {{ state.fontGrobalListenEvent.event }}</span>
					<span class="border-[1px]">event.playload = {{ state.fontGrobalListenEvent.playload }}</span>
					<span class="border-[1px]">event.windowLabel = {{ state.fontGrobalListenEvent.windowLabel }}</span>
				</p>
			</div>
		</div>
		<h3 class="bg-gray-300">后台调用</h3>
		<div class="grid gap-2 grid-cols-2 p-2">
			<button class="border-solid border-[2px] border-black" @click="globalEvent">全局事件</button>
			<button class="border-solid border-[2px] border-black" @click="listenGlobalEvent">监听全局事件</button>
			<button class="border-solid border-[2px] border-black" @click="appWindowEvent">
				appWindow-窗口事件（当前窗口）
			</button>
			<button class="border-solid border-[2px] border-black" @click="webViewWindowEvent">
				WebviewWindow-窗口事件（新窗口）
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { invoke } from '@tauri-apps/api'
import { emit, listen } from '@tauri-apps/api/event'
import { appWindow, WebviewWindow } from '@tauri-apps/plugin-window'
import { onMounted, reactive, ref } from 'vue'

const state = reactive({
	fontGrobalListenEvent: {
		id: 0,
		event: '',
		playload: '',
		windowLabel: ''
	}
})

const message = ref()
const btnClick = () => {
	invoke('greet', { name: 'World' })
		// `invoke` returns a Promise
		.then((response: any) => (message.value = response))
}

const fontGrobalListenEvent = async () => {
	await listen('fontGrobalListenEvent', (event) => {
		console.log('前端监听全局事件')
		state.fontGrobalListenEvent.id = event.id
		state.fontGrobalListenEvent.event = event.event
		state.fontGrobalListenEvent.playload = event.payload as string
		state.fontGrobalListenEvent.windowLabel = event.windowLabel
	})
}

const listen_greet = async () => {
	await listen('greet', (event: any) => {
		// event.payload 才是实际的结构体
		message.value = event.payload
	})
}

onMounted(() => {
	fontGrobalListenEvent()
	listen_greet()
})

const fontGrobalListenEventClick = () => {
	emit('fontGrobalListenEvent', {
		theMessage: 'Tauri is awesome!'
	})
}

const globalEvent = () => {
	console.log('globalEvent')
	emit('click_emit', {
		message: 'Tauri is awesome!'
	})
}
const listenGlobalEvent = async () => {
	console.log('listenGlobalEvent')
	await listen('click', (event) => {
		console.log(event.event, event.payload)
	})
}

const appWindowEvent = () => {
	console.log('appWindowEvent')
	appWindow.emit('event', { message: 'Tauri is awesome!' })
}
const webViewWindowEvent = () => {
	console.log('webViewWindowEvent')
	const webview = new WebviewWindow('window')
	webview.emit('event')
}
</script>
