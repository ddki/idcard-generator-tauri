/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
	root: true,
	// env: {
	// 	node: true
	// },
	globals: {
		API: 'readonly',
		defs: 'readonly'
	},
	extends: [
		'plugin:vue/vue3-essential',
		'eslint:recommended',
		'@vue/eslint-config-typescript',
		'@vue/eslint-config-prettier/skip-formatting',
		'plugin:prettier/recommended'
	],
	parserOptions: {
		ecmaVersion: 'latest'
	},
	rules: {
		'vue/multi-word-component-names': 'off',
		// 关闭校验ts不使用的变量
		'@typescript-eslint/no-unused-vars': 'off',
		'prettier/prettier': [
			'error',
			{
				useTabs: true,
				tabWidth: 2,
				endOfLine: 'lf'
			}
		]
	}
}
