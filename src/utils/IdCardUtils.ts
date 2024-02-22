import IdcardConstant from '../constant/idcard'
import type { IdCardImageInfo, IdCardImageInput, IdCardInfo, IdCardInput } from 'idCard'
import type { FprCardInfo, FprCardInput } from 'fprCard'
import { JSON_CITY, JSON_COUNTRY } from './AssetsUtils'
import { FIRST_NAMES, LAST_NAMES, STREET_NAMES } from '@/constant'
import type { Country } from 'baseModel'

/**
 * 根据输入信息生成身份证信息
 * @param param 输入
 * @returns 身份证信息
 */
export function generateIdCardInfo(param: IdCardInput): IdCardInfo {
	const result: IdCardInfo = {
		idCard: getIdCard(param.areaCode, param.birthday, param.sex),
		relation: getRelation(param.relation),
		age: param.age,
		name: getName(),
		sex: getSex(param.sex),
		birthday: param.birthday || getBirthday(param.age),
		mobile: getMobile(),
		address: param.address + getAddress(param.areaCode)
	}

	return result
}

/**
 * 根据输入信息生成外国人永久居留证证信息
 * @param param 输入
 * @returns 外国人永久居留证证信息
 */
export function generateFprCardInfo(param: FprCardInput): FprCardInfo {
	console.log('param', param)
	const country = param.country || randomCountry()
	const result: FprCardInfo = {
		cardNumber: getFprCardNumber(param.acceptAreaCode, country.ISO_3166_1_threeNumber, param.birthday, param.sex),
		relation: getRelation(param.relation),
		age: param.age,
		firstName: randomFirstName(),
		lastName: randomLastName(),
		sex: getSex(param.sex),
		birthday: param.birthday || getBirthday(param.age),
		mobile: getMobile(),
		country: country
	}

	return result
}

/**
 * 根据输入信息生成身份证照片
 * @param params 输入
 * @returns 身份证照片
 */
export function generateIdCardImage(params: IdCardImageInput): IdCardImageInfo {
	const result: IdCardImageInfo = {
		fontImage: params.name,
		backImage: params.name
	}

	return result
}

/**
 * 根据值获取关系文本
 * @param relation 关系值
 * @returns 关系文本
 */
function getRelation(relation: string): string {
	if (IdcardConstant.constainRelation(relation)) {
		const relationData = IdcardConstant.getRelationByValue(relation)
		return relationData == null ? '' : relationData.text
	}
	return relation
}

/**
 * 根据值获取性别文本
 * @param sex 性别值
 * @returns 姓名文本
 */
function getSex(sex: string): string {
	if (IdcardConstant.constainSex(sex)) {
		const sexData = IdcardConstant.getSexByValue(sex)
		return sexData == null ? '' : sexData.text
	}
	return ''
}

/**
 * 根据值获取性别文本
 * @param sex 性别值
 * @returns 姓名文本
 */
function getSexWithCode(sex: string): string {
	if (IdcardConstant.constainSex(sex)) {
		const sexData = IdcardConstant.getSexByValue(sex)
		return sexData == null ? '' : sexData.text + '/' + sexData.code
	}
	return ''
}

/**
 *  根据身份证号获取性别
 * @param idCard 身份证号
 * @returns 性别编码
 */
export function getSexFromIdCard(idCard: string): string {
	// 3位顺序码
	const sexNum = idCard.substring(14, 17)
	return (parseInt(sexNum) % 2).toString()
}

/**
 *  根据身份证号获取性别
 * @param idCard 身份证号
 * @returns 性别编码
 */
export function getSexWithCodeFromIdCard(idCard: string): string {
	// 3位顺序码
	const sexNum = idCard.substring(14, 17)
	return getSexWithCode((parseInt(sexNum) % 2).toString())
}

/**
 * 根据身份证号获取年月日
 * @param idCard 身份证号
 * @returns 年月日
 */
