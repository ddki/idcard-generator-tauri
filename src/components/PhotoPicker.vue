<template>
	<div class="photo-picker">
		<div class="photo-picker__head">
			<h4 class="photo-picker__title">人像</h4>
			<span class="photo-picker__tag">{{ mode === 'preset' ? `${sexText}·内置人像` : '自定义照片' }}</span>
		</div>

		<el-radio-group v-model="mode" size="small" class="photo-picker__modes">
			<el-radio-button value="preset">内置人像</el-radio-button>
			<el-radio-button value="custom">自定义上传</el-radio-button>
		</el-radio-group>

		<div class="photo-picker__body">
			<button
				type="button"
				class="photo-picker__preview"
				:class="{ 'is-empty': !displaySrc }"
				:title="mode === 'custom' && !displaySrc ? '点击上传照片' : '人像预览'"
				@click="onPreviewClick"
			>
				<img v-if="displaySrc" :src="displaySrc" alt="人像预览" />
				<span v-else class="photo-picker__preview-empty">未上传</span>
			</button>
			<div class="photo-picker__meta">
				<p class="photo-picker__desc">{{ modeDesc }}</p>
				<div v-if="mode === 'custom'" class="photo-picker__actions">
					<el-button size="small" @click="triggerUpload">{{ croppedSrc ? '重新上传' : '上传照片' }}</el-button>
					<el-button size="small" :disabled="!croppedSrc" @click="openCropper">裁剪</el-button>
				</div>
			</div>
		</div>

		<!-- 内置人像：只选择，不提供裁剪 / 抠图 -->
		<div v-if="mode === 'preset'" class="photo-picker__presets">
			<button
				v-for="preset in presets"
				:key="preset.id"
				type="button"
				class="photo-picker__thumb"
				:class="{ 'is-active': selectedPreset?.id === preset.id }"
				:title="`使用内置人像 ${preset.id}`"
				@click="selectPreset(preset)"
			>
				<img :src="preset.src" :alt="preset.id" />
			</button>
		</div>

		<!-- 自定义照片：裁剪 + 可选抠图 -->
		<template v-else>
			<div class="photo-picker__option">
				<span class="photo-picker__option-label">抠图（背景透明）</span>
				<el-switch
					v-model="matteEnabled"
					size="small"
					:disabled="!croppedSrc"
					:loading="matteLoading"
					@change="computeMatte"
				/>
			</div>
			<el-slider
				v-if="croppedSrc && matteEnabled"
				v-model="matteTolerance"
				class="photo-picker__tolerance"
				size="small"
				:min="MATTE_TOLERANCE.min"
				:max="MATTE_TOLERANCE.max"
				:show-tooltip="false"
				@change="computeMatte"
			/>
			<p class="photo-picker__hint">{{ matteHint }}</p>
		</template>

		<input ref="fileInputRef" class="photo-picker__file" type="file" accept="image/*" @change="onFileChange" />
		<PhotoCropper
			v-model="cropperVisible"
			v-model:fit-mode="fitMode"
			:src="cropperSrc"
			:aspect="PHOTO_ASPECT"
			@confirm="onCropConfirm"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import PhotoCropper from '@/components/PhotoCropper.vue'
import { DEFAULT_PHOTO_FIT_MODE, MATTE_TOLERANCE, PHOTO_ASPECT, type PhotoFitMode } from '@/constant/photo'
import { readFileAsDataUrl, removeBackground } from '@/utils/ImageUtils'
import {
	getDefaultPreset,
	getPhotoSex,
	getPresetsBySex,
	type UserPhotoPreset,
	type UserPhotoSex
} from '@/utils/UserPhotoUtils'

/** 当前使用的人像图（内置人像 URL 或自定义裁剪/抠图后的 dataURL） */
const model = defineModel<string>({ default: '' })

const props = withDefaults(
	defineProps<{
		/** 表单里的性别文案，用于筛选可用的内置人像 */
		sex?: string
	}>(),
	{ sex: '' }
)

/** 人像来源：内置人像 / 用户自定义上传 */
type PhotoMode = 'preset' | 'custom'

