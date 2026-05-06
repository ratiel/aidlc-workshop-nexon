<script setup lang="ts">
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { CartItem } from '@/types/cart'
import { formatCurrency } from '@/utils/format'

defineProps<{
  item: CartItem
}>()

const emit = defineEmits<{
  increment: [menuId: number]
  decrement: [menuId: number]
  remove: [menuId: number]
}>()
</script>

<template>
  <div
    class="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
    data-testid="cart-item"
  >
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</p>
      <p class="text-sm text-gray-500">{{ formatCurrency(item.price) }}</p>
    </div>

    <div class="flex items-center gap-2">
      <button
        class="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        :aria-label="`${item.name} 수량 감소`"
        data-testid="cart-item-decrement"
        @click="emit('decrement', item.menuId)"
      >
        <MinusIcon class="h-4 w-4" />
      </button>

      <span
        class="w-8 text-center text-sm font-semibold"
        :aria-label="`수량 ${item.quantity}`"
      >
        {{ item.quantity }}
      </span>

      <button
        class="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        :aria-label="`${item.name} 수량 증가`"
        data-testid="cart-item-increment"
        @click="emit('increment', item.menuId)"
      >
        <PlusIcon class="h-4 w-4" />
      </button>

      <button
        class="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
        :aria-label="`${item.name} 삭제`"
        data-testid="cart-item-remove"
        @click="emit('remove', item.menuId)"
      >
        <TrashIcon class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
