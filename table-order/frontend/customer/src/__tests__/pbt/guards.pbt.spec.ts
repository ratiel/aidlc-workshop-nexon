import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { setupGuards } from '@/router/guards'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { defineComponent } from 'vue'

const Stub = defineComponent({ template: '<div />' })

function createTestRouter() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/setup', name: 'setup', component: Stub, meta: { requiresAuth: false, guestOnly: true } },
      { path: '/', name: 'menu', component: Stub, meta: { requiresAuth: true } },
      { path: '/order/confirm', name: 'orderConfirm', component: Stub, meta: { requiresAuth: true, requiresCart: true } },
      { path: '/order/success', name: 'orderSuccess', component: Stub, meta: { requiresAuth: true, requiresOrderResult: true } },
      { path: '/orders', name: 'orderHistory', component: Stub, meta: { requiresAuth: true } },
    ],
  })
  setupGuards(router)
  return router
}

describe('Router Guards PBT', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('unauthenticated user always ends up at /setup for any protected route', async () => {
    const protectedPaths = ['/', '/order/confirm', '/order/success', '/orders']

    for (const path of protectedPaths) {
      setActivePinia(createPinia())
      localStorage.clear()
      const router = createTestRouter()
      await router.push(path)
      expect(router.currentRoute.value.name).toBe('setup')
    }
  })

  it('authenticated user is redirected from /setup to menu', async () => {
    setActivePinia(createPinia())
    localStorage.clear()
    const authStore = useAuthStore()
    authStore.$patch({ status: 'authenticated', token: 'test' })

    const router = createTestRouter()
    await router.push('/setup')
    expect(router.currentRoute.value.name).toBe('menu')
  })

  it('authenticated user with varying cart quantities can reach /order/confirm only with items', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 10 }),
        async (quantity) => {
          setActivePinia(createPinia())
          localStorage.clear()
          const authStore = useAuthStore()
          authStore.$patch({ status: 'authenticated', token: 'test' })

          if (quantity > 0) {
            const cartStore = useCartStore()
            cartStore.$patch({
              items: [{ menuId: 1, name: 'Test', price: 1000, quantity, imageUrl: '' }],
            })
          }

          const router = createTestRouter()
          await router.push('/order/confirm')

          if (quantity > 0) {
            expect(router.currentRoute.value.name).toBe('orderConfirm')
          } else {
            expect(router.currentRoute.value.name).toBe('menu')
          }
        }
      )
    )
  })
})
