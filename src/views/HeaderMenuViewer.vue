<template>
	<el-menu :default-active="props.active" mode="horizontal" :default-openeds="['basic']" router>
		<el-menu-item :index="menu.router" v-for="(menu, index) in state.menus" :key="index">{{ menu.text }}</el-menu-item>
	</el-menu>
</template>
<script setup lang="ts">
const props = defineProps({
	active: {
		type: String,
		required: true
	}
})

const state = {
	menus: [
		{
			text: '身份证',
			router: '/idcard'
		},
		{
			text: '身份证照片',
			router: '/idcard-image'
		},
		{
			text: '外国人永久居留证',
			router: '/fprcard'
		},
		{
			text: '外国人永久居留证照片',
			router: '/fprcard-image'
		}
	]
}
</script>
