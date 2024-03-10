import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/index.css'
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'

import App from './App.vue'
import router from './router'

VMdPreview.use(vuepressTheme)

const app = createApp(App)

app.use(createPinia())
app.use(VMdPreview)
app.use(router)

app.mount('#app')

document.addEventListener('keydown', function (event) {
	if (
		event.key === 'F5' ||
		(event.ctrlKey && event.key.toLowerCase() === 'r') ||
		(event.metaKey && event.key.toLowerCase() === 'r')
	) {
		event.preventDefault()
	}
	if (
		event.key === 'F12' ||
		(event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'i') ||
		(event.metaKey && event.shiftKey && event.key.toLowerCase() === 'i')
	) {
		event.preventDefault()
	}
})

document.addEventListener('contextmenu', function (event) {
	event.preventDefault()
})
