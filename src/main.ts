import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";
import { Button, Loading, Toast } from 'vant';
import '@vant/touch-emulator';

Vue.config.productionTip = false;
Vue.use(Button);
Vue.use(Loading);
Vue.use(Toast);

Vue.prototype.$version = '0.7.4'

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