const mode = ref<PhotoMode>('preset')
const selectedPresetId = ref('')
/** 用户上传的原图，重新裁剪时始终从原图开始，避免多次裁剪掉清晰度 */
const rawSrc = ref('')
/** 裁剪后的定尺人像 */
const croppedSrc = ref('')
/** 抠图结果，未开启抠图时为空 */
const mattedSrc = ref('')
const matteEnabled = ref(false)
const matteTolerance = ref(MATTE_TOLERANCE.defaultValue)
const matteLoading = ref(false)
const cropperVisible = ref(false)
const fileInputRef = ref<HTMLInputElement>()
/** 上次使用的缩放方式，重新打开裁剪弹窗时沿用 */
const fitMode = ref<PhotoFitMode>(DEFAULT_PHOTO_FIT_MODE)

const presets = computed(() => getPresetsBySex(getPhotoSex(props.sex)))
const sexText = computed(() => (getPhotoSex(props.sex) === 'female' ? '女' : '男'))

const selectedPreset = computed(() => {
	return presets.value.find((item) => item.id === selectedPresetId.value) ?? presets.value[0]
})

/** 自定义照片经处理后的最终效果 */
const customSrc = computed(() => {
	if (!croppedSrc.value) {
		return ''
	}
	return matteEnabled.value && mattedSrc.value ? mattedSrc.value : croppedSrc.value
})

/** 预览显示的内容：自定义模式下未上传时留空，提示去上传 */
const displaySrc = computed(() => (mode.value === 'custom' ? customSrc.value : (selectedPreset.value?.src ?? '')))

/** 实际绘制到证件上的图，自定义模式未上传时回退到内置人像，避免证件上突然空一块 */
const drawSrc = computed(() => displaySrc.value || selectedPreset.value?.src || '')

/** 裁剪对话框的来源：优先原图，其次裁剪结果 */
const cropperSrc = computed(() => rawSrc.value || croppedSrc.value)

const modeDesc = computed(() => {
	if (mode.value === 'preset') {
		return '内置人像已适配证件人像区域，选中即可'
	}
	return croppedSrc.value ? '已使用自定义照片，可重新裁剪或调整抠图' : '上传一张正面免冠照片，裁剪后可选择抠成透明背景'
})

const matteHint = computed(() => {
	if (!croppedSrc.value) {
		return '上传照片后可开启抠图'
	}
	return matteEnabled.value ? '仅适用于纯色背景照片，边缘有残留时拖动滑杆微调' : '开启后把照片的纯色背景抠成透明'
})

watch(
	drawSrc,
	(value) => {
		model.value = value
	},
	{ immediate: true }
)

/** 上次生效的性别分组：只有性别真的变了才切换内置人像，避免用户手动选过又被重置 */
let lastSex: UserPhotoSex | null = null

watch(
	() => props.sex,
	() => {
		const sex = getPhotoSex(props.sex)
		if (sex === lastSex) {
			return
		}
		lastSex = sex
		// 自定义照片不跟性别变，只有内置人像才按性别自动切到该性别第一张
		if (mode.value === 'custom') {
			return
		}
		selectedPresetId.value = getDefaultPreset(sex)?.id ?? ''
	},
	{ immediate: true }
)

const selectPreset = (preset: UserPhotoPreset): void => {
	mode.value = 'preset'
	selectedPresetId.value = preset.id
}

const triggerUpload = (): void => {
	fileInputRef.value?.click()
}

const onPreviewClick = (): void => {
	if (mode.value === 'custom' && !croppedSrc.value) {
		triggerUpload()
	}
}

const openCropper = (): void => {
	if (!cropperSrc.value) {
		return
	}
	cropperVisible.value = true
}

const onFileChange = async (event: Event): Promise<void> => {
	const input = event.target as HTMLInputElement
	const file = input.files?.[0]
	// 清空 value，保证再次选择同一张文件也能触发 change
	input.value = ''
	if (!file) {
		return
	}
	if (!file.type.startsWith('image/')) {
		ElMessage.warning('请选择图片文件')
		return
	}
	try {
		rawSrc.value = await readFileAsDataUrl(file)
	} catch {
		ElMessage.error('读取图片失败')
		return
	}
	mode.value = 'custom'
	cropperVisible.value = true
}

