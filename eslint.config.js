import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default [
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	...pluginVue.configs['flat/essential'],
	{
		files: [
			// "*/*.js",
			'*/*.cjs',
			'*/*.mjs',
			'*/*.ts',
			'*/*.cts',
			'*/*.mts',
			'src/**/*.js',
			'src/**/*.jsx',
			'src/**/*.ts',
			'src/**/*.tsx',
			'src/**/*.vue'
		],
		ignores: [
			'.prettierrc.cjs',
			'postcss.config.cjs',
			'auto-imports.d.ts',
			'components.d.ts',
			'src-tauri/',
			'dist/',
			'public/'
		],
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			'vue/multi-word-component-names': 'off',
			// 关闭校验ts不使用的变量
			'@typescript-eslint/no-unused-vars': 'off'
			// "no-unused-vars": "off",
		}
	}
]
