import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
  {
    path: "/pub",
    name: "PubList",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/PubList.vue"),
  },
  {
    path: "/decode",
    name: "Decode",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Decode.vue"),
  },
  {
    path: "/preview/:txId",
    name: "Preview",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Preview.vue"),
  },
  {
    path: "/setting",
    name: "Setting",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Setting.vue"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
