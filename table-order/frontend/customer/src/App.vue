<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useSSEStore } from '@/stores/sse'
import ToastNotification from '@/components/common/ToastNotification.vue'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const sseStore = useSSEStore()

onMounted(async () => {
  // Restore cart from localStorage
  cartStore.loadFromStorage()

  // Restore auth from localStorage
  authStore.loadFromStorage()

  // Connect SSE if authenticated
  if (authStore.isAuthenticated && authStore.tableId && authStore.token) {
    sseStore.connect(authStore.tableId, authStore.token)
  }
})

// Watch for session termination
watch(
  () => sseStore.connectionStatus,
  (status) => {
    // If SSE store triggered session termination, navigate to menu
    if (status === 'disconnected' && !authStore.isAuthenticated) {
      router.push('/')
    }
  }
)

// Connect SSE when auth state changes
watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth && authStore.tableId && authStore.token) {
      sseStore.connect(authStore.tableId, authStore.token)
    } else {
      sseStore.disconnect()
    }
  }
)
</script>

<template>
  <RouterView />
  <ToastNotification />
</template>
