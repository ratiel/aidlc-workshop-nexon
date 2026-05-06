import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'

export function setupGuards(router: Router): void {
  router.beforeEach((to) => {
    const authStore = useAuthStore()
    const cartStore = useCartStore()
    const orderStore = useOrderStore()

    // Auth guard: redirect to /setup if not authenticated
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return { name: 'setup' }
    }

    // Guest guard: redirect to / if already authenticated
    if (to.meta.guestOnly && authStore.isAuthenticated) {
      return { name: 'menu' }
    }

    // Cart guard: redirect to / if cart is empty
    if (to.meta.requiresCart && cartStore.isEmpty) {
      return { name: 'menu' }
    }

    // Order result guard: redirect to / if no order result
    if (to.meta.requiresOrderResult && !orderStore.lastOrderResult) {
      return { name: 'menu' }
    }

    return true
  })
}
