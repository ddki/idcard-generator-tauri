import { getBirthday } from '../../utils/IdCardUtils'
import { IdCardInput } from 'idCard'

/**
 * 根据关系获得身份证证件号策略接口
 */
interface RelationStrategy {
	getIdCardInfos(params: IdCardInput): IdCardInput
}

export class Companion implements RelationStrategy {
	getIdCardInfos(params: IdCardInput): IdCardInput {
		const ageRange = Math.floor(Math.random() * 10)
		let newAge = params.age - ageRange
		newAge = newAge < 1 ? 1 : newAge
		const newParams: IdCardInput = {
			age: newAge,
			sex: parseInt(params.sex) - 1 < 0 ? '1' : '0',
			areaCode: params.areaCode,
			birthday: getBirthday(newAge),
			number: 1,
			relation: params.relation,
			address: params.address
		}
		return newParams
	}
}

export class Son implements RelationStrategy {
	getIdCardInfos(params: IdCardInput): IdCardInput {
		const ageRange = Math.floor(Math.random() * 10)
		let newAge = params.age - 20 - ageRange
		newAge = newAge < 1 ? 1 : newAge
		const newParams: IdCardInput = {
			age: newAge,
			sex: '1',
			areaCode: params.areaCode,
			birthday: getBirthday(newAge),
			number: 1,
			relation: params.relation,
			address: params.address
		}
		return newParams
	}
}

export class Daughter implements RelationStrategy {
	getIdCardInfos(params: IdCardInput): IdCardInput {
		const ageRange = Math.floor(Math.random() * 10)
		let newAge = params.age - 20 - ageRange
		newAge = newAge < 1 ? 1 : newAge
		const newParams: IdCardInput = {
			age: newAge,
			sex: '0',
			areaCode: params.areaCode,
			birthday: getBirthday(newAge),
			number: 1,
			relation: params.relation,
			address: params.address
		}
		return newParams
	}
}

export class Father implements RelationStrategy {
	getIdCardInfos(params: IdCardInput): IdCardInput {
		const ageRange = Math.floor(Math.random() * 10)
		let newAge = params.age + 20 + ageRange
		newAge = newAge < 1 ? 1 : newAge
		const newParams: IdCardInput = {
			age: newAge,
			sex: '1',
			areaCode: params.areaCode,
			birthday: getBirthday(newAge),
			number: 1,
			relation: params.relation,
			address: params.address
		}
		return newParams
	}
}

export class Mather implements RelationStrategy {
	getIdCardInfos(params: IdCardInput): IdCardInput {
		const ageRange = Math.floor(Math.random() * 10)
		let newAge = params.age + 20 + ageRange
		newAge = newAge < 1 ? 1 : newAge
		const newParams: IdCardInput = {
			age: newAge,
			sex: '0',
			areaCode: params.areaCode,
			birthday: getBirthday(newAge),
			number: 1,
			relation: params.relation,
			address: params.address
		}
		return newParams
	}
}

export class GrandFather implements RelationStrategy {
	getIdCardInfos(params: IdCardInput): IdCardInput {
		const ageRange = Math.floor(Math.random() * 10)
		let newAge = params.age + 40 + ageRange
		newAge = newAge < 1 ? 1 : newAge
		const newParams: IdCardInput = {
			age: newAge,
			sex: '1',
			areaCode: params.areaCode,
			birthday: getBirthday(newAge),
			number: 1,
			relation: params.relation,
			address: params.address
		}
		return newParams
	}
}

export class GrandMather implements RelationStrategy {
	getIdCardInfos(params: IdCardInput): IdCardInput {
		const ageRange = Math.floor(Math.random() * 10)
		let newAge = params.age + 40 + ageRange
		newAge = newAge < 1 ? 1 : newAge
		const newParams: IdCardInput = {
			age: newAge,
			sex: '0',
			areaCode: params.areaCode,
			birthday: getBirthday(newAge),
			number: 1,
			relation: params.relation,
			address: params.address
		}
		return newParams
	}
}

export class GrandSon implements RelationStrategy {
	getIdCardInfos(params: IdCardInput): IdCardInput {
		const ageRange = Math.floor(Math.random() * 10)
		let newAge = params.age - 40 - ageRange
		newAge = newAge < 1 ? 1 : newAge
		const newParams: IdCardInput = {
			age: newAge,
			sex: '1',
			areaCode: params.areaCode,
			birthday: getBirthday(newAge),
			number: 1,
			relation: params.relation,
			address: params.address
		}
		return newParams
	}
}

export class GrandDaughter implements RelationStrategy {
	getIdCardInfos(params: IdCardInput): IdCardInput {
		const ageRange = Math.floor(Math.random() * 10)
		let newAge = params.age - 40 - ageRange
		newAge = newAge < 1 ? 1 : newAge
		const newParams: IdCardInput = {
			age: newAge,
			sex: '0',
			areaCode: params.areaCode,
			birthday: getBirthday(newAge),
			number: 1,
			relation: params.relation,
			address: params.address
		}
		return newParams
	}
}

export class Default implements RelationStrategy {
	getIdCardInfos(params: IdCardInput): IdCardInput {
		return params
	}
}

export class RelationContext {
	private strategy: RelationStrategy
	private params: IdCardInput

	constructor(params: IdCardInput) {
		this.params = params
		this.strategy = this.getStrategy(params.relation)
	}

	private getStrategy(relation: string): RelationStrategy {
		switch (relation) {
			case '1':
				return new Companion()
			case '2':
				return new Son()
			case '3':
				return new Daughter()
			case '4':
				return new Father()
			case '5':
				return new Mather()
			case '6':
				return new GrandFather()
			case '7':
				return new GrandMather()
			case '8':
				return new GrandSon()
			case '9':
				return new GrandDaughter()
		}
		return new Default()
	}

	// 执行策略
	public execute(): IdCardInput {
		return this.strategy.getIdCardInfos(this.params)
	}
}
