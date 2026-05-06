<script setup lang="ts">
import { formatCurrency } from '@/utils/format'

defineProps<{
  totalAmount: number
  totalQuantity: number
}>()
</script>

<template>
  <div class="flex items-center justify-between" data-testid="cart-summary">
    <span class="text-sm text-gray-600">{{ totalQuantity }}개 항목</span>
    <span class="text-lg font-bold text-gray-900">{{ formatCurrency(totalAmount) }}</span>
  </div>
</template>
