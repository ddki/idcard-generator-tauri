/** vite 处理图片 */
export const require = (imgPath: string) => {
	try {
		const path = imgPath.replace('@', '..')
		return new URL(path, import.meta.url).href
	} catch (error) {
		console.warn(error)
	}
}
