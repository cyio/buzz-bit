import Vue, { VueConstructor } from "vue";
import VueCompositionAPI, { createApp } from '@vue/composition-api'
import { createI18n } from 'vue-i18n-composable/src/index'
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";
import { Button, Loading, Toast } from 'vant';
import '@vant/touch-emulator';
import privateConfig from '../private-config.json'
import SDKInit from '@/utils/sdk';
import { isMobile, shared } from '@/utils/'
import translations from './i18n'

Vue.config.productionTip = false;

Vue.use(VueCompositionAPI)
Vue.use(Button);
Vue.use(Loading);
Vue.use(Toast);

Vue.prototype.$version = '1.2.3'
Vue.prototype.$chargeAddress = privateConfig.chargeAddress
Vue.prototype.$SDKInit = SDKInit
Vue.prototype.$isMobile = isMobile()
Vue.prototype.$shared = shared

const i18n = createI18n({
  locale: shared.isZh ? 'zh' : 'en',
  messages: translations
})

const app = createApp({
  router,
  store,
  i18n,
  render: h => h(App),
})

app.mount('#app')

