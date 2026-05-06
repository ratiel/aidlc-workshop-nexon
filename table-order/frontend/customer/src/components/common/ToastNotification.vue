<script setup lang="ts">
import { toasts, toastService } from '@/services/toastService'
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      aria-live="polite"
      aria-atomic="true"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="min-w-[280px] max-w-sm rounded-lg px-4 py-3 shadow-lg text-white font-medium"
          :class="{
            'bg-green-600': toast.type === 'success',
            'bg-red-600': toast.type === 'error',
            'bg-blue-600': toast.type === 'info',
          }"
          role="alert"
          data-testid="toast-notification"
        >
          <div class="flex items-center justify-between gap-2">
            <span>{{ toast.message }}</span>
            <button
              class="ml-2 text-white/80 hover:text-white min-w-[24px] min-h-[24px]"
              aria-label="닫기"
              @click="toastService.dismiss(toast.id)"
            >
              ✕
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
}
.toast-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
