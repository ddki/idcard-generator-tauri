import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'

import App from './App.vue'
import router from './router'

import 'virtual:windi.css'

VMdPreview.use(githubTheme, {})

const app = createApp(App)

app.use(createPinia())
app.use(ElementPlus)
app.use(VMdPreview)
app.use(router)

app.mount('#app')
