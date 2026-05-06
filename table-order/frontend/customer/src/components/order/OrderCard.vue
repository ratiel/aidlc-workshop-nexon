<script setup lang="ts">
import type { Order } from '@/types/order'
import { formatCurrency, formatTime } from '@/utils/format'
import OrderStatusBadge from './OrderStatusBadge.vue'

defineProps<{
  order: Order
}>()
</script>

<template>
  <div
    class="rounded-xl bg-white p-4 shadow-sm"
    data-testid="order-card"
  >
    <div class="flex items-center justify-between">
      <div>
        <span class="text-sm font-bold text-gray-900">{{ order.orderNumber }}</span>
        <span class="ml-2 text-xs text-gray-500">{{ formatTime(order.createdAt) }}</span>
      </div>
      <OrderStatusBadge :status="order.status" />
    </div>

    <ul class="mt-3 space-y-1">
      <li
        v-for="item in order.items"
        :key="item.menuId"
        class="flex justify-between text-sm"
      >
        <span class="text-gray-700">{{ item.name }} × {{ item.quantity }}</span>
        <span class="text-gray-500">{{ formatCurrency(item.subtotal) }}</span>
      </li>
    </ul>

    <div class="mt-3 flex justify-end border-t pt-2">
      <span class="font-bold text-gray-900">{{ formatCurrency(order.totalAmount) }}</span>
    </div>
  </div>
</template>
