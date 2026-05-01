import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  scrollBehavior() {
    return { top: 0 }
  },
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/shows',
      name: 'shows',
      component: HomeView,
    },
    {
      path: '/show/:id',
      name: 'show-details',
      component: () => import('../views/ShowDetails.vue'),
      props: true,
    },
  ],
})

export default router
