<template>
	<el-drawer
		v-model="visible"
		direction="rtl"
		size="min(1280px, 94%)"
		:with-header="false"
		class="history-drawer"
		body-class="history-body"
	>
		<div class="history">
			<header class="history__head">
				<div class="history__title">
					<h3>历史记录</h3>
					<span class="history__count">共 {{ records.length }} 条</span>
				</div>
				<el-button type="danger" plain size="small" :disabled="!records.length" @click="onClear">
					清除记录
				</el-button>
			</header>

			<div class="history__filters">
				<el-radio-group v-model="typeFilter" size="small">
					<el-radio-button value="all">全部</el-radio-button>
					<el-radio-button value="idcard">身份证</el-radio-button>
					<el-radio-button value="fprcard">永居证</el-radio-button>
				</el-radio-group>
				<el-input
					v-model="keyword"
					size="small"
					clearable
					placeholder="搜索姓名 / 证件号 / 地址"
					class="history__search"
				/>
			</div>

			<div v-loading="loading" class="history__list">
				<el-empty
					v-if="!loading && !filtered.length"
					:description="records.length ? '没有符合筛选条件的记录' : '还没有生成记录'"
				/>

				<article v-for="record in filtered" :key="record.id" class="history-item">
					<div class="history-item__head">
						<el-tag :type="record.type === 'idcard' ? 'primary' : 'success'" size="small" effect="light">
							{{ typeLabel(record.type) }}
						</el-tag>
						<span class="history-item__time">{{ formatTime(record.createdAt) }}</span>
						<el-button class="history-item__remove" link type="danger" size="small" @click="onRemove(record.id)">
							删除
						</el-button>
					</div>

					<p class="history-item__summary">{{ record.summary }}</p>
					<p class="history-item__count">本次生成 {{ record.count }} 条</p>

					<el-collapse v-if="record.items?.length" v-model="activeNames" class="history-item__detail">
						<el-collapse-item :title="`查看详情（${record.items.length}）`" :name="record.id">
							<el-table
								v-if="record.type === 'idcard'"
								:data="record.items"
								size="small"
								border
								stripe
								class="history-table"
							>
								<el-table-column align="center" prop="relation" label="关系" width="60" />
								<el-table-column align="center" prop="name" label="名字" width="84">
									<template #default="{ row }">
										<span class="copyable" @click="handleCopy(row.name)">{{ row.name }}</span>
									</template>
								</el-table-column>
								<el-table-column align="center" prop="idCard" label="身份证号码" width="170">
									<template #default="{ row }">
										<span class="copyable" @click="handleCopy(row.idCard)">{{ row.idCard }}</span>
									</template>
								</el-table-column>
								<el-table-column align="center" prop="mobile" label="手机号" width="112">
									<template #default="{ row }">
										<span class="copyable" @click="handleCopy(row.mobile)">{{ row.mobile }}</span>
									</template>
								</el-table-column>
								<el-table-column align="center" prop="sex" label="性别" width="60" />
								<el-table-column align="center" prop="birthday" label="出生日期" width="104">
									<template #default="{ row }">
										<span class="copyable" @click="handleCopy(row.birthday)">{{ row.birthday }}</span>
									</template>
								</el-table-column>
								<el-table-column align="center" prop="age" label="年龄" width="60" />
								<el-table-column align="center" prop="address" label="地址" min-width="150">
									<template #default="{ row }">
										<span class="copyable" @click="handleCopy(row.address)">{{ row.address }}</span>
									</template>
								</el-table-column>
								<el-table-column align="center" label="操作" width="92">
									<template #default="{ row }">
										<el-button type="primary" link size="small" @click="handleGenerateImage(record, row)">
											生成照片
										</el-button>
									</template>
								</el-table-column>
							</el-table>

							<el-table v-else :data="record.items" size="small" border stripe class="history-table">
								<el-table-column align="center" label="名字" width="84">
									<template #default="{ row }">
										<span class="copyable" @click="handleCopy(`${row.firstName}${row.lastName}`)">
											{{ row.firstName }}{{ row.lastName }}
										</span>
									</template>
								</el-table-column>
								<el-table-column align="center" label="国家/地区" width="140">
									<template #default="{ row }">
										<span class="copyable" @click="handleCopy(formatCountry(row.country))">
											{{ formatCountry(row.country) }}
										</span>
									</template>
								</el-table-column>
								<el-table-column align="center" prop="cardNumber" label="证件号码" width="170">
									<template #default="{ row }">
										<span class="copyable" @click="handleCopy(row.cardNumber)">{{ row.cardNumber }}</span>
									</template>
								</el-table-column>
								<el-table-column align="center" prop="mobile" label="手机号" width="112">
									<template #default="{ row }">
										<span class="copyable" @click="handleCopy(row.mobile)">{{ row.mobile }}</span>
									</template>
								</el-table-column>
								<el-table-column align="center" prop="sex" label="性别" width="60" />
								<el-table-column align="center" prop="birthday" label="出生日期" width="104">
									<template #default="{ row }">
										<span class="copyable" @click="handleCopy(row.birthday)">{{ row.birthday }}</span>
									</template>
								</el-table-column>
								<el-table-column align="center" prop="age" label="年龄" width="60" />
								<el-table-column align="center" label="操作" width="92">
									<template #default="{ row }">
										<el-button type="primary" link size="small" @click="handleGenerateImage(record, row)">
											生成照片
										</el-button>
									</template>
								</el-table-column>
							</el-table>
						</el-collapse-item>
					</el-collapse>
				</article>
			</div>
		</div>
	</el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import useClipboard from 'vue-clipboard3'
import { clearHistory, loadHistory, saveHistory, type HistoryRecord, type HistoryType } from '@/utils/HistoryUtils'

