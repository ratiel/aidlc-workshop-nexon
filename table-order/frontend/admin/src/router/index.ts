import { createRouter, createWebHistory } from 'vue-router';
import { setupAuthGuard } from './guards';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tables/:id/history',
      name: 'table-history',
      component: () => import('@/views/TableHistoryView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tables/setup',
      name: 'table-setup',
      component: () => import('@/views/TableSetupView.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

setupAuthGuard(router);

export default router;
