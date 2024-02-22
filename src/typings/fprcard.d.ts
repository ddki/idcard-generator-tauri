import type { Country } from 'baseModel'

declare module 'fprCard' {
	export interface FprCardInfo {
		cardNumber: string
		relation: string
		age: number
		firstName: string
		lastName: string
		sex: string
		birthday: string
		mobile: string
		country: Country
	}

	export interface FprCardInput {
		age: number
		sex: string
		// 受理地区代码
		acceptAreaCode: string
		birthday: string
		number: number
		relation: string
		country?: Country
	}

	export interface FprCardImageInput {
		cardNumber: string
		firstName: string
		lastName: string
		countryText: string
		birthday: string
		sexText: string
		validityType: string
		startDate: string
		endDate: string
	}

	export interface FprCardImageInfo {
		fontImage: string
		backImage: string
	}
}
