<template>
	<el-dialog
		v-model="visible"
		title="裁剪人像"
		width="404px"
		append-to-body
		:close-on-click-modal="false"
		class="photo-cropper"
	>
		<div class="photo-cropper__fits">
			<el-radio-group v-model="fitMode" size="small" class="photo-cropper__fit-group">
				<el-radio-button v-for="item in PHOTO_FIT_MODES" :key="item.value" :value="item.value">
					{{ item.text }}
				</el-radio-button>
			</el-radio-group>
			<p class="photo-cropper__tip">{{ fitDesc }}</p>
		</div>

		<div
			class="photo-cropper__stage"
			:class="{ 'is-interactive': adjustable }"
			:style="{ width: `${viewSize}px`, height: `${viewSize}px` }"
			@pointerdown="onPointerDown"
			@pointermove="onPointerMove"
			@pointerup="onPointerUp"
			@pointercancel="onPointerUp"
			@wheel.prevent="onWheel"
		>
			<img
				v-if="natural.width"
				class="photo-cropper__image"
				:src="src"
				:style="imageStyle"
				draggable="false"
				alt="待裁剪人像"
			/>
			<div class="photo-cropper__frame" :style="frameStyle"></div>
			<div v-if="!natural.width" class="photo-cropper__loading">图片加载中…</div>
		</div>

		<div v-if="adjustable" class="photo-cropper__zoom">
			<span class="photo-cropper__zoom-label">缩放</span>
			<el-slider
				:model-value="zoom"
				:min="MIN_ZOOM"
				:max="MAX_ZOOM"
				:step="0.01"
				:show-tooltip="false"
				@update:model-value="setZoom"
			/>
		</div>

		<template #footer>
			<el-button @click="resetTransform">重置</el-button>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" :disabled="!natural.width" @click="onConfirm">确定</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, shallowRef, watch } from 'vue'
import {
	DEFAULT_PHOTO_FIT_MODE,
	PHOTO_ASPECT,
	PHOTO_FIT_MODES,
	PHOTO_OUTPUT,
	type PhotoFitMode
} from '@/constant/photo'
import { composeImageToDataUrl, loadImage } from '@/utils/ImageUtils'

const visible = defineModel<boolean>({ default: false })
/** 缩放方式：记住上次选择，重新打开时沿用 */
const fitMode = defineModel<PhotoFitMode>('fitMode', { default: DEFAULT_PHOTO_FIT_MODE })

const props = withDefaults(
	defineProps<{
		/** 待裁剪的图片（dataURL 或资源 URL） */
		src: string
		/** 裁剪框宽高比，默认与证件人像区域一致 */
		aspect?: number
	}>(),
	{ aspect: PHOTO_ASPECT }
)

const emit = defineEmits<{ confirm: [dataUrl: string] }>()

/** 预览视口边长 */
const viewSize = 320
/** 裁剪框高度，宽度按比例算出来 */
const cropHeight = 280
const MIN_ZOOM = 1
const MAX_ZOOM = 3

const cropWidth = computed(() => Math.round(cropHeight * props.aspect))
/** 已加载的原图对象，导出时直接复用，避免重复解码 */
const pendingImage = shallowRef<HTMLImageElement | null>(null)
const natural = reactive({ width: 0, height: 0 })
const zoom = ref(MIN_ZOOM)
const offset = reactive({ x: 0, y: 0 })

/** 铺满裁剪与等比缩放都可以拖动和缩放，拉伸铺满按固定规则摆放 */
const adjustable = computed(() => fitMode.value !== 'stretch')

/** 让图片刚好铺满裁剪框的缩放比例，zoom = 1 时即此比例 */
const coverScale = computed(() => {
	if (!natural.width || !natural.height) {
		return 1
	}
	return Math.max(cropWidth.value / natural.width, cropHeight / natural.height)
})

/** 让整张图完整放进裁剪框的比例 */
const containScale = computed(() => {
	if (!natural.width || !natural.height) {
		return 1
	}
	return Math.min(cropWidth.value / natural.width, cropHeight / natural.height)
})

/** 图片在视口中的显示尺寸，随缩放方式切换 */
const displaySize = computed(() => {
	if (!natural.width || !natural.height) {
		return { width: 0, height: 0 }
	}
	if (fitMode.value === 'stretch') {
		return { width: cropWidth.value, height: cropHeight }
	}
	// 等比缩放从「整张图完整显示」起步，铺满裁剪从「刚好盖满裁剪框」起步，两者都能继续放大
	const baseScale = fitMode.value === 'contain' ? containScale.value : coverScale.value
	return { width: natural.width * baseScale * zoom.value, height: natural.height * baseScale * zoom.value }
})

/** 视口内的拖动偏移，拉伸铺满不参与拖动 */
const offsetX = computed(() => (adjustable.value ? offset.x : 0))
const offsetY = computed(() => (adjustable.value ? offset.y : 0))

/** 图片在视口中的位置：以裁剪框中心对齐，再叠加拖动偏移 */
const imageStyle = computed(() => ({
	width: `${displaySize.value.width}px`,
	height: `${displaySize.value.height}px`,
	left: `${viewSize / 2 + offsetX.value - displaySize.value.width / 2}px`,
	top: `${viewSize / 2 + offsetY.value - displaySize.value.height / 2}px`
}))

const frameStyle = computed(() => ({
	width: `${cropWidth.value}px`,
	height: `${cropHeight}px`
}))

const fitDesc = computed(() => {
	return PHOTO_FIT_MODES.find((item) => item.value === fitMode.value)?.desc ?? ''
})

