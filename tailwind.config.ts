import type { Config } from 'tailwindcss'

export default {
	content: ['./index.html', './splashscreen.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	theme: {
		extend: {}
	},
	plugins: []
} satisfies Config
