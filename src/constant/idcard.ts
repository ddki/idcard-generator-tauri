import type { EnumData } from 'baseModel'
import { SEX_DATA } from '.'

// 加权因子
const WEIGHTEDFACTOR: Array<number> = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
// 校验码
const CHECKSUM: Array<string> = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

const relationData: Array<EnumData> = [
	{ text: '本人', value: '0', code: '' },
	{ text: '伴侣', value: '1', code: '' },
	{ text: '儿子', value: '2', code: '' },
	{ text: '女儿', value: '3', code: '' },
	{ text: '父亲', value: '4', code: '' },
	{ text: '母亲', value: '5', code: '' },
	{ text: '爷爷', value: '6', code: '' },
	{ text: '奶奶', value: '7', code: '' },
	{ text: '孙子', value: '8', code: '' },
	{ text: '孙女', value: '9', code: '' }
]

const validityTypeData: Array<EnumData> = [
	{ text: '五年期', value: '1', code: '' },
	{ text: '十年期', value: '2', code: '' },
	{ text: '长期有效', value: '3', code: '' },
	{ text: '自定义', value: '4', code: '' }
]

function getRelationByValue(value: string): EnumData | null {
	const relation = relationData.filter((item) => item.value === value)
	return relation != null && relation.length > 0 ? relation[0] : null
}

function constainRelation(value: string): boolean {
	const relation = relationData.filter((item) => item.value === value)
	return relation != null && relation.length > 0
}

function getSexByValue(value: string): EnumData | null {
	const sex = SEX_DATA.filter((item) => item.value === value)
	return sex != null && sex.length > 0 ? sex[0] : null
}

function constainSex(value: string): boolean {
	const sex = SEX_DATA.filter((item) => item.value === value)
	return sex != null && sex.length > 0
}

export default {
	relationData,
	validityTypeData,
	WEIGHTEDFACTOR,
	CHECKSUM,
	getRelationByValue,
	getSexByValue,
	constainRelation,
	constainSex
}
