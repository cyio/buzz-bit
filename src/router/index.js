import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import PubList from "../views/PubList.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/user",
    name: "User",
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
    redirect: "/pub/hot",
  },
  {
    path: "/pub/:type",
    name: "PubList",
    component: PubList,
    // component: () =>
    //   import(/* webpackChunkName: "PubList" */ "../views/PubList.vue"),
  },
  {
    path: "/decode",
    name: "Decode",
    component: () =>
      import(/* webpackChunkName: "Decode" */ "../views/Decode.vue"),
  },
  {
    path: "/preview/:txId",
    name: "Preview",
    component: () =>
      import(/* webpackChunkName: "Preview" */ "../views/Preview.vue"),
  },
  {
    path: "/detail/:txId",
    name: "Detail",
    component: () =>
      import(/* webpackChunkName: "Detail" */ "../views/Detail.vue"),
  },
  {
    path: "/setting",
    name: "Setting",
    component: () =>
      import(/* webpackChunkName: "Setting" */ "../views/Setting.vue"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
