<template>
	<div class="viewer">
		<div class="left-form" ref="form">
			<el-form :inline="true" size="default" label-width="90px" label-position="left" label-suffix=":">
				<el-form-item label="姓名">
					<el-input v-model="formData.name" placeholder="姓名" />
				</el-form-item>
				<el-form-item label="民族">
					<el-input v-model="formData.nation" placeholder="民族" />
				</el-form-item>
				<el-form-item label="身份证号">
					<el-input v-model="formData.idCard" placeholder="身份证号" @change="onChangeIdCard" />
				</el-form-item>
				<el-form-item label="性别">
					<el-input v-model="formData.sexText" placeholder="性别" />
				</el-form-item>
				<el-form-item label="住址">
					<el-input v-model="formData.address" placeholder="住址" />
				</el-form-item>
				<el-form-item label="签发机关">
					<el-input v-model="formData.office" placeholder="签发机关" />
				</el-form-item>
				<el-form-item label="有效期起期">
					<el-date-picker
						v-model="formData.startDate"
						type="date"
						placeholder="有效期起期"
						format="YYYY-MM-DD"
						value-format="YYYY-MM-DD"
					/>
				</el-form-item>
				<el-form-item label="有效期类型">
					<el-select v-model="formData.validityType" placeholder="有效期类型" @change="onChangeValidityType">
						<el-option
							v-for="item in validityTypeOptions"
							:key="item.value"
							:label="item.text"
							:value="item.value"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="有效期止期">
					<el-date-picker
						v-model="formData.endDate"
						type="date"
						placeholder="有效期止期"
						format="YYYY-MM-DD"
						value-format="YYYY-MM-DD"
					/>
				</el-form-item>
				<el-form-item class="form-actions">
					<el-button type="primary" @click="onSubmit">生成</el-button>
					<el-button type="primary" @click="onInit">初始化</el-button>
				</el-form-item>
			</el-form>
		</div>
		<div class="content-wrap">
			<div class="content-toolbar">
				<ImageLayoutToggle v-model="verticalLayout" />
			</div>
			<div class="content" :class="{ 'content--vertical': verticalLayout }">
				<section class="image-card">
					<div class="image-card__head">
						<span class="image-card__mark"></span>
						<h3 class="image-card__title">国徽面</h3>
					</div>
					<canvas class="image-card__canvas" id="fontCanvas"></canvas>
				</section>
				<section class="image-card">
					<div class="image-card__head">
						<span class="image-card__mark image-card__mark--alt"></span>
						<h3 class="image-card__title">人像面</h3>
					</div>
					<canvas class="image-card__canvas" id="backCanvas"></canvas>
				</section>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import IdcardConstant from '../../constant/idcard'
import { getBirthdayArrayFromIdCard, getSexFromIdCard } from '../../utils/IdCardUtils'
import * as AssetsUtils from '../../utils/AssetsUtils'
import type { IdCardImageInput } from 'idCard'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import ImageLayoutToggle from '@/components/ImageLayoutToggle.vue'

const props = defineProps({
	name: {
		type: String
	},
	idCard: {
		type: String
	},
	sexText: {
		type: String
	},
	address: {
		type: String
	}
})

const getNowDate = (): string => {
	const now = new Date()
	const year = now.getFullYear()
	const month = now.getMonth() + 1
	const date = now.getDate()
	let monthStr = month.toString()
	if (month < 10) {
		monthStr = '0' + month
	}
	let dateStr = date.toString()
	if (date < 10) {
		dateStr = '0' + date
	}
	return `${year}-${monthStr}-${dateStr}`
}

const addDate = (startDate: string, num: number): string => {
	const sDate = new Date(startDate)
	const year = sDate.getFullYear()
	const month = sDate.getMonth() + 1
	const date = sDate.getDate()
	const newYear = year + num
	let monthStr = month.toString()
	if (month < 10) {
		monthStr = '0' + month
	}
	let dateStr = date.toString()
	if (date < 10) {
		dateStr = '0' + date
	}
	return `${newYear}-${monthStr}-${dateStr}`
}

const initFormData = {
	name: props.name || '',
	nation: '汉',
	idCard: props.idCard || '',
	sexText: props.sexText || '',
	address: props.address || '',
	office: '北京市公安局',
	validityType: '1',
	startDate: getNowDate(),
	endDate: addDate(getNowDate(), 5)
}

