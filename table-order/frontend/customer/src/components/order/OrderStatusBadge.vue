<script setup lang="ts">
import { computed } from 'vue'
import type { OrderStatus } from '@/types/order'

const props = defineProps<{
  status: OrderStatus
}>()

const statusConfig = computed(() => {
  switch (props.status) {
    case 'pending':
      return { text: '대기중', classes: 'bg-status-pending/20 text-yellow-800' }
    case 'preparing':
      return { text: '준비중', classes: 'bg-status-preparing/20 text-blue-800' }
    case 'completed':
      return { text: '완료', classes: 'bg-status-completed/20 text-green-800' }
  }
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
    :class="statusConfig.classes"
    :aria-label="`주문 상태: ${statusConfig.text}`"
    data-testid="order-status-badge"
  >
    {{ statusConfig.text }}
  </span>
</template>
