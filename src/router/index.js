import Vue from 'vue'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue' // added
import Router from 'vue-router'
import blast from '@/components/blast' // added
import Vue2TouchEvents from 'vue2-touch-events' // added
import 'bootstrap/dist/css/bootstrap.css' // added
import 'bootstrap-vue/dist/bootstrap-vue.css' // added

Vue.use(Router)
Vue.use(BootstrapVue) // added
Vue.use(BootstrapVueIcons) // added
Vue.use(Vue2TouchEvents, { // added
  tapTolerance: 5
})

export default new Router({
  routes: [
    {
      path: '/blast/:id/:language',
      name: 'blast_with_language',
      component: blast
    },
    {
      path: '/blast/:id',
      name: 'blast',
      component: blast
    }
  ]
})
