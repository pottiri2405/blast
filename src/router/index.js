import Vue from 'vue'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue' // added
import Router from 'vue-router'
import blast from '@/components/blast' // added
import maze from '@/components/maze' // added
import stage from '@/components/stage' // added
import quiz from '@/components/quiz' // added
import thumbnail from '@/components/thumbnail' // added
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
      name: 'blast',
      component: blast
    },
    {
      path: '/maze/:id/:language',
      name: 'maze',
      component: maze
    },
    {
      path: '/stage/:id/:language',
      name: 'stage',
      component: stage
    },
    {
      path: '/quiz/:id/:language',
      name: 'quiz',
      component: quiz
    },
    {
      path: '/thumbnail/:id/:language',
      name: 'thumbnail',
      component: thumbnail
    }
  ]
})
