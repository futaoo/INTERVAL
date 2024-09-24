import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/tailwind.css'
import { speciesColors } from './speciesColors';
import $bus from './utils/Events';



const app = createApp(App);

// Provide the speciesColors globally
app.provide('speciesColors', speciesColors);

app.provide('$bus', $bus);

app.use(router).mount('#app')
