<template>
	<el-config-provider>
		<el-header>
			<HeaderMenu :active="routerPath" />
		</el-header>
		<router-view />
	</el-config-provider>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import HeaderMenu from './HeaderMenuViewer.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const routerPath = ref(route.path)

watch(
	() => route.path,
	(newPath) => {
		routerPath.value = newPath
	}
)
</script>
