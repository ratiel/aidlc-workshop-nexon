<script setup lang="ts">
import type { Category } from '@/types/menu'

defineProps<{
  categories: Category[]
  selectedId: number | null
}>()

const emit = defineEmits<{
  select: [categoryId: number]
}>()
</script>

<template>
  <div
    class="sticky top-14 z-20 flex gap-2 overflow-x-auto bg-white px-4 py-3 border-b scrollbar-hide"
    role="tablist"
    aria-label="메뉴 카테고리"
    data-testid="category-tabs"
  >
    <button
      v-for="category in categories"
      :key="category.id"
      role="tab"
      :aria-selected="category.id === selectedId"
      class="min-h-touch whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      :class="category.id === selectedId
        ? 'bg-blue-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
      :data-testid="`category-tab-${category.id}`"
      @click="emit('select', category.id)"
    >
      {{ category.name }}
    </button>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
