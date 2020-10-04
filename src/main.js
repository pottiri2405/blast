// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios' // add by POTTIRI
import VueAxios from 'vue-axios' // add by POTTIRI
import gv from './mixins/global' // add by POTTIRI

Vue.config.productionTip = false
Vue.use(VueAxios, axios) // add by POTTIRI
Vue.mixin(gv) // add by POTTIRI

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})