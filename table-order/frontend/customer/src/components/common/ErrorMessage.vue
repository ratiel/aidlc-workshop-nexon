<script setup lang="ts">
defineProps<{
  message: string
  retryable?: boolean
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-4 p-6 text-center"
    role="alert"
    data-testid="error-message"
  >
    <p class="text-gray-600 text-lg">{{ message }}</p>
    <button
      v-if="retryable"
      class="min-w-touch min-h-touch rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      data-testid="error-retry-button"
      @click="emit('retry')"
    >
      다시 시도
    </button>
  </div>
</template>
