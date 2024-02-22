<template>
	<div class="left-form" ref="form">
		<el-form :inline="true" size="default" label-width="90px" label-position="left" label-suffix=":">
			<el-form-item label="姓">
				<el-input v-model="formData.firstName" placeholder="姓" />
			</el-form-item>
			<el-form-item label="名">
				<el-input v-model="formData.lastName" placeholder="名" />
			</el-form-item>
			<el-form-item label="国家/地区">
				<el-autocomplete
					v-model="country"
					:fetch-suggestions="queryCountrySearch"
					clearable
					placeholder="国家/地区"
					@select="handleCountrySelect"
				>
					<template #default="{ item }">
						<span>{{ item.name }}/{{ item.ISO_3166_1_threeString }}/{{ item.ISO_3166_1_threeNumber }}</span>
					</template>
				</el-autocomplete>
			</el-form-item>
			<el-form-item label="证件号">
				<el-input v-model="formData.cardNumber" placeholder="证件号" />
			</el-form-item>
			<el-form-item label="性别">
				<el-input v-model="formData.sexText" placeholder="性别" />
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
			<el-form-item>
				<el-button type="primary" @click="onSubmit">生成</el-button>
				<el-button type="primary" @click="onInit">初始化</el-button>
			</el-form-item>
		</el-form>
	</div>
	<div class="content">
		<div class="image">
			<p class="image__title">国徽面</p>
			<canvas class="image__canvas" id="fontCanvas"></canvas>
		</div>
		<div class="image">
			<p class="image__title">人像面</p>
			<canvas class="image__canvas" id="backCanvas"></canvas>
		</div>
	</div>
</template>

<script setup lang="ts">
import IdcardConstant from '../../constant/idcard'
import { getBirthdayFromIdCard, getSexWithCodeFromIdCard } from '../../utils/IdCardUtils'
import * as AssetsUtils from '../../utils/AssetsUtils'
import type { FprCardImageInput } from 'fprCard'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import type { Country } from 'baseModel'
import { JSON_COUNTRY } from '../../utils/AssetsUtils'
import { pinyin } from 'pinyin-pro'

