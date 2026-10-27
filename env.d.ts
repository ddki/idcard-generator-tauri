/// <reference types="vite/client" />

// 构建时由 vite define 注入的 package.json 版本号
declare const __APP_VERSION__: string

interface ImportMetaEnv {
	readonly VITE_APP_TITLE: string
	readonly VITE_APP_GOOGLE_ANALYTICS_SCRIPT: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

declare module '*.vue' {
	import type { DefineComponent } from 'vue'
	const component: DefineComponent
	export default component
}
