<template>
	<div class="left-form" ref="form">
		<el-form :inline="true" size="default" label-width="90px" label-position="left" label-suffix="：">
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
			<el-form-item>
				<el-button type="primary" @click="onSubmit">生成</el-button>
			</el-form-item>
		</el-form>
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

const onSubmit = (): void => {
	tableData.length = 0
	console.log('formData = ', formData)
	let count = 0
	while (count < formData.number) {
		tableData.push(generateFprCardInfo(formData))
		count++
	}
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

onMounted(() => {
	onSubmit()
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
}

.el-button {
	width: 260px;
	margin-bottom: 10px;
}
.el-date-picker {
	width: 300px;
}
</style>
