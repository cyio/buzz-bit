import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import PubList from "../views/PubList.vue";
import { getUrlParameterByName } from '@/utils/index';

Vue.use(VueRouter);

const routes = [
  { 
    path: '/', 
    redirect: (to) => {
      const code = getUrlParameterByName('code')
      const token = localStorage.getItem('access_token')
      if (code || token) {
        return '/user'
      }
      return '/pub/hot'
    }
  },
  {
    path: "/user",
    name: "User",
    component: Home,
  },
  {
    path: "/user/:id",
    name: "UserDetail",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/UserDetail.vue"),
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
  // {
  //   path: "/pub",
  //   redirect: "/pub/hot",
  // },
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
    path: "/send",
    name: "Send",
    component: () =>
      import(/* webpackChunkName: "Decode" */ "../views/Send.vue"),
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
  {
    path: "/search",
    name: "Search",
    component: () =>
      import(/* webpackChunkName: "Setting" */ "../views/Search.vue"),
  },
  {
    path: "/test",
    name: "Test",
    component: () =>
      import(/* webpackChunkName: "Test" */ "../views/Test.vue"),
  },
  {
    path: '*', // or '/index.html'
    beforeEnter: (to, from, next) => {
      next('/')
    }
  }
];

const router = new VueRouter({
  mode: 'history',
  routes,
  // scrollBehavior (to, from, savedPosition) {
  //   return new Promise((resolve, reject) => {
  //     let pos = { x: 0, y: 0, behavior: 'smooth' }
  //     if (savedPosition) {
  //       pos = {...pos, ...savedPosition }
  //     }
  //     setTimeout(() => {
  //       resolve(pos)
  //       // scrollTo(0, pos.y)
  //       // console.log(window.pageYOffset, pos.y)
  //       // if (window.pageYOffset < pos.y) {
  //       //   setTimeout(() => {
  //       //     scrollTo(0, pos.y)
  //       //     console.log(window.pageYOffset, pos.y)
  //       //   }, 400)
  //       // }
  //     }, 500)
  //   })
  // }
});

export default router;
