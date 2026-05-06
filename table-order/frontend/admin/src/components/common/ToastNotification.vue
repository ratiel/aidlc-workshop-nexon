<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
});

const isVisible = ref(false);

watch(() => props.message, (newMsg) => {
  if (newMsg) {
    isVisible.value = true;
    setTimeout(() => {
      isVisible.value = false;
    }, props.duration);
  }
});
</script>

<template>
  <Transition name="toast">
    <div
      v-if="isVisible"
      class="toast"
      :class="`toast-${props.type}`"
      data-testid="toast-notification"
    >
      {{ props.message }}
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.toast-success { background: #4caf50; }
.toast-error { background: #f44336; }
.toast-info { background: #2196f3; }
.toast-enter-active, .toast-leave-active { transition: opacity 0.3s, transform 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
