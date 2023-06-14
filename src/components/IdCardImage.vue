<template>
	<div class="image">
		<p class="image__title">国徽面</p>
		<canvas class="image__canvas" id="fontCanvas"></canvas>
	</div>
	<div class="image">
		<p class="image__title">人像面</p>
		<canvas class="image__canvas" id="backCanvas"></canvas>
	</div>
</template>

<script lang="ts">
import { getBirthdayArrayFromIdCard, getSexFromIdCard } from '../utils/IdCardUtils'
import { nextTick } from 'process'
import { computed, defineComponent } from 'vue'
import IdcardConstant from '../constant/idcard'

export default defineComponent({
	name: 'IdCardImage',
	props: {
		fontSrc: {
			type: String,
			required: true
		},
		backSrc: {
			type: String,
			required: true
		},
		idCardInfo: {
			type: Object,
			required: true
		}
	},
	// back https://s3.bmp.ovh/imgs/2021/12/cc3873a71e9edb05.png
	// font https://s3.bmp.ovh/imgs/2021/12/10f6c7697fc2943c.png
	setup(props) {
		const dateStr = computed(() => {
			if (props.idCardInfo.validityType === '3') {
				return '长期有效'
			}
			return props.idCardInfo.startDate.replaceAll('-', '.') + '-' + props.idCardInfo.endDate.replaceAll('-', '.')
		})
		nextTick(() => {
			const fontCanvasElement = document.getElementById('fontCanvas') as HTMLCanvasElement
			fontCanvasElement.width = 600
			fontCanvasElement.height = 378
			const fontContext: CanvasRenderingContext2D = fontCanvasElement.getContext('2d') || new CanvasRenderingContext2D()
			const fontImage = new Image(1200)
			fontImage.onload = () => {
				fontContext.drawImage(fontImage, 0, 0, fontCanvasElement.width, fontCanvasElement.height)
				fontContext.font = '20px serif'
				fontContext.fillStyle = '#000'
				fontContext.fillText(props.idCardInfo.office, 260, 287)
				fontContext.fillText(dateStr.value, 260, 330)
			}
			fontImage.src = props.fontSrc

			const backCanvasElement = document.getElementById('backCanvas') as HTMLCanvasElement
			backCanvasElement.width = 600
			backCanvasElement.height = 378
			const backContext: CanvasRenderingContext2D = backCanvasElement.getContext('2d') || new CanvasRenderingContext2D()
			const backImage = new Image(1200)
			const photoImage = new Image(300)
			backImage.onload = () => {
				backContext.drawImage(backImage, 0, 0, backCanvasElement.width, backCanvasElement.height)
				backContext.font = '20px serif'
				backContext.fillStyle = '#000'
				backContext.fillText(props.idCardInfo.name, 110, 85)
				backContext.fillText(
					IdcardConstant.getSexByValue(getSexFromIdCard(props.idCardInfo.idCard))?.text || '',
					110,
					128
				)
				backContext.fillText(props.idCardInfo.nation, 245, 128)
				const arr = getBirthdayArrayFromIdCard(props.idCardInfo.idCard)
				backContext.fillText(arr[0], 110, 172)
				backContext.fillText(arr[1], 210, 172)
				backContext.fillText(arr[2], 270, 172)
				backContext.fillText(props.idCardInfo.address, 110, 216)
				backContext.fillText(props.idCardInfo.idCard, 180, 330)

				backContext.drawImage(photoImage, 0, 0, backCanvasElement.width, backCanvasElement.height)
			}
			photoImage.src = 'https://s3.bmp.ovh/imgs/2021/12/cc3873a71e9edb05.png'
			backImage.src = props.backSrc
		})

		return {}
	}
})
</script>

<style lang="less" scoped>
.image {
	&__title {
		text-align: left;
	}
	&__content {
		width: 800px;
	}
	&__canvas {
		display: block;
	}
}
</style>
