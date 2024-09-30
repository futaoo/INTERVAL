import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/tailwind.css'
import { createPinia } from 'pinia';
import { speciesColors } from './speciesColors';
import $bus from './utils/Events';



const app = createApp(App);
const pinia = createPinia()

// Provide the speciesColors globally
app.provide('speciesColors', speciesColors);

app.provide('$bus', $bus);

app.use(pinia)

app.use(router)

app.mount('#app')
