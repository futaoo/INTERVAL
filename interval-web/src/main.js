import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/tailwind.css'
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { speciesColors } from './speciesColors';
import $bus from './utils/Events';



import 'ol/ol.css'; // OpenLayers core CSS
import 'ol-layerswitcher/dist/ol-layerswitcher.css';




const app = createApp(App);
const pinia = createPinia()
// pinia.use(piniaPluginPersistedstate);

// Provide the speciesColors globally
app.provide('speciesColors', speciesColors);

app.provide('$bus', $bus);

app.use(pinia)

app.use(router)

app.mount('#app')
