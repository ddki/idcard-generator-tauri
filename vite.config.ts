import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite'

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
	return {
		base: mode === 'github-page' ? 'idcard-generator-tauri' : '',
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
			target: ['es2021', 'chrome100', 'safari13'],
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
