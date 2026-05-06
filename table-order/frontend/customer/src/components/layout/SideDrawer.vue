<script setup lang="ts">
import { HomeIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'
import { formatCurrency } from '@/utils/format'

defineProps<{
  isOpen: boolean
  tableNumber: number | null
  cartTotalQuantity: number
  cartTotalAmount: number
}>()

const emit = defineEmits<{
  close: []
  navigate: [path: string]
}>()

function handleNavigate(path: string) {
  emit('navigate', path)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-black/50"
        data-testid="drawer-backdrop"
        @click="emit('close')"
      />
    </Transition>

    <Transition name="slide-right">
      <nav
        v-if="isOpen"
        class="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl"
        role="navigation"
        aria-label="메인 네비게이션"
        data-testid="side-drawer"
      >
        <div class="flex h-14 items-center border-b px-4">
          <span class="text-lg font-bold text-gray-900">
            테이블 {{ tableNumber ?? '-' }}
          </span>
        </div>

        <ul class="mt-2 space-y-1 px-2">
          <li>
            <button
              class="min-h-touch flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              data-testid="drawer-menu-link"
              @click="handleNavigate('/')"
            >
              <HomeIcon class="h-5 w-5" />
              <span>메뉴</span>
            </button>
          </li>
          <li>
            <button
              class="min-h-touch flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              data-testid="drawer-orders-link"
              @click="handleNavigate('/orders')"
            >
              <ClipboardDocumentListIcon class="h-5 w-5" />
              <span>주문 내역</span>
            </button>
          </li>
        </ul>

        <div v-if="cartTotalQuantity > 0" class="absolute bottom-0 left-0 right-0 border-t bg-gray-50 px-4 py-3">
          <p class="text-sm text-gray-600">
            장바구니: {{ cartTotalQuantity }}개 · {{ formatCurrency(cartTotalAmount) }}
          </p>
        </div>
      </nav>
    </Transition>
  </Teleport>
</template>

<style scoped>
.slide-right-enter-active { transition: transform 0.25s cubic-bezier(0, 0, 0.2, 1); }
.slide-right-leave-active { transition: transform 0.2s cubic-bezier(0.4, 0, 1, 1); }
.slide-right-enter-from,
.slide-right-leave-to { transform: translateX(-100%); }
</style>
