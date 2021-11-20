import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";
import { Button, Loading, Toast } from 'vant';
import '@vant/touch-emulator';
import privateConfig from '../private-config.json'
import SDKInit from '@/utils/sdk';
import { isMobile } from '@/utils/'

Vue.config.productionTip = false;
Vue.use(Button);
Vue.use(Loading);
Vue.use(Toast);

Vue.prototype.$version = '0.8.2'
Vue.prototype.$chargeAddress = privateConfig.chargeAddress
Vue.prototype.$SDKInit = SDKInit
Vue.prototype.$isMobile = isMobile()

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
