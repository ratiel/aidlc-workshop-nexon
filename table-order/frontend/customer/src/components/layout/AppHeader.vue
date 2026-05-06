<script setup lang="ts">
import { Bars3Icon } from '@heroicons/vue/24/outline'

defineProps<{
  tableNumber: number | null
}>()

const emit = defineEmits<{
  'toggle-drawer': []
}>()
</script>

<template>
  <header class="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-4 shadow-sm">
    <button
      class="min-w-touch min-h-touch flex items-center justify-center rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      aria-label="메뉴 열기"
      data-testid="header-menu-button"
      @click="emit('toggle-drawer')"
    >
      <Bars3Icon class="h-6 w-6 text-gray-700" />
    </button>

    <h1 class="text-lg font-bold text-gray-900">
      테이블 {{ tableNumber ?? '-' }}
    </h1>

    <div class="w-11" />
  </header>
</template>
