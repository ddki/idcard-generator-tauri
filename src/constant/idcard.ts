import cities from '@/assets/json/city.json'
import { EnumData } from 'baseModel'

// 加权因子
const WEIGHTEDFACTOR: Array<number> = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
// 校验码
const CHECKSUM: Array<string> = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

const sexData: Array<EnumData> = [
  { text: '男', value: '1' },
  { text: '女', value: '0' }
]

const relationData: Array<EnumData> = [
  { text: '本人', value: '0' },
  { text: '伴侣', value: '1' },
  { text: '儿子', value: '2' },
  { text: '女儿', value: '3' },
  { text: '父亲', value: '4' },
  { text: '母亲', value: '5' },
  { text: '爷爷', value: '6' },
  { text: '奶奶', value: '7' },
  { text: '孙子', value: '8' },
  { text: '孙女', value: '9' }
]

const validityTypeData: Array<EnumData> = [
  { text: '五年期', value: '1' },
  { text: '十年期', value: '2' },
  { text: '长期有效', value: '3' },
  { text: '自定义', value: '4' }
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
  const sex = sexData.filter((item) => item.value === value)
  return sex != null && sex.length > 0 ? sex[0] : null
}

function constainSex(value: string): boolean {
  const sex = sexData.filter((item) => item.value === value)
  return sex != null && sex.length > 0
}

export default {
  cities,
  sexData,
  relationData,
  validityTypeData,
  WEIGHTEDFACTOR,
  CHECKSUM,
  getRelationByValue,
  getSexByValue,
  constainRelation,
  constainSex
}
