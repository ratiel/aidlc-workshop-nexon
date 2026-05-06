<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'

const router = useRouter()
const orderStore = useOrderStore()

const countdown = ref(5)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (!orderStore.lastOrderResult) {
    router.replace('/')
    return
  }

  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer!)
      router.replace('/orders')
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-sm text-center" data-testid="order-success">
      <CheckCircleIcon class="mx-auto h-20 w-20 text-green-500" />

      <h1 class="mt-4 text-2xl font-bold text-gray-900">주문이 접수되었습니다</h1>

      <p class="mt-2 text-4xl font-bold text-blue-600">
        {{ orderStore.lastOrderResult?.orderNumber }}
      </p>

      <p class="mt-6 text-sm text-gray-500">
        {{ countdown }}초 후 주문 내역으로 이동합니다
      </p>

      <button
        class="mt-4 min-h-touch rounded-lg px-6 py-3 text-blue-600 font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        data-testid="order-success-go-orders"
        @click="router.push('/orders')"
      >
        바로 이동
      </button>
    </div>
  </div>
</template>