const onCropConfirm = async (dataUrl: string): Promise<void> => {
	croppedSrc.value = dataUrl
	mode.value = 'custom'
	await computeMatte()
}

/** 抠图是异步的，连续调整时只采用最后一次的结果 */
let matteTask = 0

const computeMatte = async (): Promise<void> => {
	const task = ++matteTask
	if (!croppedSrc.value || !matteEnabled.value) {
		mattedSrc.value = ''
		return
	}
	matteLoading.value = true
	try {
		const result = await removeBackground(croppedSrc.value, { tolerance: matteTolerance.value })
		if (task === matteTask) {
			mattedSrc.value = result
		}
	} finally {
		if (task === matteTask) {
			matteLoading.value = false
		}
	}
}
</script>

<style lang="less" scoped>
.photo-picker {
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding-bottom: 16px;
	border-bottom: 1px solid var(--el-border-color-lighter);
}

.photo-picker__head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.photo-picker__title {
	margin: 0;
	font-size: 14px;
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.photo-picker__tag {
	padding: 1px 8px;
	border-radius: 999px;
	background: var(--el-color-primary-light-9);
	font-size: 12px;
	color: var(--el-color-primary);
}

/* 两种人像来源切换，等宽铺满 */
.photo-picker__modes {
	display: flex;
	width: 100%;

	:deep(.el-radio-button) {
		flex: 1;
	}

	:deep(.el-radio-button__inner) {
		width: 100%;
	}
}

.photo-picker__body {
	display: flex;
	gap: 10px;
}

/* 预览按人像区域比例展示，棋盘格表示透明背景 */
.photo-picker__preview {
	display: flex;
	flex: none;
	align-items: center;
	justify-content: center;
	width: 66px;
	height: 74px;
	padding: 0;
	overflow: hidden;
	border: 1px solid var(--el-border-color);
	border-radius: 6px;
	background-color: #fff;
	background-image: repeating-conic-gradient(var(--el-fill-color) 0% 25%, transparent 0% 50%);
	background-size: 10px 10px;
	cursor: default;

	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	&.is-empty {
		border-style: dashed;
		cursor: pointer;
	}
}

.photo-picker__preview-empty {
	font-size: 12px;
	color: var(--el-text-color-placeholder);
}

.photo-picker__meta {
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 8px;
	min-width: 0;
}

.photo-picker__desc {
	margin: 0;
	font-size: 12px;
	line-height: 1.5;
	color: var(--el-text-color-secondary);
}

.photo-picker__actions {
	display: flex;
	flex-direction: column;
	gap: 8px;

	:deep(.el-button) {
		width: 100%;
		margin-left: 0;
	}
}

.photo-picker__presets {
	display: grid;
	grid-template-columns: repeat(5, minmax(0, 1fr));
	gap: 6px;
}

.photo-picker__thumb {
	position: relative;
	box-sizing: border-box;
	aspect-ratio: 3 / 4;
	padding: 0;
	overflow: hidden;
	border: 1px solid var(--el-border-color);
	border-radius: 6px;
	background: #fff;
	cursor: pointer;
	transition:
		border-color 0.2s,
		box-shadow 0.2s;

	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	&:hover {
		border-color: var(--el-color-primary-light-3);
	}

	&.is-active {
		border-color: var(--el-color-primary);
		box-shadow: 0 0 0 2px var(--el-color-primary-light-7);
	}
}

.photo-picker__option {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
}

.photo-picker__option-label {
	font-size: 13px;
	color: var(--el-text-color-regular);
}

.photo-picker__tolerance {
	margin: -4px 0 0;
}

.photo-picker__hint {
	margin: 0;
	font-size: 12px;
	line-height: 1.5;
	color: var(--el-text-color-secondary);
}

/* 隐藏原生文件选择框，用按钮触发 */
.photo-picker__file {
	display: none;
}
</style>
