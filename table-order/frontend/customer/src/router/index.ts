import { createRouter, createWebHistory } from 'vue-router'
import { setupGuards } from './guards'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/setup',
      name: 'setup',
      component: () => import('@/views/SetupView.vue'),
      meta: { requiresAuth: false, guestOnly: true },
    },
    {
      path: '/',
      name: 'menu',
      component: () => import('@/views/MenuView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/order/confirm',
      name: 'orderConfirm',
      component: () => import('@/views/OrderConfirmView.vue'),
      meta: { requiresAuth: true, requiresCart: true },
    },
    {
      path: '/order/success',
      name: 'orderSuccess',
      component: () => import('@/views/OrderSuccessView.vue'),
      meta: { requiresAuth: true, requiresOrderResult: true },
    },
    {
      path: '/orders',
      name: 'orderHistory',
      component: () => import('@/views/OrderHistoryView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

setupGuards(router)

export default router
