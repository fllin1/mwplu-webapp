// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { errorHandlerPlugin } from './services/errorHandler'

// Import global styles
import './styles/main.css'

const app = createApp(App)

// Setup Pinia
const pinia = createPinia()
app.use(pinia)

// Setup Router
app.use(router)

// Setup global error handling
app.use(errorHandlerPlugin)

// Mount app
app.mount('#app')
