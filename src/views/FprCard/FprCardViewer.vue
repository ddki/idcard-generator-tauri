<template>
	<div class="viewer">
		<div class="left-form" ref="form">
			<el-form :inline="true" size="default" label-width="100px" label-position="left" label-suffix="：">
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
				<el-form-item label="年龄">
					<el-input-number v-model="formData.age" @change="onChangeAge" :min="1" :max="100" placeholder="年龄" />
				</el-form-item>
				<el-form-item label="出生日期">
					<el-date-picker
						v-model="formData.birthday"
						@change="onChangeBirthday"
						type="date"
						placeholder="出生日期"
						format="YYYY-MM-DD"
						value-format="YYYY-MM-DD"
					/>
				</el-form-item>
				<el-form-item label="性别">
					<el-radio v-model="formData.sex" label="1">男</el-radio>
					<el-radio v-model="formData.sex" label="0">女</el-radio>
				</el-form-item>
				<el-form-item label="受理地代码">
					<el-input v-model="formData.acceptAreaCode" placeholder="受理地代码" />
					<el-cascader
						ref="acceptAreaCodeRef"
						v-model="formData.acceptAreaCode"
						:options="areaOptions"
						:props="areaPropsOption"
						:show-all-levels="true"
						@change="onChangeacceptAreaCode"
						placeholder="受理地代码"
						clearable
						filterable
					/>
				</el-form-item>
				<el-form-item label="生成个数">
					<el-input-number v-model="formData.number" :min="1" :max="100" placeholder="生成个数" />
				</el-form-item>
				<el-form-item class="form-actions">
					<el-button type="primary" @click="onSubmit">生成</el-button>
				</el-form-item>
			</el-form>

			<div class="form-divider"></div>
			<el-button class="history-entry" @click="historyVisible = true">
				<span class="history-entry__label">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M3 12a9 9 0 1 0 3-6.7" />
						<polyline points="3 4 3 10 9 10" />
						<path d="M12 8v4l3 2" />
					</svg>
					历史记录
				</span>
				<el-tag v-if="historyCount" size="small" type="info" round>{{ historyCount }}</el-tag>
			</el-button>
		</div>
		<div class="content">
			<el-table :data="tableData" stripe style="width: 100%">
				<el-table-column align="center" label="名字" width="80">
					<template #default="scope">
						<span @click="handleClickCopy(scope.row.firstName + scope.row.lastName)"
							>{{ scope.row.firstName }}{{ scope.row.lastName }}</span
						>
					</template>
				</el-table-column>
				<el-table-column align="center" prop="country" label="国家/地区" width="180">
					<template #default="scope">
						<span>{{ scope.row.country?.name }}/{{ scope.row.country?.ISO_3166_1_threeString }}</span>
					</template>
				</el-table-column>
				<el-table-column align="center" prop="cardNumber" label="证件号码" width="180">
					<template #default="scope">
						<span @click="handleClickCopy(scope.row.cardNumber)">{{ scope.row.cardNumber }}</span>
					</template>
				</el-table-column>
				<el-table-column align="center" prop="mobile" label="手机号" width="120">
					<template #default="scope">
						<span @click="handleClickCopy(scope.row.mobile)">{{ scope.row.mobile }}</span>
					</template>
				</el-table-column>
				<el-table-column align="center" prop="sex" label="性别" width="60" />
				<el-table-column align="center" prop="birthday" label="出生日期" width="120">
					<template #default="scope">
						<span @click="handleClickCopy(scope.row.birthday)">{{ scope.row.birthday }}</span>
					</template>
				</el-table-column>
				<el-table-column align="center" prop="age" label="年龄" width="60" />
				<el-table-column align="center" fixed="right" label="操作">
					<template #default="scope">
						<el-button
							type="primary"
							link
							size="small"
							@click="
								handleGenerateImage(
									scope.row.firstName,
									scope.row.lastName,
									scope.row.cardNumber,
									scope.row.sex,
									scope.row.birthday,
									scope.row.country
								)
							"
							>生成照片</el-button
						>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<HistoryDrawer v-model="historyVisible" @changed="onHistoryChanged" />
	</div>
</template>

<script setup lang="ts">
import IdcardConstant from '../../constant/idcard'
import type { FprCardInfo, FprCardInput } from 'fprCard'
import { generateFprCardInfo, getAge, getBirthday } from '../../utils/IdCardUtils'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import useClipboard from 'vue-clipboard3'
import { ElMessage } from 'element-plus'
import { JSON_CITY, JSON_COUNTRY } from '@/utils/AssetsUtils'
import type { Country } from 'baseModel'
import HistoryDrawer from '@/components/HistoryDrawer.vue'
import { appendHistory, createHistoryId, loadHistory, type HistoryRecord } from '@/utils/HistoryUtils'
import { loadSettings } from '@/utils/SettingUtils'