/**
 * 限制拖动范围：
 * 图片比裁剪框大时不允许拖出空白，比裁剪框小时不允许整张图跑出裁剪框。
 * 两种情况的可用偏移量都是「尺寸差的一半」，取绝对值即可统一处理。
 */
const clampOffset = (): void => {
	const maxX = Math.abs(displaySize.value.width - cropWidth.value) / 2
	const maxY = Math.abs(displaySize.value.height - cropHeight) / 2
	offset.x = Math.min(maxX, Math.max(-maxX, offset.x))
	offset.y = Math.min(maxY, Math.max(-maxY, offset.y))
}

const resetTransform = (): void => {
	zoom.value = MIN_ZOOM
	offset.x = 0
	offset.y = 0
}

const setZoom = (value: number): void => {
	zoom.value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
	clampOffset()
}

const onWheel = (event: WheelEvent): void => {
	if (!adjustable.value || !natural.width) {
		return
	}
	setZoom(zoom.value * (event.deltaY < 0 ? 1.08 : 1 / 1.08))
}

let dragging = false
let dragStartX = 0
let dragStartY = 0
let dragOriginX = 0
let dragOriginY = 0

const onPointerDown = (event: PointerEvent): void => {
	if (!adjustable.value || !natural.width) {
		return
	}
	dragging = true
	dragStartX = event.clientX
	dragStartY = event.clientY
	dragOriginX = offset.x
	dragOriginY = offset.y
	;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

const onPointerMove = (event: PointerEvent): void => {
	if (!dragging) {
		return
	}
	offset.x = dragOriginX + (event.clientX - dragStartX)
	offset.y = dragOriginY + (event.clientY - dragStartY)
	clampOffset()
}

const onPointerUp = (event: PointerEvent): void => {
	if (!dragging) {
		return
	}
	dragging = false
	const target = event.currentTarget as HTMLElement
	if (target.hasPointerCapture(event.pointerId)) {
		target.releasePointerCapture(event.pointerId)
	}
}

/**
 * 把视口里「裁剪框那一片」原样导出：
 * 先按视口比例把图片的摆放位置换算到输出画布，框外的部分由画布裁掉，
 * 没被图片盖住的地方（等比缩放的留边）保持透明。
 */
const renderFrame = (): string => {
	const frameLeft = viewSize / 2 - cropWidth.value / 2
	const frameTop = viewSize / 2 - cropHeight / 2
	const imageLeft = viewSize / 2 + offsetX.value - displaySize.value.width / 2
	const imageTop = viewSize / 2 + offsetY.value - displaySize.value.height / 2
	// 视口像素 -> 输出像素
	const ratio = PHOTO_OUTPUT.width / cropWidth.value
	const image = pendingImage.value
	if (!image) {
		return ''
	}
	return composeImageToDataUrl(
		image,
		{
			x: (imageLeft - frameLeft) * ratio,
			y: (imageTop - frameTop) * ratio,
			width: displaySize.value.width * ratio,
			height: displaySize.value.height * ratio
		},
		PHOTO_OUTPUT.width,
		PHOTO_OUTPUT.height
	)
}

const onConfirm = (): void => {
	const dataUrl = renderFrame()
	if (!dataUrl) {
		return
	}
	emit('confirm', dataUrl)
	visible.value = false
}

const prepare = async (): Promise<void> => {
	resetTransform()
	natural.width = 0
	natural.height = 0
	pendingImage.value = null
	const image = await loadImage(props.src)
	pendingImage.value = image
	natural.width = image?.naturalWidth ?? 0
	natural.height = image?.naturalHeight ?? 0
}

watch(visible, (value) => {
	if (value) {
		prepare()
	}
})

// 切换缩放方式后旧的拖动/缩放状态没有意义，重置回居中
watch(fitMode, () => {
	resetTransform()
})
</script>

<style lang="less" scoped>
.photo-cropper__fits {
	margin-bottom: 12px;
}

.photo-cropper__fit-group {
	display: flex;
	width: 100%;

	:deep(.el-radio-button) {
		flex: 1;
	}

	:deep(.el-radio-button__inner) {
		width: 100%;
	}
}

.photo-cropper__tip {
	margin: 8px 0 0;
	font-size: 12px;
	line-height: 1.6;
	color: var(--el-text-color-secondary);
}

/* 棋盘格表示透明区域：等比缩放留下的边就是透明的 */
.photo-cropper__stage {
	position: relative;
	margin: 0 auto;
	overflow: hidden;
	border-radius: 8px;
	background-color: #fff;
	background-image: repeating-conic-gradient(#ededed 0% 25%, transparent 0% 50%);
	background-size: 12px 12px;
	touch-action: none;

	&.is-interactive {
		cursor: grab;

		&:active {
			cursor: grabbing;
		}
	}
}

.photo-cropper__image {
	position: absolute;
	// Tailwind preflight 给所有 img 加了 max-width: 100%，放大的图片宽度会被卡在视口宽度上、
	// 高度却还在长，结果就是人像被横向压窄，这里必须放开
	max-width: none;
	max-height: none;
	user-select: none;
	pointer-events: none;
}

/* 裁剪框：靠超大 box-shadow 铺出框外遮罩 */
.photo-cropper__frame {
	position: absolute;
	top: 50%;
	left: 50%;
	box-sizing: border-box;
	transform: translate(-50%, -50%);
	border: 1px solid var(--el-color-primary);
	box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.45);
	pointer-events: none;
}

.photo-cropper__loading {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 13px;
	color: var(--el-text-color-secondary);
}

.photo-cropper__zoom {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-top: 12px;
}

.photo-cropper__zoom-label {
	flex: none;
	font-size: 13px;
	color: var(--el-text-color-regular);
}

.photo-cropper__zoom :deep(.el-slider) {
	flex: 1;
}
</style>
