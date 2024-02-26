<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

onMounted(() => {
	invoke('close_splashscreen')
})
</script>

<template>
	<Suspense>
		<RouterView />
	</Suspense>
</template>

<style scoped></style>
