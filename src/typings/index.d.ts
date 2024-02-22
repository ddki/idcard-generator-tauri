declare module 'baseModel' {
	export interface EnumData {
		text: string
		value: string
		code: string
	}

	export interface Country {
		name: string
		GEC: string
		ISO_3166_1_twoString: string
		ISO_3166_1_threeString: string
		ISO_3166_1_threeNumber: number
		STANAG_1059: string
		www: string
	}
}
