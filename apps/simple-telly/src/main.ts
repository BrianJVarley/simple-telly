import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { tooltip } from '@simple-telly/ui'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.directive('tooltip', tooltip)
app.mount('#app')
