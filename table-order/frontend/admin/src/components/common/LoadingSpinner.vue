<script setup lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large';
}

withDefaults(defineProps<Props>(), { size: 'medium' });
</script>

<template>
  <div class="spinner-container" data-testid="loading-spinner">
    <div class="spinner" :class="`spinner-${size}`"></div>
  </div>
</template>

<style scoped>
.spinner-container { display: flex; align-items: center; justify-content: center; padding: 20px; }
.spinner {
  border: 3px solid #e0e0e0;
  border-top-color: #1976d2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.spinner-small { width: 20px; height: 20px; }
.spinner-medium { width: 36px; height: 36px; }
.spinner-large { width: 48px; height: 48px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
