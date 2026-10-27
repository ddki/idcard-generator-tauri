// eslint-disable-next-line no-undef
module.exports = {
	npm: {
		allowSameVersion: true
	},
	hooks: {
		'after:bump': ['npx prettier --write {package,./src-tauri/tauri.conf}.json', 'npx esno scripts/changelog.ts']
	},
	git: {
		commitMessage: "🔖 release: v${version}",
		tagName: 'v${version}'
	},
	plugins: {
		'@release-it/conventional-changelog': {
			writerOpts: {},
			context: {
				linkCompare: true
			},
			infile: 'CHANGE_LOG.md',
			header: '# 📄 更新日志',
			preset: {
				name: 'conventionalcommits',
				types: [
					{
						type: 'feat',
						section: '✨ 新增功能 | A new feature'
					},
					{
						type: 'fix',
						section: '🐛 修复缺陷 | A bug fix'
					},
					{
						type: 'docs',
						section: '📝 文档更新 | Documentation only changes'
					},
					{
						type: 'style',
						section: '💄 代码格式 | Changes that do not affect the meaning of the code'
					},
					{
						type: 'refactor',
						section: '♻️ 代码重构 | A code change that neither fixes a bug nor adds a feature'
					},
					{
						type: 'perf',
						section: '⚡️ 性能提升 | A code change that improves performance'
					},
					{
						type: 'test',
						section: '✅ 测试相关 | Adding missing tests or correcting existing tests'
					},
					{
						type: 'build',
						section: ' 📦️ 构建相关 | Changes that affect the build system or external dependencies'
					},
					{
						type: 'ci',
						section: '🎡 持续集成 | Changes to our CI configuration files and scripts'
					},
					{
						type: 'revert',
						section: '⏪️ 回退代码 | Revert to a commit'
					},
					{
						type: 'chore',
						section: '🔨 其他修改 | Other changes that do not modify src or test files'
					}
				]
			}
		},
		// 读写版本
		'@release-it/bumper': {
			out: [
				{
					file: 'package.json',
					path: 'version'
				},
				{
					file: './src-tauri/tauri.conf.json',
					path: 'version'
				},
				{
					file: './src-tauri/Cargo.toml',
					path: 'package.version'
				}
			]
		}
	}
}
