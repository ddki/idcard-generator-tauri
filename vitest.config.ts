import { fileURLToPath } from 'node:url'
import { mergeConfig, type ConfigEnv, type UserConfig } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'
import viteConfigExport from './vite.config.ts'

// vite.config.ts 导出的是函数式配置，Vite 8 的 mergeConfig 无法直接合并函数，需先求值
const viteConfigFn = viteConfigExport as unknown as (env: ConfigEnv) => UserConfig | Promise<UserConfig>

export default defineConfig(async () => {
	const viteConfig = await viteConfigFn({ command: 'serve', mode: 'test' })

	return mergeConfig(
		viteConfig,
		defineConfig({
			test: {
				environment: 'jsdom',
				exclude: [...configDefaults.exclude, 'e2e/*'],
				root: fileURLToPath(new URL('./', import.meta.url))
			}
		})
	)
})
