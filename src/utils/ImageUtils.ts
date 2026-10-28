import { MATTE_TOLERANCE, PHOTO_ANCHOR, type RectArea } from '@/constant/photo'

/** RGBA 像素数据（与 ImageData 结构兼容，便于脱离浏览器环境测试） */
export interface PixelImage {
	data: Uint8ClampedArray
	width: number
	height: number
}

/** 抠图参数 */
export interface MatteOptions {
	/** 颜色容差，越大抠掉的范围越广 */
	tolerance?: number
	/** 工作副本最长边，过大时先等比缩小，控制在几十毫秒内 */
	maxSide?: number
}

/**
 * 加载图片，失败时返回 null。
 * 用 Promise 统一替代 onload 回调，避免多张图互相等待造成的绘制顺序问题。
 */
export function loadImage(src: string): Promise<HTMLImageElement | null> {
	return new Promise((resolve) => {
		if (!src) {
			resolve(null)
			return
		}
		const image = new Image()
		image.onload = () => resolve(image)
		image.onerror = () => resolve(null)
		image.src = src
	})
}

/** 读取用户选择的本地图片为 dataURL（Web 与 Tauri WebView 都支持 FileReader） */
export function readFileAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result as string)
		reader.onerror = () => reject(reader.error)
		reader.readAsDataURL(file)
	})
}

/**
 * 按 cover 方式绘制：等比放大到铺满目标区域，超出部分裁掉。
 * 不做等比处理时，竖版人像会被硬拉伸变形。
 */
function drawImageCover(
	ctx: CanvasRenderingContext2D,
	image: HTMLImageElement,
	rect: RectArea,
	anchor: { x: number; y: number } = PHOTO_ANCHOR
): void {
	const scale = Math.max(rect.width / image.width, rect.height / image.height)
	const drawWidth = image.width * scale
	const drawHeight = image.height * scale
	const offsetX = (drawWidth - rect.width) * anchor.x
	const offsetY = (drawHeight - rect.height) * anchor.y
	ctx.drawImage(image, rect.x - offsetX, rect.y - offsetY, drawWidth, drawHeight)
}

/**
 * 在人像区域绘制人像，背景保持透明（不铺底色）。
 * 按 cover 等比铺满后裁剪到人像区域内，避免竖版人像被拉伸或盖住证件文字。
 * @returns 是否成功绘制
 */
export async function drawUserPhoto(ctx: CanvasRenderingContext2D, src: string, rect: RectArea): Promise<boolean> {
	if (!src) {
		return false
	}
	const image = await loadImage(src)
	if (!image) {
		return false
	}
	ctx.save()
	ctx.beginPath()
	ctx.rect(rect.x, rect.y, rect.width, rect.height)
	ctx.clip()
	drawImageCover(ctx, image, rect)
	ctx.restore()
	return true
}

/** 图片在输出画布上的摆放（可以是负坐标或超出画布，超出部分会被裁掉） */
export interface ImagePlacement {
	x: number
	y: number
	width: number
	height: number
}

/**
 * 按给定的摆放位置把图片画到输出画布上，导出 dataURL。
 * 铺满裁剪、等比缩放（含留边）、拉伸三种方式都走这一条路径：
 * 只是摆放位置和尺寸不同，没被图片盖住的地方保持透明。
 */
export function composeImageToDataUrl(
	image: HTMLImageElement,
	placement: ImagePlacement,
	outputWidth: number,
	outputHeight: number
): string {
	const canvas = document.createElement('canvas')
	canvas.width = outputWidth
	canvas.height = outputHeight
	const ctx = canvas.getContext('2d')
	if (ctx) {
		ctx.imageSmoothingQuality = 'high'
		ctx.drawImage(image, placement.x, placement.y, placement.width, placement.height)
	}
	return canvas.toDataURL('image/png')
}

/** 取两像素的色差（各通道差值的最大值，便于把容差理解成 0~255 的直观刻度） */
function colorDistance(data: Uint8ClampedArray, offset: number, rgb: [number, number, number]): number {
	return Math.max(
		Math.abs(data[offset] - rgb[0]),
		Math.abs(data[offset + 1] - rgb[1]),
		Math.abs(data[offset + 2] - rgb[2])
	)
}

