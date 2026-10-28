import { describe, expect, it } from 'vitest'
import { matteImageData, type PixelImage } from '../ImageUtils'
import { getPhotoSex, getPresetsBySex, USER_PHOTO_PRESETS } from '../UserPhotoUtils'

/** 构造一张纯色底 + 居中色块的测试图 */
function createImage(size: number, background: [number, number, number], block: [number, number, number]): PixelImage {
	const data = new Uint8ClampedArray(size * size * 4)
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const offset = (y * size + x) * 4
			const inBlock = x >= size / 4 && x < (size * 3) / 4 && y >= size / 4 && y < (size * 3) / 4
			const color = inBlock ? block : background
			data[offset] = color[0]
			data[offset + 1] = color[1]
			data[offset + 2] = color[2]
			data[offset + 3] = 255
		}
	}
	return { data, width: size, height: size }
}

const alphaAt = (image: PixelImage, x: number, y: number): number => image.data[(y * image.width + x) * 4 + 3]

describe('matteImageData', () => {
	it('把与边缘连通的纯色背景变透明，保留中间人像', () => {
		const image = matteImageData(createImage(20, [255, 255, 255], [200, 30, 30]), 30)

		expect(alphaAt(image, 0, 0)).toBe(0)
		expect(alphaAt(image, 19, 19)).toBe(0)
		expect(alphaAt(image, 10, 10)).toBe(255)
	})

	it('人像内部与底色相同的区域不会被误删', () => {
		// 白底 + 中间白块被一圈黑边包住：白块不与边缘连通，应保持不透明
		const size = 30
		const image = createImage(size, [255, 255, 255], [255, 255, 255])
		for (let y = 8; y < 22; y++) {
			for (let x = 8; x < 22; x++) {
				const isBorder = x === 8 || x === 21 || y === 8 || y === 21
				if (!isBorder) {
					continue
				}
				const offset = (y * size + x) * 4
				image.data[offset] = 0
				image.data[offset + 1] = 0
				image.data[offset + 2] = 0
			}
		}

		matteImageData(image, 30)

		expect(alphaAt(image, 0, 0)).toBe(0)
		expect(alphaAt(image, 15, 15)).toBe(255)
	})

	it('容差之外的颜色不会被抠掉', () => {
		const image = matteImageData(createImage(20, [250, 250, 250], [30, 30, 30]), 10)

		expect(alphaAt(image, 0, 0)).toBe(0)
		expect(alphaAt(image, 10, 10)).toBe(255)
	})
})

describe('UserPhotoUtils', () => {
	it('按文件名把预制人像分成男女两组', () => {
		expect(USER_PHOTO_PRESETS.length).toBeGreaterThan(0)
		expect(getPresetsBySex('male').every((item) => item.id.includes('male'))).toBe(true)
		expect(getPresetsBySex('female').every((item) => item.id.includes('female'))).toBe(true)
	})

	it('性别文案归一化', () => {
		expect(getPhotoSex('男')).toBe('male')
		expect(getPhotoSex('女/F')).toBe('female')
		expect(getPhotoSex('')).toBe('male')
	})
})
