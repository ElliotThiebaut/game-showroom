import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './index.css'
import 'video.js/dist/video-js.min.css'
import router from "@/router";

createApp(App)
    .use(router)
    .use(createPinia())
    .mount('#app')
