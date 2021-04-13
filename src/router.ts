import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import StartPage from "@/presentation/view/StartPage/StartPage.vue";
import Upload from "@/presentation/view/Upload/Upload.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/start",
    name: "start-page",
    component: StartPage,
    meta: { title: "Welcome to RevIT" }
  },
  {
    path: "/",
    name: "upload",
    component: Upload,
    meta: { title: "Upload" }
  }
  /*
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/!* webpackChunkName: "about" *!/ "../views/About.vue")
  }
*/
];

const router = new VueRouter({
  mode: process.env.IS_ELECTRON ? 'hash' : 'history',
  base: process.env.VUE_APP_BASE_URL,
  routes
});

export default router;
