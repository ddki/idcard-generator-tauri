import IdcardConstant from '../constant/idcard'
import type { IdCardImageInfo, IdCardImageInput, IdCardInfo, IdCardInput } from 'idCard'

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
	birthday = birthday.replaceAll('-', '')
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
	const familyNames = [
		'赵',
		'钱',
		'孙',
		'李',
		'周',
		'吴',
		'郑',
		'王',
		'冯',
		'陈',
		'褚',
		'卫',
		'蒋',
		'沈',
		'韩',
		'杨',
		'朱',
		'秦',
		'尤',
		'许',
		'何',
		'吕',
		'施',
		'张',
		'孔',
		'曹',
		'严',
		'华',
		'金',
		'魏',
		'陶',
		'姜',
		'戚',
		'谢',
		'邹',
		'喻',
		'柏',
		'水',
		'窦',
		'章',
		'云',
		'苏',
		'潘',
		'葛',
		'奚',
		'范',
		'彭',
		'郎',
		'鲁',
		'韦',
		'昌',
		'马',
		'苗',
		'凤',
		'花',
		'方',
		'俞',
		'任',
		'袁',
		'柳',
		'酆',
		'鲍',
		'史',
		'唐',
		'费',
		'廉',
		'岑',
		'薛',
		'雷',
		'贺',
		'倪',
		'汤',
		'滕',
		'殷',
		'罗',
		'毕',
		'郝',
		'邬',
		'安',
		'常',
		'乐',
		'于',
		'时',
		'傅',
		'皮',
		'卞',
		'齐',
		'康',
		'伍',
		'余',
		'元',
		'卜',
		'顾',
		'孟',
		'平',
		'黄',
		'和',
		'穆',
		'萧',
		'尹'
	]
	const givenNames = [
		'子璇',
		'淼',
		'国栋',
		'夫子',
		'瑞堂',
		'甜',
		'敏',
		'尚',
		'国贤',
		'贺祥',
		'晨涛',
		'昊轩',
		'易轩',
		'益辰',
		'益帆',
		'益冉',
		'瑾春',
		'瑾昆',
		'春齐',
		'杨',
		'文昊',
		'东东',
		'雄霖',
		'浩晨',
		'熙涵',
		'溶溶',
		'冰枫',
		'欣欣',
		'宜豪',
		'欣慧',
		'建政',
		'美欣',
		'淑慧',
		'文轩',
		'文杰',
		'欣源',
		'忠林',
		'榕润',
		'欣汝',
		'慧嘉',
		'新建',
		'建林',
		'亦菲',
		'林',
		'冰洁',
		'佳欣',
		'涵涵',
		'禹辰',
		'淳美',
		'泽惠',
		'伟洋',
		'涵越',
		'润丽',
		'翔',
		'淑华',
		'晶莹',
		'凌晶',
		'苒溪',
		'雨涵',
		'嘉怡',
		'佳毅',
		'子辰',
		'佳琪',
		'紫轩',
		'瑞辰',
		'昕蕊',
		'萌',
		'明远',
		'欣宜',
		'泽远',
		'欣怡',
		'佳怡',
		'佳惠',
		'晨茜',
		'晨璐',
		'运昊',
		'汝鑫',
		'淑君',
		'晶滢',
		'润莎',
		'榕汕',
		'佳钰',
		'佳玉',
		'晓庆',
		'一鸣',
		'语晨',
		'添池',
		'添昊',
		'雨泽',
		'雅晗',
		'雅涵',
		'清妍',
		'诗悦',
		'嘉乐',
		'晨涵',
		'天赫',
		'玥傲',
		'佳昊',
		'天昊',
		'萌萌',
		'若萌'
	]
	const mIndex = Math.floor(Math.random() * 100)
	const familyName = familyNames[mIndex]

	const sIndex = Math.floor(Math.random() * 100)
	const givenName = givenNames[sIndex]
	const name = familyName + givenName
	return name
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
	// 56个
	const streetNames = [
		'朱雀大街',
		'太乙路',
		'太白路',
		'太华路',
		'长乐坊',
		'长樱路',
		'案板街',
		'竹笆市',
		'骡马市',
		'东木头市',
		'西木头市',
		'安仁坊',
		'端履门',
		'德福巷',
		'洒金桥',
		'冰窖巷',
		'菊花园',
		'下马陵',
		'索罗巷',
		'后宰门',
		'书院门',
		'炭市街',
		'马厂子',
		'景龙池',
		'甜水井',
		'柏树林',
		'苏州的',
		'桃花坞大街',
		'夕水街',
		'春熙路',
		'支矶石街',
		'涯石街',
		'正府街',
		'督院街',
		'布后街',
		'将军街',
		'走马街',
		'点将台街',
		'琴台路',
		'守经街',
		'蓥华街',
		'岳宫街',
		'天竺街',
		'染房街',
		'浆洗街',
		'落虹街',
		'红布街',
		'桃溪路',
		'芳草街',
		'悠然街',
		'幽静街',
		'细语街',
		'凭阑街',
		'碧波道',
		'霜林道',
		'璃醉街',
		'镗钯街',
		'天仙桥',
		'送仙桥',
		'合江亭',
		'梧桐街',
		'杏花街',
		'盐市口',
		'乌衣巷',
		'草鞋巷',
		'五块石',
		'九里堤',
		'八里桥',
		'十里店',
		'高笋塘',
		'高升塘',
		'小菜园',
		'荷花池',
		'迎仙桥',
		'水津街',
		'烟台道',
		'中山道',
		'朱雀大街',
		'太乙路',
		'太白路',
		'太华路',
		'长乐坊',
		'长樱路',
		'案板街',
		'竹笆市',
		'骡马市',
		'东木头市',
		'西木头市',
		'安仁坊',
		'端履门',
		'德福巷',
		'洒金桥',
		'冰窖巷',
		'菊花园',
		'粉巷',
		'索罗巷',
		'岐黄大道',
		'清策庄',
		'清虚埔',
		'无妄坡'
	]
	const index = Math.floor(Math.random() * 100)
	const streetName = streetNames[index]
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
	return findCityItem(IdcardConstant.cities, code)
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
