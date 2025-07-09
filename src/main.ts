import { createApp } from 'vue';
import './assets/css/style.css';
import App from './App.vue';
import router from '@/router/index';
import { createPinia } from 'pinia';
import i18n from './i18n';

const app = createApp(App);

app.use(router);
app.use(createPinia());
app.use(i18n);
app.mount('#app');