const props = defineProps({
	firstName: {
		type: String
	},
	lastName: {
		type: String
	},
	cardNumber: {
		type: String
	},
	sexText: {
		type: String
	},
	countryText: {
		type: String
	},
	birthday: {
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
	firstName: props.firstName || '',
	lastName: props.lastName || '',
	cardNumber: props.cardNumber || '',
	countryText: props.countryText || '',
	sexText: props.sexText || '',
	birthday: props.birthday || '',
	validityType: '1',
	startDate: getNowDate(),
	endDate: addDate(getNowDate(), 5)
}

const formData = reactive<FprCardImageInput>({
	firstName: initFormData.firstName,
	lastName: initFormData.lastName,
	cardNumber: initFormData.cardNumber,
	countryText: initFormData.countryText,
	sexText: initFormData.sexText,
	birthday: initFormData.birthday,
	validityType: initFormData.validityType,
	startDate: initFormData.startDate,
	endDate: initFormData.endDate
})

console.log('formData = ', formData)

const country = ref(props.countryText)
const countries = ref<Country[]>(JSON_COUNTRY)

const queryCountrySearch = (queryString: string, cb: any) => {
	const results = queryString ? countries.value.filter(createCountryFilter(queryString)) : countries.value
	console.log('results = ', results)
	cb(results)
}
const createCountryFilter = (queryString: string) => {
	return (country: Country) => {
		return (
			country.name.indexOf(queryString) === 0 ||
			country.ISO_3166_1_threeNumber.toString() === queryString ||
			country.ISO_3166_1_twoString.toLowerCase().indexOf(queryString.toLowerCase()) === 0 ||
			country.ISO_3166_1_threeString.toLowerCase().indexOf(queryString.toLowerCase()) === 0 ||
			country.GEC.toLowerCase().indexOf(queryString.toLowerCase()) === 0 ||
			country.STANAG_1059.toLowerCase().indexOf(queryString.toLowerCase()) === 0 ||
			country.www.toLowerCase().indexOf(queryString.toLowerCase()) === 0
		)
	}
}

const handleCountrySelect = (item: Country) => {
	formData.country = item
	country.value = [item.name, item.ISO_3166_1_threeString].join('/')
}

const validityTypeOptions = IdcardConstant.validityTypeData
const imageData = reactive({
	fontImage: AssetsUtils.FPR_IMAGE_FONT,
	backImage: AssetsUtils.FPR_IMAGE_BACK,
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
	if (formData.birthday == null || formData.birthday == undefined || formData.length < 8 || formData.cardNumber) {
		formData.birthday = getBirthdayFromIdCard(formData.cardNumber)
	}
	if (formData.sexText == null || formData.sexText == undefined || formData.cardNumber) {
		formData.sexText = getSexWithCodeFromIdCard(formData.cardNumber)
	}
	if (formData.countryText == null || formData.countryText == undefined || formData.countryText.length < 1 || country) {
		formData.countryText = country
	}
	console.log('data: ', formData)
	nextTick(() => {
		const fontCanvasElement = document.getElementById('fontCanvas') as HTMLCanvasElement
		fontCanvasElement.width = 600
		fontCanvasElement.height = 394
		const fontContext: CanvasRenderingContext2D = fontCanvasElement.getContext('2d') || new CanvasRenderingContext2D()
		const fontImage = new Image(1200)
		fontImage.onload = () => {
			fontContext.drawImage(fontImage, 0, 0, fontCanvasElement.width, fontCanvasElement.height)
		}
		fontImage.src = imageData.fontImage || ''

		const backCanvasElement = document.getElementById('backCanvas') as HTMLCanvasElement
		backCanvasElement.width = 600
		backCanvasElement.height = 394
		backCanvasElement.style.letterSpacing = '2px'
		const backContext: CanvasRenderingContext2D = backCanvasElement.getContext('2d') || new CanvasRenderingContext2D()
		const backImage = new Image(1200)
		const photoImage = new Image(30)
		backImage.onload = () => {
			backContext.drawImage(backImage, 0, 0, backCanvasElement.width, backCanvasElement.height)
			backContext.font = 'normal normal 300 22px 黑体'
			backContext.fillStyle = '#000'
			const cnName = [formData.firstName, formData.lastName].join('')
			const pinyinName = pinyin([formData.firstName, formData.lastName].join(','), {
				toneType: 'none'
			}).toUpperCase()
			backContext.fillText(pinyinName, 85, 130)
			backContext.fillText(cnName, 85, 160)
			backContext.fillText(formData.sexText, 85, 215)
			backContext.fillText(formData.countryText, 85, 265)
			backContext.fillText(formData.birthday, 200, 215)
			// 有效期
			backContext.fillText(dateStr.value, 85, 310)

			const array = formData.cardNumber.split('')
			let cardNumberText = ''
			for (let index = 0; index < array.length; index++) {
				const element = array[index]
				cardNumberText += element + ''
			}
			backContext.fillText(cardNumberText, 175, 340)

			backContext.drawImage(photoImage, 355, 90, 180, 200)
		}
		if (formData.sexText.indexOf('男') != -1) {
			photoImage.src = imageData.userMaleImage || ''
		} else if (formData.sexText.indexOf('女') != -1) {
			photoImage.src = imageData.userFemaleImage || ''
		} else {
			photoImage.src = imageData.userImage || ''
		}
		backImage.src = imageData.backImage || ''
	})
}

const onInit = (): void => {
	formData.firstName = initFormData.firstName
	formData.lastName = initFormData.lastName
	formData.cardNumber = initFormData.cardNumber
	formData.countryText = initFormData.countryText
	formData.validityType = initFormData.validityType
	formData.startDate = initFormData.startDate
	formData.endDate = initFormData.endDate
}

onMounted(() => {
	nextTick(() => {
		onSubmit()
	})
})
</script>

<style lang="less" scoped>
.left-form {
	float: left;
	width: 320px;
	height: 100%;
	padding: 20px;
	box-shadow: var(--el-box-shadow-light);
}

.content {
	margin-left: 380px;
	padding: 20px;
	box-shadow: var(--el-box-shadow-light);

	&__image {
		&__title {
			text-align: lfet;
		}
	}
}

.el-button {
	width: 95px;
	margin-bottom: 10px;
}
</style>
