<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('일시적 오류가 발생했습니다.')

onErrorCaptured((error) => {
  hasError.value = true
  console.error('[ErrorBoundary]', error)
  return false
})

function retry() {
  hasError.value = false
}
</script>

<template>
  <div v-if="hasError" class="flex flex-col items-center justify-center gap-4 p-8" data-testid="error-boundary">
    <p class="text-gray-600 text-lg">{{ errorMessage }}</p>
    <button
      class="min-h-touch rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      @click="retry"
    >
      다시 시도
    </button>
  </div>
  <slot v-else />
</template>
