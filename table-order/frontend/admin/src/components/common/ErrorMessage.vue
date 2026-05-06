<script setup lang="ts">
interface Props {
  message: string;
  retryable?: boolean;
}

withDefaults(defineProps<Props>(), { retryable: false });
const emit = defineEmits<{ (e: 'retry'): void }>();
</script>

<template>
  <div class="error-container" data-testid="error-message">
    <p class="error-text">{{ message }}</p>
    <button
      v-if="retryable"
      class="btn btn-primary"
      data-testid="error-retry-button"
      @click="emit('retry')"
    >
      다시 시도
    </button>
  </div>
</template>

<style scoped>
.error-container { text-align: center; padding: 24px; }
.error-text { color: #f44336; margin-bottom: 12px; }
</style>
