import { describe, it, expect, beforeEach } from 'vitest'
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

describe('Router Guards', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('redirects to /setup when not authenticated', async () => {
    const router = createTestRouter()
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('setup')
  })

  it('allows access to / when authenticated', async () => {
    const authStore = useAuthStore()
    authStore.$patch({ status: 'authenticated', token: 'test' })

    const router = createTestRouter()
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('menu')
  })

  it('redirects authenticated user from /setup to /', async () => {
    const authStore = useAuthStore()
    authStore.$patch({ status: 'authenticated', token: 'test' })

    const router = createTestRouter()
    await router.push('/setup')
    expect(router.currentRoute.value.name).toBe('menu')
  })

  it('redirects to / when cart is empty on /order/confirm', async () => {
    const authStore = useAuthStore()
    authStore.$patch({ status: 'authenticated', token: 'test' })

    const router = createTestRouter()
    await router.push('/order/confirm')
    expect(router.currentRoute.value.name).toBe('menu')
  })

  it('allows /order/confirm when cart has items', async () => {
    const authStore = useAuthStore()
    authStore.$patch({ status: 'authenticated', token: 'test' })
    const cartStore = useCartStore()
    cartStore.$patch({ items: [{ menuId: 1, name: 'Test', price: 1000, quantity: 1, imageUrl: '' }] })

    const router = createTestRouter()
    await router.push('/order/confirm')
    expect(router.currentRoute.value.name).toBe('orderConfirm')
  })

  it('redirects to / when no order result on /order/success', async () => {
    const authStore = useAuthStore()
    authStore.$patch({ status: 'authenticated', token: 'test' })

    const router = createTestRouter()
    await router.push('/order/success')
    expect(router.currentRoute.value.name).toBe('menu')
  })
})
