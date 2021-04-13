import Vue from "vue";
import App from "./presentation/view/App.vue";
import router from "./router";
import axios from "axios";
import Vuetify from "vuetify/lib";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import "@mdi/font/css/materialdesignicons.css";

import "roboto-fontface/css/roboto/roboto-fontface.css";


import "./global.scss";

const applicationVersion = require("../package.json").version + "." + require("../package.json").mainVersion;;

Vue.use(Vuetify);
//
// axios.interceptors.request.use(function(config) {
//   return config;
// });
// axios.interceptors.response.use(
//     function(response) {
//       if (response.headers.authorization) {
//         store.commit("setJWT", response.headers.authorization);
//       }
//       return response;
//     },
//     function(error) {
//       console.log(error);
//       // avoid redirecting from admin page
//       // @ts-ignore
//       if (error == "Error: Network Error" && router.history.current.name !== "Admin") {
//         router.push({
//           name: "Error504",
//         });
//       }
//
//       if (error.response && error.response.status === 401) {
//         if (
//             (error.response && error.response.path && error.response.path.indexOf("oauth") == -1) ||
//             !store.state.jwt
//         ) {
//           // @ts-ignore
//           if (!router.history.current.name !== "Login") {
//             router.push({
//               name: "Login",
//             });
//           }
//         }
//       }
//
//       return Promise.reject(error);
//     }
// );
// Vue.prototype.$http = axios;
//
// store.state.version = require("../package.json").version + "." + require("../package.json").mainVersion;

const vuetify = new Vuetify({
  icons: {
    iconfont: "md"
  },
  theme: {
    dark: true,
    themes: {
      light: {
        primary: "#232323",
        secondary: "#b0bec5",
        accent: "#8c9eff",
        error: "#b71c1c"
      }
    }
  }
});

// window.onerror = function(message, source, line, column, error) {
//     console.log("Global error message: " + message);
// }

export default vuetify;

Vue.config.productionTip = false;

axios.defaults.withCredentials = false;
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

// Vue.prototype.$axios = axios;
Vue.prototype.applicationVersion = applicationVersion;

router.beforeEach((to, from, next) => {
  document.title = to.meta.title + " | Template " + applicationVersion;
  next();
});

new Vue({
  vuetify,
  router,
  // store,
  render: h => h(App),
  created() {
    // todo: implement data loading
  },
  data: { switch: true }
}).$mount("#app");
