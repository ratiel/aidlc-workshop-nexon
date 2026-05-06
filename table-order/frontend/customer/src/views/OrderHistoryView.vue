<script setup lang="ts">
import { onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import AppLayout from '@/components/layout/AppLayout.vue'
import OrderCard from '@/components/order/OrderCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const orderStore = useOrderStore()

onMounted(() => {
  orderStore.fetchOrders()
})
</script>

<template>
  <AppLayout>
    <div class="mx-auto max-w-lg p-4">
      <h1 class="text-xl font-bold text-gray-900">주문 내역</h1>

      <div v-if="orderStore.isLoading" class="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <ErrorMessage
        v-else-if="orderStore.error"
        :message="orderStore.error"
        :retryable="true"
        @retry="orderStore.fetchOrders()"
      />

      <EmptyState
        v-else-if="orderStore.orders.length === 0"
        message="주문 내역이 없습니다"
      />

      <div v-else class="mt-4 space-y-3">
        <OrderCard
          v-for="order in orderStore.orders"
          :key="order.id"
          :order="order"
        />
      </div>
    </div>
  </AppLayout>
</template>
