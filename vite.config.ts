import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

import { internalIpV4 } from 'internal-ip'

import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// @ts-ignore
import ElementPlus from 'unplugin-element-plus/vite'

// https://vitejs.dev/config/
export default defineConfig(async ({ command, mode, ssrBuild }) => {
	const host = await internalIpV4()

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
			host: '0.0.0.0', // listen on all addresses
			port: 5173,
			// 如果端口已经在使用中，则设置为 true 退出，而不是自动尝试下一个可用端口。
			strictPort: true,
			hmr: {
				protocol: 'ws',
				host,
				port: 5183
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
