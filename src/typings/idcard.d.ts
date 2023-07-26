declare module 'idCard' {
	export interface IdCardInfo {
		idCard: string
		relation: string
		age: number
		name: string
		sex: string
		birthday: string
		mobile: string
		address: string
	}

	export interface IdCardInput {
		age: number
		sex: string
		areaCode: string
		birthday: string
		number: number
		relation: string
		address: string
	}

	export interface IdCardImageInput {
		name: string
		nation: string
		idCard: string
		sexText: string
		address: string
		office: string
		validityType: string
		startDate: string
		endDate: string
	}

	export interface IdCardImageInfo {
		fontImage: string
		backImage: string
	}
}
