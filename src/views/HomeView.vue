<template>
	<el-config-provider>
		<el-header>
			<HeaderMenu :active="routerPath" />
		</el-header>
		<router-view />
	</el-config-provider>
</template>

<script setup lang="ts">
import HeaderMenu from './HeaderMenuViewer.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const routerPath = route.path
</script>
