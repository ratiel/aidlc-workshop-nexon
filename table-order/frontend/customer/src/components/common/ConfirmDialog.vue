<script setup lang="ts">
defineProps<{
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        data-testid="confirm-dialog"
        @click.self="emit('cancel')"
      >
        <Transition name="scale">
          <div
            v-if="isOpen"
            class="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 class="text-lg font-bold text-gray-900">{{ title }}</h2>
            <p class="mt-2 text-gray-600">{{ message }}</p>
            <div class="mt-6 flex gap-3">
              <button
                class="min-h-touch flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
                data-testid="confirm-dialog-cancel"
                @click="emit('cancel')"
              >
                {{ cancelText || '취소' }}
              </button>
              <button
                class="min-h-touch flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                data-testid="confirm-dialog-confirm"
                @click="emit('confirm')"
              >
                {{ confirmText || '확인' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
