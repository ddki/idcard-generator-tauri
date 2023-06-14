<template>
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

<script lang="ts">
import IdcardConstant from '../../constant/idcard'
import { getBirthdayArrayFromIdCard, getSexFromIdCard } from '../../utils/IdCardUtils'
import { require } from '../../utils/require'
import type { IdCardImageInput } from 'idCard'
import { computed, defineComponent, nextTick, onMounted, reactive } from 'vue'

function getNowDate(): string {
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

function addDate(startDate: string, num: number): string {
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
export default defineComponent({
	props: {
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
	},
	setup(props) {
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

		const validityTypeOptions = IdcardConstant.validityTypeData
		const imageData = reactive({
			fontImage: require('@/assets/image/color/font.png'),
			backImage: require('@/assets/image/color/back.png'),
			userImage: require('@/assets/image/user.png'),
			userMaleImage: require('@/assets/image/user-male.png'),
			userFemaleImage: require('@/assets/image/user-female.png')
		})

		const dateStr = computed(() => {
			if (formData.validityType === '3') {
				return formData.startDate.replaceAll('-', '.') + '-' + '长期'
			}
			return formData.startDate.replaceAll('-', '.') + '-' + formData.endDate.replaceAll('-', '.')
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
				const fontContext: CanvasRenderingContext2D =
					fontCanvasElement.getContext('2d') || new CanvasRenderingContext2D()
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
				const backContext: CanvasRenderingContext2D =
					backCanvasElement.getContext('2d') || new CanvasRenderingContext2D()
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

		return {
			validityTypeOptions,
			formData,
			imageData,
			onChangeIdCard,
			onChangeValidityType,
			onSubmit,
			onInit
		}
	}
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