export function getBirthdayArrayFromIdCard(idCard: string): Array<string> {
	const birthday = idCard.substring(6, 14)
	const arr: Array<string> = []
	arr.push(birthday.substring(0, 4))
	let month = birthday.substring(4, 6)
	if (month.startsWith('0')) {
		month = month.substring(1)
	}
	arr.push(month)
	let date = birthday.substring(6, 8)
	if (date.startsWith('0')) {
		date = date.substring(1)
	}
	arr.push(date)
	return arr
}

/**
 * 根据身份证号获取年月日
 * @param idCard 身份证号
 * @returns yyyy-mm-dd
 */
export function getBirthdayFromIdCard(idCard: string): string {
	const birthday = idCard.substring(6, 14)
	const arr: Array<string> = []
	arr.push(birthday.substring(0, 4))
	arr.push(birthday.substring(4, 6))
	const date = birthday.substring(6, 8)
	arr.push(birthday.substring(6, 8))
	return arr.join('-')
}

/**
 * 根据年龄获取出生日期 yyyy-MM-dd
 * @param age 年龄
 */
export function getBirthday(age: number): string {
	const now = new Date()
	const year = now.getFullYear()
	let month: string = (now.getMonth() + 1).toString()
	month = month.length < 2 ? '0' + month : month
	let date: string = now.getDate().toString()
	date = date.length < 2 ? '0' + date : date
	const newYear = year - age
	return `${newYear}-${month}-${date}`
}

// 根据出生日期获取年龄
export function getAge(birthday: string): number {
	const now = new Date()
	const year = now.getFullYear()
	const month = now.getMonth() + 1
	const date = now.getDate()

	const array = birthday.split('-')
	let age = year - parseInt(array[0])
	return month - parseInt(array[1]) > 0 || date - parseInt(array[2]) > 0 ? age-- : age
}

/**
 *
 *  1、号码的结构
      公民身份号码是特征组合码，由十七位数字本体码和一位校验码组成。排列顺序从左至右依次为：六位数字地址码，八位数字出生日期码，三位数字顺序码和一位数字校验码。
    2、地址码
      表示编码对象常住户口所在县(市、旗、区)的行政区划代码，按gb/t2260的规定执行。
    3、出生日期码
      表示编码对象出生的年、月、日，按gb/t7408的规定执行，年、月、日代码之间不用分隔符。
    4、顺序码
      表示在同一地址码所标识的区域范围内，对同年、同月、同日出生的人编定的顺序号，顺序码的奇数分配给男性，偶数分配给女性。
    5、校验码
      （1）十七位数字本体码加权求和公式
        s = sum(ai * wi), i = 0, ... , 16 ，先对前17位数字的权求和
        ai:表示第i位置上的身份证号码数字值
        wi:表示第i位置上的加权因子
        wi: 7 9 10 5 8 4 2 1 6 3 7 9 10 5 8 4 2
      （2）计算模
        y = mod(s, 11)
      （3）通过模得到对应的校验码
        y: 0 1 2 3 4 5 6 7 8 9 10
        校验码: 1 0 x 9 8 7 6 5 4 3 2
 * @param areaCode 6位地区码
 * @param birthday 8位出生日期
 * @param sex 性别
 */
function getIdCard(areaCode: string, birthday: string, sex: string) {
	const sequenceCode = getSequenceCode(sex)
	/* eslint-disable */
	const reg = /\-/g
	birthday = birthday.replace(reg, '')
	const prefix = areaCode + birthday + sequenceCode
	const array = prefix.split('')
	let sum = 0
	for (let index = 0; index < array.length; index++) {
		const element = array[index]
		sum += parseInt(element) * IdcardConstant.WEIGHTEDFACTOR[index]
	}
	const mod = sum % 11
	const idCard = prefix + IdcardConstant.CHECKSUM[mod]
	return idCard
}

/**
 * https://www.nia.gov.cn/20231013/2.pdf
 * 身份标识码 受理地代码 国家和地区代码    出生日期码     顺序码   校验码
 *    9        32        682       1985  01   01   001     7
 *           江苏省    沙特阿拉伯   出生年 出生月 出生日
 *
 * @param areaCode 受理地区码
 * @param countryThreeNumber 国家和地区代码
 * @param birthday 出生日期
 * @param sex 性别
 * @returns 外国人永久居留证号
 */
