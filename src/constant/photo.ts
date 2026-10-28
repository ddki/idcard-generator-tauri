/** 证件画布上的矩形区域 */
export interface RectArea {
	x: number
	y: number
	width: number
	height: number
}

/** 身份证（人像面）画布尺寸 */
export const IDCARD_CANVAS = { width: 600, height: 378 }

/** 身份证人像区域 */
export const IDCARD_PHOTO: RectArea = { x: 385, y: 60, width: 180, height: 200 }

/** 永居证（人像面）画布尺寸 */
export const FPR_CANVAS = { width: 600, height: 394 }

/** 永居证人像区域 */
export const FPR_PHOTO: RectArea = { x: 355, y: 90, width: 180, height: 200 }

/** 人像区域宽高比（180 : 200 = 0.9），裁剪与预览都按这个比例 */
export const PHOTO_ASPECT = IDCARD_PHOTO.width / IDCARD_PHOTO.height

/** 裁剪输出尺寸：证件上只显示 180×200，按 3 倍输出保证放大不糊 */
export const PHOTO_OUTPUT = { width: 540, height: 600 }

/**
 * 竖版人像按 cover 铺满人像区域时的锚点。
 * 纵向偏上，避免把头顶裁掉。
 */
export const PHOTO_ANCHOR = { x: 0.5, y: 0.25 }

/** 抠图容差：值越大抠掉的范围越广，默认值适配大多数纯色底照片 */
export const MATTE_TOLERANCE = { defaultValue: 28, min: 6, max: 100 }

/** 图片放进裁剪框的缩放方式 */
export type PhotoFitMode = 'cover' | 'contain' | 'stretch'

/** 缩放方式选项：contain 等比完整显示，cover 铺满裁剪，stretch 拉伸变形 */
export const PHOTO_FIT_MODES: ReadonlyArray<{ value: PhotoFitMode; text: string; desc: string }> = [
	{ value: 'contain', text: '等比缩放', desc: '整张图等比缩入裁剪框，四周留透明边，可继续放大并拖动微调' },
	{ value: 'cover', text: '铺满裁剪', desc: '等比放大铺满裁剪框，拖动图片调整位置，超出部分会被裁掉' },
	{ value: 'stretch', text: '拉伸铺满', desc: '不保持比例直接填满裁剪框，人像会横向或纵向变形' }
]

/** 默认缩放方式：等比缩放，先保证整张照片不被裁掉 */
export const DEFAULT_PHOTO_FIT_MODE: PhotoFitMode = 'contain'
