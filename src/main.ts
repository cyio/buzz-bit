import Vue from "vue";
import { createI18n } from 'vue-i18n-composable'
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";
import { Button, Loading, Toast, Icon } from 'vant';
import '@vant/touch-emulator';
import privateConfig from '../private-config.json'
import SDKInit from '@/utils/sdk';
import { isMobile, shared } from '@/utils/'
import translations from './i18n'
import InlineSvg from 'vue-inline-svg';
import AppConfig from '@/config/'
import VueKeepAliveDev from 'vue-keep-alive-dev'
import Popover from 'vue-js-popover'
// import 'tailwindcss/tailwind.css'
// import './base.css'

Vue.config.productionTip = false;

Vue.use(Button);
Vue.use(Loading);
Vue.use(Toast);
Vue.use(Icon);
Vue.component('inline-svg', InlineSvg);
Vue.use(VueKeepAliveDev);
Vue.use(Popover)

Vue.prototype.$version = '1.18.17'
Vue.prototype.$chargeAddress = privateConfig.chargeAddress
Vue.prototype.$SDKInit = SDKInit
Vue.prototype.$isMobile = isMobile()
Vue.prototype.$shared = shared
// @ts-expect-error
Vue.prototype.$isInShowApp = !!window.appMetaIdJs
Vue.prototype.$AppConfig = AppConfig
Vue.prototype.$sensiletStore = {}
Vue.prototype.$isDev = location.hostname === 'localhost'

// window.$ShowAccount = {}

// @ts-expect-error
window.Vue = Vue
const i18n = createI18n({
  locale: shared.isZh ? 'zh' : 'en',
  messages: translations
})

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App),
})

