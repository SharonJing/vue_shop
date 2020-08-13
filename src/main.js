import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";
// 导入全局样式
import "./assets/css/global.css";
// 导入字体图标
import "./assets/fonts/iconfont.css";
import axios from "axios";
import TreeTable from "vue-table-with-tree-grid";

// axios.defaults.baseURL = "https://www.liulongbin.top:8888/api/private/v1/";
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
// 通过axios请求拦截器添加token,保证拥有获取数据的权限
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
});
Vue.config.productionTip = false;
Vue.prototype.$http = axios;

Vue.component("tree-table", TreeTable);

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
