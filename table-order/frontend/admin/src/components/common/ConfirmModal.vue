<script setup lang="ts">
interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '확인',
  cancelText: '취소',
  variant: 'default',
});

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <div v-if="props.isOpen" class="modal-overlay" data-testid="confirm-modal">
    <div class="modal-content">
      <h3 class="modal-title">{{ props.title }}</h3>
      <p class="modal-message">{{ props.message }}</p>
      <div class="modal-actions">
        <button
          class="btn btn-cancel"
          data-testid="confirm-modal-cancel"
          @click="emit('cancel')"
        >
          {{ props.cancelText }}
        </button>
        <button
          class="btn"
          :class="props.variant === 'danger' ? 'btn-danger' : 'btn-primary'"
          data-testid="confirm-modal-confirm"
          @click="emit('confirm')"
        >
          {{ props.confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
}
.modal-title {
  margin: 0 0 12px;
  font-size: 18px;
}
.modal-message {
  margin: 0 0 24px;
  color: #666;
}
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
