import { ref } from 'vue'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  duration: number
  createdAt: number
}

const MAX_TOASTS = 3
const DEFAULT_DURATION = 3000

export const toasts = ref<Toast[]>([])

let idCounter = 0

function generateId(): string {
  return `toast-${++idCounter}-${Date.now()}`
}

function addToast(type: Toast['type'], message: string, duration = DEFAULT_DURATION): void {
  const toast: Toast = {
    id: generateId(),
    type,
    message,
    duration,
    createdAt: Date.now(),
  }

  toasts.value.push(toast)

  if (toasts.value.length > MAX_TOASTS) {
    toasts.value.shift()
  }

  setTimeout(() => {
    dismiss(toast.id)
  }, duration)
}

function dismiss(id: string): void {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

export const toastService = {
  success(message: string, duration?: number): void {
    addToast('success', message, duration)
  },

  error(message: string, duration?: number): void {
    addToast('error', message, duration)
  },

  info(message: string, duration?: number): void {
    addToast('info', message, duration)
  },

  dismiss,
}
