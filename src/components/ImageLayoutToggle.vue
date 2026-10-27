<template>
	<el-tooltip :content="vertical ? '点击切换为水平排列' : '点击切换为垂直排列'" placement="top">
		<el-button class="layout-toggle" type="primary" @click="toggle">
			<!-- 垂直排列：上下两张 -->
			<svg
				v-if="vertical"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
			>
				<rect x="4" y="4" width="16" height="6.5" rx="1.5" />
				<rect x="4" y="13.5" width="16" height="6.5" rx="1.5" />
			</svg>
			<!-- 水平排列：左右两张 -->
			<svg
				v-else
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
			>
				<rect x="4" y="4" width="6.5" height="16" rx="1.5" />
				<rect x="13.5" y="4" width="6.5" height="16" rx="1.5" />
			</svg>
		</el-button>
	</el-tooltip>
</template>

<script setup lang="ts">
/** 是否垂直排列（上下堆叠） */
const vertical = defineModel<boolean>({ default: false })

function toggle(): void {
	vertical.value = !vertical.value
}
</script>

<style lang="less" scoped>
.layout-toggle {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	padding: 0;
	margin-left: 0;
	border-radius: 8px;
	box-shadow: var(--el-box-shadow-light);
}
</style>
