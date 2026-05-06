<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/solid'
import type { MenuItem } from '@/types/menu'
import { formatCurrency } from '@/utils/format'
import { vLazyImage } from '@/directives/lazyImage'

defineProps<{
  menu: MenuItem
}>()

const emit = defineEmits<{
  tap: [menu: MenuItem]
  'add-to-cart': [menu: MenuItem]
}>()
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    data-testid="menu-card"
    @click="emit('tap', menu)"
  >
    <div class="aspect-[4/3] overflow-hidden bg-gray-100">
      <img
        v-lazy-image="menu.imageUrl"
        :alt="menu.name"
        class="h-full w-full object-cover"
      />
    </div>

    <div class="p-3">
      <h3 class="text-sm font-semibold text-gray-900 line-clamp-1">{{ menu.name }}</h3>
      <p class="mt-1 text-base font-bold text-blue-600">{{ formatCurrency(menu.price) }}</p>
    </div>

    <button
      class="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all active:scale-90"
      :aria-label="`${menu.name} 장바구니에 추가`"
      data-testid="menu-card-add-button"
      @click.stop="emit('add-to-cart', menu)"
    >
      <PlusIcon class="h-5 w-5" />
    </button>
  </div>
</template>