const visible = defineModel<boolean>({ default: false })
const emit = defineEmits<{ (event: 'changed', records: HistoryRecord[]): void }>()

const router = useRouter()
const clipboard = useClipboard()

const loading = ref(false)
const records = ref<HistoryRecord[]>([])
const keyword = ref('')
const typeFilter = ref<'all' | HistoryType>('all')
/** 展开的记录 id，默认展开最新一条，便于直接看到完整表格 */
const activeNames = ref<string[]>([])

const filtered = computed(() => {
	const kw = keyword.value.trim().toLowerCase()
	return records.value.filter((record) => {
		if (typeFilter.value !== 'all' && record.type !== typeFilter.value) {
			return false
		}
		if (!kw) {
			return true
		}
		// 摘要 + 明细一起参与匹配，身份证号、姓名、地址都能搜到
		return (
			record.summary.toLowerCase().includes(kw) ||
			JSON.stringify(record.items).toLowerCase().includes(kw)
		)
	})
})

watch(visible, async (opened) => {
	if (opened) {
		await reload()
	}
})

async function reload() {
	loading.value = true
	try {
		records.value = await loadHistory()
		activeNames.value = records.value.length ? [records.value[0].id] : []
		emit('changed', records.value)
	} finally {
		loading.value = false
	}
}

async function onRemove(id: string) {
	records.value = records.value.filter((record) => record.id !== id)
	await saveHistory(records.value)
	emit('changed', records.value)
	ElMessage.success('已删除该条记录')
}

async function onClear() {
	try {
		await ElMessageBox.confirm('确定要清除全部历史记录吗？此操作不可恢复。', '清除记录', {
			confirmButtonText: '清除',
			cancelButtonText: '取消',
			type: 'warning'
		})
	} catch {
		return
	}

	await clearHistory()
	records.value = []
	emit('changed', records.value)
	ElMessage.success('历史记录已清除')
}

async function handleCopy(value: unknown) {
	const text = value === undefined || value === null ? '' : String(value)
	if (!text.trim()) {
		return
	}
	await clipboard.toClipboard(text)
	ElMessage('已复制')
}

const toQuery = (value: unknown): string => (value === undefined || value === null ? '' : String(value))

/** 永居证的国家/地区在历史里存的是对象 { name, ISO_3166_1_threeString } */
function formatCountry(value: unknown): string {
	if (value === undefined || value === null) {
		return ''
	}
	if (typeof value === 'string') {
		return value
	}
	const country = value as { name?: string; ISO_3166_1_threeString?: string }
	const name = toQuery(country.name)
	const iso = toQuery(country.ISO_3166_1_threeString)
	return name && iso ? `${name}/${iso}` : name || iso
}

/** 与生成结果表格的“生成照片”一致，跳转到对应的图片预览页 */
function handleGenerateImage(record: HistoryRecord, row: Record<string, unknown>) {
	visible.value = false

	if (record.type === 'idcard') {
		router.push({
			name: 'IdCardImage',
			query: {
				name: toQuery(row.name),
				idCard: toQuery(row.idCard),
				sexText: toQuery(row.sex),
				address: toQuery(row.address)
			}
		})
		return
	}

	router.push({
		name: 'FprCardImage',
		query: {
			firstName: toQuery(row.firstName),
			lastName: toQuery(row.lastName),
			cardNumber: toQuery(row.cardNumber),
			sexText: toQuery(row.sex),
			birthday: toQuery(row.birthday),
			countryText: formatCountry(row.country)
		}
	})
}

function typeLabel(type: HistoryType): string {
	return type === 'idcard' ? '身份证' : '永居证'
}

function formatTime(timestamp: number): string {
	const date = new Date(timestamp)
	const pad = (value: number) => String(value).padStart(2, '0')
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
</script>

<style lang="less" scoped>
/* 抽屉内容区撑满高度，表格才能完整展开 */
:global(.history-body) {
	display: flex;
	flex-direction: column;
	padding: 16px 20px;
	overflow: hidden;
}

.history {
	display: flex;
	flex: 1;
	flex-direction: column;
	min-height: 0;
	gap: 16px;
}

.history__head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 12px;
	border-bottom: 1px solid var(--el-border-color-lighter);
}

.history__title {
	display: flex;
	align-items: baseline;
	gap: 10px;

	h3 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		color: var(--el-text-color-primary);
	}
}

.history__count {
	font-size: 12px;
	color: var(--el-text-color-secondary);
}

.history__filters {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.history__search {
	width: 100%;
}

.history__list {
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 12px;
	min-height: 0;
	overflow-y: auto;
	padding-right: 4px;
}

.history-item {
	padding: 14px 16px;
	border: 1px solid var(--el-border-color-lighter);
	border-radius: 10px;
	background: var(--el-fill-color-lighter);
}

.history-item__head {
	display: flex;
	align-items: center;
	gap: 8px;
}

.history-item__time {
	font-size: 12px;
	color: var(--el-text-color-secondary);
}

.history-item__remove {
	margin-left: auto;
}

.history-item__summary {
	margin: 10px 0 4px;
	font-size: 13px;
	line-height: 1.5;
	color: var(--el-text-color-primary);
	word-break: break-all;
}

.history-item__count {
	margin: 0;
	font-size: 12px;
	color: var(--el-text-color-secondary);
}

.history-item__detail {
	margin-top: 8px;

	:deep(.el-collapse-item__content) {
		padding-bottom: 4px;
	}
}

.history-table {
	width: 100%;
}

/* 与生成结果页一致：点击字段即复制 */
.copyable {
	cursor: pointer;
	word-break: break-all;

	&:hover {
		color: var(--el-color-primary);
		text-decoration: underline;
	}
}
</style>