function getFprCardNumber(areaCode: string, countryThreeNumber: string, birthday: string, sex: string) {
	console.log('areaCode: ', areaCode, countryThreeNumber, birthday, sex)
	areaCode = areaCode.length > 2 ? areaCode.substring(0, 2) : areaCode
	const sequenceCode = getSequenceCode(sex)
	/* eslint-disable */
	const reg = /\-/g
	birthday = birthday.replace(reg, '')
	const prefix = '9' + areaCode + countryThreeNumber + birthday + sequenceCode
	const array = prefix.split('')
	let sum = 0
	for (let index = 0; index < array.length; index++) {
		const element = array[index]
		sum += parseInt(element) * IdcardConstant.WEIGHTEDFACTOR[index]
	}
	const mod = sum % 11
	const cardNumber = prefix + IdcardConstant.CHECKSUM[mod]
	return cardNumber
}

/**
 * 根据性别获取顺序码
 * @param sex 性别
 */
function getSequenceCode(sex: string): string {
	let randomNum = Math.floor(Math.random() * 1000)
	if (randomNum % 2 !== parseInt(sex)) {
		randomNum++
	}
	return getZeroStr(3 - randomNum.toString().length) + randomNum
}

/**
 * 获取指定数量的0
 * @param count 数量
 * @returns 字符串0
 */
function getZeroStr(count: number): string {
	let zeroStr = ''
	for (let i = 0; i < count; i++) {
		zeroStr += '0'
	}
	return zeroStr
}

/**
 * 生成随机姓名
 * @returns 随机姓名
 */
function getName(): string {
	const firstName = randomFirstName()
	const lastName = randomLastName()
	const name = firstName + lastName
	return name
}

/**
 * 随机获取姓
 * @returns 姓
 */
function randomFirstName(): string {
	const mIndex = Math.floor(Math.random() * 100)
	return FIRST_NAMES[mIndex]
}

/**
 * 随机获取名
 * @returns 名
 */
function randomLastName(): string {
	const sIndex = Math.floor(Math.random() * 100)
	return LAST_NAMES[sIndex]
}

/**
 * 生成随机手机号
 */
function getMobile(): string {
	const prefixArray = ['130', '131', '132', '133', '135', '137', '138', '170', '187', '189']

	const index = Math.floor(Math.random() * 10)
	let prefix = prefixArray[index]
	for (let j = 0; j < 8; j++) {
		prefix = prefix + Math.floor(Math.random() * 10)
	}
	return prefix
}

/**
 * 生成地址
 * @param areaCode 地区代码
 * @returns 地址
 */
function getAddress(areaCode: string): string {
	const index = Math.floor(Math.random() * 100)
	const streetName = STREET_NAMES[index]
	const number = Math.floor(Math.random() * 1000) + 1
	const province = getCityName(getCityCode(areaCode, 1))
	let city = getCityName(getCityCode(areaCode, 2))
	if (province !== city) {
		city = province + city
	}
	const country = getCityName(areaCode)
	return city + country + streetName + number + '号'
}

function getCityCode(areaCode: string, upLevel: number): string {
	return areaCode.substring(0, upLevel * 2) + getZeroStr((3 - upLevel) * 2)
}

function getCityName(code: string) {
	return findCityItem(JSON_CITY, code)
}

function findCityItem(cities: Array<{ code: string; name: string }>, code: string) {
	for (const index in cities) {
		const city: string = findOneCityItem(cities[index], code)
		if (city) {
			return city
		}
	}
	return ''
}

function findOneCityItem(city: any, code: string) {
	if (city.code === code) {
		return city.name
	} else {
		return findCityItem(city.child, code)
	}
	return null
}

/**
 * 随机国家/地区
 */
function randomCountry(): Country {
	const index = Math.floor(Math.random() * 239)
	return JSON_COUNTRY[index]
}
