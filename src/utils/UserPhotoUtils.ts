/** 预制人像的性别分组 */
export type UserPhotoSex = 'male' | 'female'

export interface UserPhotoPreset {
	/** 唯一标识，与文件名一致，如 user-male_1 */
	id: string
	sex: UserPhotoSex
	src: string
}

/**
 * 预制人像：构建时把 src/assets/image/users 下的照片全部收集成 URL。
 * 后续往该目录里补照片即可自动出现在界面上，无需改代码。
 */
const presetModules = import.meta.glob<string>('../assets/image/users/*.png', {
	eager: true,
	query: '?url',
	import: 'default'
})

const getPresetIndex = (id: string): number => {
	const index = Number(id.split('_').pop())
	return Number.isFinite(index) ? index : 0
}

/** 全部预制人像，先男后女，同性别按文件名序号排列 */
export const USER_PHOTO_PRESETS: UserPhotoPreset[] = Object.keys(presetModules)
	.map((path) => {
		const id = path.replace(/^.*\//, '').replace(/\.png$/i, '')
		return {
			id,
			sex: id.includes('female') ? ('female' as UserPhotoSex) : ('male' as UserPhotoSex),
			src: presetModules[path]
		}
	})
	.sort((a, b) => (a.sex === b.sex ? getPresetIndex(a.id) - getPresetIndex(b.id) : a.sex === 'male' ? -1 : 1))

/** 把表单里的性别文案（男/女）归一成预制人像的分组 */
export function getPhotoSex(sexText?: string): UserPhotoSex {
	return (sexText ?? '').includes('女') ? 'female' : 'male'
}

/** 取某个性别下的可选预制人像 */
export function getPresetsBySex(sex: UserPhotoSex): UserPhotoPreset[] {
	return USER_PHOTO_PRESETS.filter((preset) => preset.sex === sex)
}

/** 取某个性别的默认人像（第一张），用于按性别切换时的兜底 */
export function getDefaultPreset(sex: UserPhotoSex): UserPhotoPreset | undefined {
	return getPresetsBySex(sex)[0]
}
