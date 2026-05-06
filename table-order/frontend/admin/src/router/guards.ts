import type { Router } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export function setupAuthGuard(router: Router): void {
  router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore();
    const requiresAuth = to.meta.requiresAuth !== false;

    if (requiresAuth && !authStore.isAuthenticated) {
      next({ name: 'login' });
    } else if (to.name === 'login' && authStore.isAuthenticated) {
      next({ name: 'dashboard' });
    } else {
      next();
    }
  });
}