// 供 keep-alive 识别，切换 tab 时保留已生成的数据
defineOptions({ name: 'FprCardViewer' })

const router = useRouter()
const clipboard = useClipboard()

const country = ref('')

const formData = reactive<FprCardInput>({
	age: 30,
	sex: '1',
	acceptAreaCode: '110101',
	birthday: getBirthday(30),
	number: 5,
	country: null
})

const countries = ref<Country[]>(JSON_COUNTRY)

const queryCountrySearch = (queryString: string, cb: (data: Country[]) => void) => {
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
	country.value = [item.name, item.ISO_3166_1_threeString, item.ISO_3166_1_threeNumber].join('/')
}

const areaOptions = JSON_CITY.filter((item) => {
	return item.type === 1
})
const areaPropsOption = {
	value: 'code',
	label: 'name',
	children: 'child'
}
const tableData = reactive<FprCardInfo[]>([])
const historyVisible = ref(false)
const historyCount = ref(0)

const onChangeAge = (value: number): void => {
	formData.birthday = getBirthday(value)
}

const onChangeBirthday = (payload: Event): void => {
	formData.age = getAge(payload as unknown as string)
	formData.birthday = payload as unknown as string
}

const onChangeacceptAreaCode = (value: Array<string>): void => {
	const lastValue = value?.pop()
	formData.acceptAreaCode = lastValue || '110101'
}

const generateFprCardList = (): void => {
	tableData.length = 0

	let count = 0
	while (count < formData.number) {
		tableData.push(generateFprCardInfo(formData))
		count++
	}
}

const onSubmit = (): void => {
	generateFprCardList()
	void recordHistory()
}

const recordHistory = async (): Promise<void> => {
	if (!tableData.length) {
		return
	}

	try {
		const { historyLimit } = await loadSettings()
		const summary = tableData
			.slice(0, 3)
			.map((item) => `${item.firstName}${item.lastName} ${item.cardNumber}`)
			.join('，')
		const record: HistoryRecord = {
			id: createHistoryId(),
			type: 'fprcard',
			createdAt: Date.now(),
			count: tableData.length,
			summary: tableData.length > 3 ? `${summary} 等 ${tableData.length} 人` : summary,
			items: tableData.map((item) => ({
				firstName: item.firstName,
				lastName: item.lastName,
				cardNumber: item.cardNumber,
				sex: item.sex,
				birthday: item.birthday,
				mobile: item.mobile,
				age: item.age,
				country: item.country?.name ?? ''
			}))
		}
		historyCount.value = (await appendHistory(record, historyLimit)).length
	} catch (error) {
		console.error('保存历史记录失败：', error)
	}
}

const onHistoryChanged = (records: HistoryRecord[]): void => {
	historyCount.value = records.length
}

const handleGenerateImage = (
	_firstName: string,
	_lastName: string,
	_cardNumber: string,
	_sexText: string,
	_birthday: string,
	_country: Country
): void => {
	router.push({
		name: 'FprCardImage',
		query: {
			firstName: _firstName,
			lastName: _lastName,
			cardNumber: _cardNumber,
			sexText: _sexText,
			birthday: _birthday,
			countryText: _country.name + '/' + _country.ISO_3166_1_threeString
		}
	})
}

const handleClickCopy = async (value: string): Promise<void> => {
	await clipboard.toClipboard(value)
	ElMessage('已复制')
}

onMounted(async () => {
	// 首屏只渲染默认数据，不写入历史
	generateFprCardList()
	historyCount.value = (await loadHistory()).length
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

/* 与上方表单区的分隔线 */
.form-divider {
	height: 1px;
	margin: 8px 0 16px;
	background: var(--el-border-color-lighter);
}

.history-entry {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	height: 38px;
	margin-left: 0;
	padding: 0 12px;
	border-radius: 8px;
	color: var(--el-text-color-regular);

	&:hover {
		border-color: var(--el-color-primary-light-5);
		background: var(--el-color-primary-light-9);
		color: var(--el-color-primary);
	}
}

.history-entry__label {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
}

.content {
	flex: 1;
	min-width: 0;
	min-height: 0;
	overflow: auto;
	padding: 20px;
	box-shadow: var(--el-box-shadow-light);
}

.el-date-picker {
	width: 300px;
}
</style>