const formData = reactive<IdCardImageInput>({
	name: initFormData.name,
	nation: initFormData.nation,
	idCard: initFormData.idCard,
	sexText: initFormData.sexText,
	address: initFormData.address,
	office: initFormData.office,
	validityType: initFormData.validityType,
	startDate: initFormData.startDate,
	endDate: initFormData.endDate
})

/** 两张照片的排列方式：水平（左右）/ 垂直（上下） */
const LAYOUT_STORAGE_KEY = 'idcard-generator:idcard-image-layout'
const verticalLayout = ref(localStorage.getItem(LAYOUT_STORAGE_KEY) === 'vertical')
watch(verticalLayout, (value) => {
	localStorage.setItem(LAYOUT_STORAGE_KEY, value ? 'vertical' : 'horizontal')
})

const validityTypeOptions = IdcardConstant.validityTypeData
const imageData = reactive({
	fontImage: AssetsUtils.IMAGE_IDCARD_FONT,
	backImage: AssetsUtils.IMAGE_IDCARD_BACK,
	userImage: AssetsUtils.IMAGE_USER_DEFAULT,
	userMaleImage: AssetsUtils.IMAGE_USER_MALE,
	userFemaleImage: AssetsUtils.IMAGE_USER_FEMALE
})

/* eslint-disable */
const reg = /\-/g
const dateStr = computed(() => {
	if (formData.validityType === '3') {
		return formData.startDate.replace(reg, '.') + '-' + '长期'
	}
	return formData.startDate.replace(reg, '.') + '-' + formData.endDate.replace(reg, '.')
})

const onChangeIdCard = (value: string): void => {
	if (value != null && value.length === 18) {
		const sex = getSexFromIdCard(value)
		formData.sexText = IdcardConstant.getSexByValue(sex)?.text as string
	}
}

const onChangeValidityType = (value: string): void => {
	switch (value) {
		case '1':
			formData.endDate = addDate(formData.startDate, 5)
			break
		case '2':
			formData.endDate = addDate(formData.startDate, 10)
			break
		default:
			formData.endDate = ''
			break
	}
}

const onSubmit = (): void => {
	nextTick(() => {
		const fontCanvasElement = document.getElementById('fontCanvas') as HTMLCanvasElement
		fontCanvasElement.width = 600
		fontCanvasElement.height = 378
		const fontContext: CanvasRenderingContext2D = fontCanvasElement.getContext('2d') || new CanvasRenderingContext2D()
		const fontImage = new Image(1200)
		fontImage.onload = () => {
			fontContext.drawImage(fontImage, 0, 0, fontCanvasElement.width, fontCanvasElement.height)
			fontContext.font = 'normal normal 300 22px 黑体'
			fontContext.fillStyle = '#000'
			fontContext.fillText(formData.office, 260, 287)
			fontContext.fillText(dateStr.value, 260, 330)
		}
		fontImage.src = imageData.fontImage || ''

		const backCanvasElement = document.getElementById('backCanvas') as HTMLCanvasElement
		backCanvasElement.width = 600
		backCanvasElement.height = 378
		backCanvasElement.style.letterSpacing = '2px'
		const backContext: CanvasRenderingContext2D = backCanvasElement.getContext('2d') || new CanvasRenderingContext2D()
		const backImage = new Image(1200)
		const photoImage = new Image(30)
		backImage.onload = () => {
			backContext.drawImage(backImage, 0, 0, backCanvasElement.width, backCanvasElement.height)
			backContext.font = 'normal normal 300 22px 黑体'
			backContext.fillStyle = '#000'
			backContext.fillText(formData.name, 115, 85)
			backContext.fillText(formData.sexText, 115, 128)
			backContext.fillText(formData.nation, 245, 128)
			const arr = getBirthdayArrayFromIdCard(formData.idCard)
			backContext.fillText(arr[0], 115, 172)
			backContext.fillText(arr[1], 210, 172)
			backContext.fillText(arr[2], 270, 172)
			const address = formData.address
			// 地址换行
			const textWith = 240
			let lineW = 0
			let initH = 216
			let substrIndex = 0
			for (let i = 0; i < address.length; i++) {
				lineW += backContext.measureText(address[i]).width
				if (lineW > textWith) {
					backContext.fillText(address.substring(substrIndex, i), 115, initH)
					initH += 28
					lineW = 0
					substrIndex = i
				}
				if (i === address.length - 1) {
					backContext.fillText(address.substring(substrIndex, i + 1), 115, initH)
				}
			}
			// backContext.fillText(formData.address, 110, 216)
			const array = formData.idCard.split('')
			let idCardText = ''
			for (let index = 0; index < array.length; index++) {
				const element = array[index]
				idCardText += element + ''
			}
			backContext.fillText(idCardText, 180, 330)

			backContext.drawImage(photoImage, 385, 60, 180, 200)
		}
		if (formData.sexText === '男') {
			photoImage.src = imageData.userMaleImage || ''
		} else if (formData.sexText === '女') {
			photoImage.src = imageData.userFemaleImage || ''
		} else {
			photoImage.src = imageData.userImage || ''
		}
		backImage.src = imageData.backImage || ''
	})
}

