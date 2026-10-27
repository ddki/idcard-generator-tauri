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
			include: ['@kangc/v-md-editor/lib/theme/vuepress.js']
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
			port: 5173,
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