/** 用四边像素的中位数估计背景色，避免单个角落的噪点影响结果 */
function estimateBackgroundColor(image: PixelImage): [number, number, number] {
	const { data, width, height } = image
	const step = Math.max(1, Math.floor(Math.min(width, height) / 40))
	const channels: number[][] = [[], [], []]
	const collect = (x: number, y: number): void => {
		const offset = (y * width + x) * 4
		if (data[offset + 3] < 8) {
			return
		}
		channels[0].push(data[offset])
		channels[1].push(data[offset + 1])
		channels[2].push(data[offset + 2])
	}
	for (let x = 0; x < width; x += step) {
		collect(x, 0)
		collect(x, height - 1)
	}
	for (let y = 0; y < height; y += step) {
		collect(0, y)
		collect(width - 1, y)
	}
	const median = (values: number[]): number => {
		if (!values.length) {
			return 255
		}
		const sorted = [...values].sort((a, b) => a - b)
		return sorted[Math.floor(sorted.length / 2)]
	}
	return [median(channels[0]), median(channels[1]), median(channels[2])]
}

/**
 * 纯色背景抠图（原地修改像素）。
 *
 * 做法：以四边像素估计底色，从图像四边向内做洪水填充，只把「与边缘连通」的底色变透明，
 * 因此人像内部同色区域（白衬衫、牙齿等）不会被误伤。最后对紧邻透明区域的像素做一次羽化，
 * 避免出现锯齿硬边。
 *
 * 适用于证件照这类纯色背景照片，不依赖任何在线服务或模型文件。
 */
export function matteImageData(image: PixelImage, tolerance: number = MATTE_TOLERANCE.defaultValue): PixelImage {
	const { data, width, height } = image
	const total = width * height
	if (total === 0) {
		return image
	}
	const background = estimateBackgroundColor(image)
	const removed = new Uint8Array(total)
	const stack: number[] = []

	const tryPush = (index: number): void => {
		if (removed[index]) {
			return
		}
		const offset = index * 4
		// 已经是透明像素的，直接视为背景
		if (data[offset + 3] >= 8 && colorDistance(data, offset, background) > tolerance) {
			return
		}
		removed[index] = 1
		stack.push(index)
	}

	for (let x = 0; x < width; x++) {
		tryPush(x)
		tryPush((height - 1) * width + x)
	}
	for (let y = 0; y < height; y++) {
		tryPush(y * width)
		tryPush(y * width + width - 1)
	}

	while (stack.length) {
		const index = stack.pop() as number
		const x = index % width
		const y = (index - x) / width
		if (x > 0) {
			tryPush(index - 1)
		}
		if (x < width - 1) {
			tryPush(index + 1)
		}
		if (y > 0) {
			tryPush(index - width)
		}
		if (y < height - 1) {
			tryPush(index + width)
		}
	}

	for (let index = 0; index < total; index++) {
		if (removed[index]) {
			data[index * 4 + 3] = 0
		}
	}

	// 边缘羽化：紧邻透明区域、又与底色有差异的像素给半透明，过渡更自然
	const featherRange = tolerance * 1.5 + 1
	for (let y = 1; y < height - 1; y++) {
		for (let x = 1; x < width - 1; x++) {
			const index = y * width + x
			if (removed[index]) {
				continue
			}
			const touched = removed[index - 1] || removed[index + 1] || removed[index - width] || removed[index + width]
			if (!touched) {
				continue
			}
			const offset = index * 4
			const distance = colorDistance(data, offset, background)
			const ratio = Math.min(1, Math.max(0, (distance - tolerance) / featherRange))
			data[offset + 3] = Math.round(data[offset + 3] * ratio)
		}
	}

	return image
}

/**
 * 对图片做纯色背景抠图，返回新的 dataURL（PNG，保留透明度）。
 * 原图或处理失败时返回原值，保证界面上不会变成空白。
 */
export async function removeBackground(src: string, options: MatteOptions = {}): Promise<string> {
	const image = await loadImage(src)
	if (!image) {
		return src
	}
	const tolerance = Math.min(
		MATTE_TOLERANCE.max,
		Math.max(MATTE_TOLERANCE.min, options.tolerance ?? MATTE_TOLERANCE.defaultValue)
	)
	const maxSide = options.maxSide ?? 900
	const scale = Math.min(1, maxSide / Math.max(image.width, image.height))
	const width = Math.max(1, Math.round(image.width * scale))
	const height = Math.max(1, Math.round(image.height * scale))

	const canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height
	const ctx = canvas.getContext('2d')
	if (!ctx) {
		return src
	}
	ctx.drawImage(image, 0, 0, width, height)
	const imageData = ctx.getImageData(0, 0, width, height)
	matteImageData(imageData, tolerance)
	ctx.putImageData(imageData, 0, 0)
	return canvas.toDataURL('image/png')
}