const onInit = (): void => {
	formData.name = initFormData.name
	formData.nation = initFormData.nation
	formData.idCard = initFormData.idCard
	formData.address = initFormData.address
	formData.office = initFormData.office
	formData.validityType = initFormData.validityType
	formData.startDate = initFormData.startDate
	formData.endDate = initFormData.endDate
}

onMounted(() => {
	onChangeIdCard(props.idCard as string)
	nextTick(() => {
		onSubmit()
	})
})
</script>

<style lang="less" scoped>
/* 整页横向铺满，左右两栏都撑满窗口高度 */
.viewer {
	display: flex;
	flex: 1;
	height: 100%;
	min-height: 0;
}

.left-form {
	flex: none;
	box-sizing: border-box;
	width: 320px;
	padding: 20px;
	overflow-y: auto;
	box-shadow: var(--el-box-shadow-light);

	// 表单项撑满左栏宽度，控件随之自适应，左右留白一致
	:deep(.el-form--inline .el-form-item) {
		width: 100%;
		margin-right: 0;
	}

	:deep(.el-form-item__content > .el-input),
	:deep(.el-form-item__content > .el-select),
	:deep(.el-form-item__content > .el-cascader),
	:deep(.el-form-item__content > .el-autocomplete),
	:deep(.el-form-item__content > .el-input-number) {
		width: 100%;
	}

	// Element Plus 2.14 给 el-select 加了 margin-right: 8px
	:deep(.el-select) {
		margin-right: 0;
	}
}
.content-wrap {
	position: relative;
	display: flex;
	flex: 1;
	flex-direction: column;
	min-width: 0;
	min-height: 0;
	padding: 20px;
	box-shadow: var(--el-box-shadow-light);
}

/* 排列方式切换按钮：浮在照片区右上角 */
.content-toolbar {
	position: absolute;
	top: 20px;
	right: 20px;
	z-index: 2;
}

.content {
	display: flex;
	flex: 1;
	gap: 20px;
	min-height: 0;
}

/* 垂直排列：上下堆叠 */
.content--vertical {
	flex-direction: column;
}

.image-card {
	display: flex;
	flex: 1 1 0;
	flex-direction: column;
	gap: 12px;
	min-width: 0;
	min-height: 0;
	padding: 16px;
	border: 1px solid var(--el-border-color-lighter);
	border-radius: 10px;
	background: var(--el-fill-color-lighter);
}

.image-card__head {
	display: flex;
	align-items: center;
	gap: 8px;
}

/* 标题前的强调色条 */
.image-card__mark {
	width: 4px;
	height: 16px;
	border-radius: 2px;
	background: var(--el-color-primary);
}

.image-card__mark--alt {
	background: var(--el-color-success);
}

.image-card__title {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
	letter-spacing: 1px;
	color: var(--el-text-color-primary);
}

/* 画布随卡片剩余空间缩放，按比例居中，窗口变化时自动适配 */
.image-card__canvas {
	display: block;
	flex: 1;
	width: 100%;
	height: 100%;
	min-height: 0;
	object-fit: contain;
	border-radius: 6px;
}
</style>
