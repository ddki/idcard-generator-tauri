export type Platform =
	| 'win64'
	| 'linux'
	| 'darwin'
	| 'darwin-aarch64'
	| 'darwin-x86_64'
	| 'linux-x86_64'
	| 'windows-x86_64'

export type UpdaterJSON = {
	version: string
	notes: string
	pub_date: string
	platforms: Record<
		Platform,
		{
			signature: string
			url: string
		}
	>
}
