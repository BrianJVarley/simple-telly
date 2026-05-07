import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from 'vue-router'
import HomeView from '../views/HomeView.vue'

// Route Guards

/**
 * Remove query parameters from the URL when next route doesn't need them.
 * @param to
 * @param _from
 * @param next
 */
function removeQueryParams(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  if (Object.keys(to.query).length > 0) {
    next({ path: to.path, query: {} })
    return
  }

  next()
}
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
      path: '/shows/:id',
      name: 'show-details',
      component: () => import('../views/ShowDetails.vue'),
      props: (route) => ({ id: Number(route.params.id) }),
      beforeEnter: [removeQueryParams],
    },
  ],
})

export default router
