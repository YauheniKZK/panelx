import { createApp } from 'vue';
import './assets/css/style.css';
import App from './App.vue';
import router from '@/router/index';
import { createPinia } from 'pinia';
import i18n from './i18n';
import WebApp from '@twa-dev/sdk'

WebApp.themeParams.section_header_text_color = '#FFFFFF'
WebApp.themeParams.secondary_bg_color = '#888888'
WebApp.themeParams.text_color = '#FFFFFF'
WebApp.themeParams.text_color = '#FFFFFF'
WebApp.setHeaderColor('#35374B')
WebApp.ready()

const app = createApp(App);

app.use(router);
app.use(createPinia());
app.use(i18n);
app.mount('#app');
