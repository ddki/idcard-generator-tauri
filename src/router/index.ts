import { createRouter, createWebHashHistory, type RouteLocationRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
	history: createWebHashHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView,
			redirect: '/idcard',
			children: [
				{
					path: '/idcard',
					name: 'IdCard',
					component: () => import('../views/IdCard/IdCardViewer.vue')
				},
				{
					path: '/idcard-image',
					name: 'IdCardImage',
					component: () => import('../views/IdCard/IdCardImageViewer.vue'),
					props: (route) => ({
						name: route.query.name,
						idCard: route.query.idCard,
						sexText: route.query.sexText,
						address: route.query.address
					})
				},
				{
					path: '/fprcard',
					name: 'FprCard',
					component: () => import('../views/FprCard/FprCardViewer.vue')
				},
				{
					path: '/fprcard-image',
					name: 'FprCardImage',
					component: () => import('../views/FprCard/FprCardImageViewer.vue'),
					props: (route) => ({
						firstName: route.query.firstName,
						lastName: route.query.lastName,
						cardNumber: route.query.cardNumber,
						sexText: route.query.sexText,
						countryText: route.query.countryText,
						birthday: route.query.birthday
					})
				}
			]
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
		}
	]
})

function navigateTo(route: RouteLocationRaw) {
	router.push({})
}

export default router
