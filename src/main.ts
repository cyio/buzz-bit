import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";
import { Button, Loading, Toast } from 'vant';
import '@vant/touch-emulator';
import privateConfig from '../private-config.json'

Vue.config.productionTip = false;
Vue.use(Button);
Vue.use(Loading);
Vue.use(Toast);

Vue.prototype.$version = '0.7.6'
Vue.prototype.$chargeAddress = privateConfig.chargeAddress

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
