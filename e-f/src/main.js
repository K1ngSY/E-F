import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

createApp({
    setup() {
        const message = ref('Hello World!')
        return {
            message
        }
    }
}).mount('#app')