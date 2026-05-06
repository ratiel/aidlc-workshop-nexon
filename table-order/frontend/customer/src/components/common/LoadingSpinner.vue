<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div
    class="flex items-center justify-center"
    role="status"
    aria-label="로딩 중"
    data-testid="loading-spinner"
  >
    <div
      class="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
      :class="{
        'h-5 w-5': size === 'sm',
        'h-8 w-8': size === 'md' || !size,
        'h-12 w-12': size === 'lg',
      }"
    />
    <span class="sr-only">로딩 중</span>
  </div>
</template>
