<template>
	<div class="h-6 flex flex-row flex-nowrap justify-center pl-4">
		<div class="flex flex-nowrap justify-center">
			<span class="text-red-500 font-bold h-full">
				本软件仅支持用于学习测试，请在使用软件的过程中，遵守当地法律，禁止任何违法行为！
			</span>
		</div>
	</div>
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
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const routerPath = ref(route.path)

watch(
	() => route.path,
	(newPath) => {
		routerPath.value = newPath
	}
)
</script>
