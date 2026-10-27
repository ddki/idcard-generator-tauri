import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite'

const { version } = JSON.parse(readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8')) as {
	version: string
}

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
	return {
		base: mode === 'github-page' ? 'idcard-generator-tauri' : '',
		// 纯 Web 构建下没有 Tauri API，版本号回退到 package.json
		define: {
			__APP_VERSION__: JSON.stringify(version)
		},
		plugins: [
			vue(),
			vueJsx(),
			ElementPlus({
				useSource: true
			}),
			AutoImport({
				resolvers: [ElementPlusResolver()]
			}),
			Components({
				resolvers: [ElementPlusResolver()]
			})
		],
		optimizeDeps: {
			// 按需引入的 Element Plus 组件样式是深层模块，Vite 只有在真正 import 到时才会发现。
			// 路由组件是懒加载的，首次进入某个页面时才发现 table/drawer/date-picker 等依赖，
			// 于是触发 “optimized dependencies changed. reloading” 整页刷新。
			// 这里把用到的组件样式入口全部预构建，切成路由时就不会再重新优化。
			include: [
				'element-plus/es/components/alert/style/css',
				'element-plus/es/components/autocomplete/style/css',
				'element-plus/es/components/button/style/css',
				'element-plus/es/components/cascader/style/css',
				'element-plus/es/components/collapse/style/css',
				'element-plus/es/components/collapse-item/style/css',
				'element-plus/es/components/container/style/css',
				'element-plus/es/components/date-picker/style/css',
				'element-plus/es/components/dialog/style/css',
				'element-plus/es/components/drawer/style/css',
				'element-plus/es/components/empty/style/css',
				'element-plus/es/components/form/style/css',
				'element-plus/es/components/form-item/style/css',
				'element-plus/es/components/input/style/css',
				'element-plus/es/components/input-number/style/css',
				'element-plus/es/components/menu/style/css',
				'element-plus/es/components/menu-item/style/css',
				'element-plus/es/components/message/style/css',
				'element-plus/es/components/option/style/css',
				'element-plus/es/components/radio/style/css',
				'element-plus/es/components/radio-button/style/css',
				'element-plus/es/components/radio-group/style/css',
				'element-plus/es/components/select/style/css',
				'element-plus/es/components/switch/style/css',
				'element-plus/es/components/table/style/css',
				'element-plus/es/components/table-column/style/css',
				'element-plus/es/components/tabs/style/css',
				'element-plus/es/components/tag/style/css',
				'element-plus/es/components/tooltip/style/css'
			]
		},
		resolve: {
			alias: {
				'@tauri-apps/api': fileURLToPath(new URL('./node_modules/@tauri-apps/api', import.meta.url)),
				'@': fileURLToPath(new URL('./src', import.meta.url))
			}
		},
		// 防止 Vite 在记录某些消息时清除终端屏幕
		clearScreen: false,
		server: {
			// 5173 落在 Windows 的 winnat 排除端口段（5083-5182，Hyper-V/WSL2/Docker 保留）内，
			// 绑定会报 EACCES，因此改用 Tauri 默认的 1420
			port: 1420,
			strictPort: true,
			watch: {
				// 3. tell vite to ignore watching `src-tauri`
				ignored: ['**/src-tauri/**']
			}
		},
		envPrefix: ['VITE_', 'TAURI_'],
		build: {
			// Tauri 2 使用系统 WebView（Windows: WebView2 / macOS: WKWebView 15+）
			target: ['es2022', 'chrome105', 'safari15'],
			// don't minify for debug builds
			minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
			// produce sourcemaps for debug builds
			sourcemap: !!process.env.TAURI_DEBUG,
			rollupOptions: {
				input: {
					index: fileURLToPath(new URL('./index.html', import.meta.url)),
					splashscreen: fileURLToPath(new URL('./splashscreen.html', import.meta.url))
				},
				output: {}
			}
		}
	}
})
