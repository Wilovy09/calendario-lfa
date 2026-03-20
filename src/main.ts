import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ViewTransitionsPlugin } from 'vue-view-transitions'

import App from './App.vue'
import router from './router'
import './styles/global.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ViewTransitionsPlugin())

app.mount('#app')
