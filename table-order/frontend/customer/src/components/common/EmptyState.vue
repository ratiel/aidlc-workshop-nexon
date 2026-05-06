<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-2 p-8 text-center"
    data-testid="empty-state"
  >
    <p class="text-gray-400 text-lg">{{ message }}</p>
  </div>
</template>
