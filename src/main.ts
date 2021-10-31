import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";
import { Button, Loading } from 'vant';

Vue.config.productionTip = false;
Vue.use(Button);
Vue.use(Loading);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
