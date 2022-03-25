import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import IdCard from '../views/idcard/index.vue'
import IdCardImage from '@/views/idcard/image.vue'
import About from '@/views/About.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    redirect: '/idcard',
    children: [
      {
        path: '/idcard',
        name: 'IdCard',
        component: IdCard
      },
      {
        path: '/idcard-image',
        name: 'IdCardImage',
        component: IdCardImage,
        props: route => ({ name: route.params.name, idCard: route.params.idCard, sexText: route.params.sexText })
      },
      {
        path: '/about',
        name: '关于',
        component: About
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

export default router
