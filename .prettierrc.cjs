const config = {
	// 分号结尾
	semi: false,
	useTabs: true,
	tabWidth: 2,
	// 单引号
	singleQuote: true,
	printWidth: 120,
	// 是否逗号结尾
	trailingComma: 'none',
	endOfLine: 'lf',
	// eslint-disable-ignore-pattern
	plugins: ['prettier-plugin-tailwindcss'],
	// Tailwind CSS v4 需要显式指定 CSS 入口
	tailwindStylesheet: './src/styles/index.css'
}

// eslint-disable-next-line no-undef
module.exports = config
