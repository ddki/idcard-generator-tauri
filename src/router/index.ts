import { createRouter, createWebHashHistory, type RouteLocationRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
	history: createWebHashHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView
		},
		{
			path: '/about',
			name: 'about',
			// route level code-splitting
			// this generates a separate chunk (About.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import('../views/AboutView.vue')
		},
		{
			path: '/setting',
			name: 'setting',
			component: () => import('../views/SettingView.vue')
		},
		{
			path: '/wiki',
			name: 'wiki',
			component: () => import('../views/WikiView.vue')
		}
	]
})

function navigateTo(route: RouteLocationRaw) {
	router.push({})
}

export default router
