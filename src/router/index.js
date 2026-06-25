import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ZoekenView from '../views/ZoekenView.vue'
import FavorietenView from '../views/FavorietenView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',           component: HomeView },
    { path: '/zoeken',     component: ZoekenView },
    { path: '/favorieten', component: FavorietenView },
  ],
})

export default router
