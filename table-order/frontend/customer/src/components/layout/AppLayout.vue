<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import AppHeader from './AppHeader.vue'
import SideDrawer from './SideDrawer.vue'
import CartBottomSheet from './CartBottomSheet.vue'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const isDrawerOpen = ref(false)

function handleNavigate(path: string) {
  router.push(path)
}

function handleCheckout() {
  router.push('/order/confirm')
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <AppHeader
      :table-number="authStore.tableNumber"
      @toggle-drawer="isDrawerOpen = !isDrawerOpen"
    />

    <SideDrawer
      :is-open="isDrawerOpen"
      :table-number="authStore.tableNumber"
      :cart-total-quantity="cartStore.totalQuantity"
      :cart-total-amount="cartStore.totalAmount"
      @close="isDrawerOpen = false"
      @navigate="handleNavigate"
    />

    <main class="flex-1 pb-20">
      <slot />
    </main>

    <CartBottomSheet @checkout="handleCheckout" />
  </div>
</template>
