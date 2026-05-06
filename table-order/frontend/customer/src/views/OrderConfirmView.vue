<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import { formatCurrency } from '@/utils/format'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()

const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleConfirm() {
  if (isSubmitting.value) return

  isSubmitting.value = true
  errorMessage.value = ''

  const success = await orderStore.createOrder()

  isSubmitting.value = false

  if (success) {
    router.push('/order/success')
  } else {
    errorMessage.value = orderStore.error || '주문에 실패했습니다. 다시 시도해 주세요.'
  }
}

function handleBack() {
  router.back()
}
</script>

<template>
  <AppLayout>
    <div class="mx-auto max-w-lg p-4">
      <h1 class="text-xl font-bold text-gray-900">주문 확인</h1>

      <div class="mt-4 space-y-3">
        <div
          v-for="item in cartStore.items"
          :key="item.menuId"
          class="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
          data-testid="order-confirm-item"
        >
          <div>
            <p class="font-medium text-gray-900">{{ item.name }}</p>
            <p class="text-sm text-gray-500">{{ formatCurrency(item.price) }} × {{ item.quantity }}</p>
          </div>
          <p class="font-semibold text-gray-900">{{ formatCurrency(item.price * item.quantity) }}</p>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-between border-t pt-4">
        <span class="text-lg font-medium text-gray-700">총 주문 금액</span>
        <span class="text-2xl font-bold text-blue-600">{{ formatCurrency(cartStore.totalAmount) }}</span>
      </div>

      <div v-if="errorMessage" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert" data-testid="order-confirm-error">
        {{ errorMessage }}
      </div>

      <div class="mt-6 flex gap-3">
        <button
          class="min-h-touch flex-1 rounded-xl border border-gray-300 py-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
          data-testid="order-confirm-back"
          @click="handleBack"
        >
          돌아가기
        </button>
        <button
          class="min-h-touch flex-1 rounded-xl bg-blue-600 py-4 font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          :disabled="isSubmitting"
          data-testid="order-confirm-submit"
          @click="handleConfirm"
        >
          <LoadingSpinner v-if="isSubmitting" size="sm" />
          <span v-else>주문 확정</span>
        </button>
      </div>
    </div>
  </AppLayout>
</template>
