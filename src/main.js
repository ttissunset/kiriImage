import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'
import VueApexCharts from 'vue3-apexcharts'
import { initSecurityMeasures } from './utils/security'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.component('apexchart', VueApexCharts)

// 初始化安全措施
initSecurityMeasures()

// 在挂载应用前初始化认证状态
const authStore = useAuthStore()
authStore.initialize().finally(() => {
  app.mount('#app')
})
