import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default [
	{
		// ESLint 10 的全局忽略需单独配置
		ignores: [
			'dist/',
			'public/',
			'src-tauri/',
			'auto-imports.d.ts',
			'components.d.ts',
			'.prettierrc.cjs',
			'postcss.config.cjs'
		]
	},
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
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			'vue/multi-word-component-names': 'off',
			// 关闭校验ts不使用的变量
			'@typescript-eslint/no-unused-vars': 'off'
			// "no-unused-vars": "off",
		}
	},
	{
		// Vue SFC 内的 TypeScript 语法需要显式指定脚本解析器
		files: ['**/*.vue'],
		languageOptions: {
			parserOptions: { parser: tseslint.parser }
		}
	},
	{
		// 构建脚本中允许 any
		files: ['scripts/**/*.ts'],
		rules: { '@typescript-eslint/no-explicit-any': 'off' }
	}
]
