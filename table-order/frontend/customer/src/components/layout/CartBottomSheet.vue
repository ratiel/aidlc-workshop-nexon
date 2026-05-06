<script setup lang="ts">
import { ref } from 'vue'
import { ShoppingCartIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import { useCartStore } from '@/stores/cart'
import { formatCurrency } from '@/utils/format'
import CartItem from '@/components/cart/CartItem.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const cartStore = useCartStore()
const isExpanded = ref(false)
const showClearConfirm = ref(false)

const emit = defineEmits<{
  checkout: []
}>()

function toggle() {
  isExpanded.value = !isExpanded.value
}

function handleClearConfirm() {
  cartStore.clearCart()
  showClearConfirm.value = false
  isExpanded.value = false
}
</script>

<template>
  <div
    v-if="!cartStore.isEmpty"
    class="fixed bottom-0 left-0 right-0 z-30 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] rounded-t-2xl transition-all duration-250"
    :class="isExpanded ? 'max-h-[70vh]' : 'max-h-16'"
    data-testid="cart-bottom-sheet"
  >
    <!-- Collapsed bar -->
    <button
      class="flex w-full items-center justify-between px-4 py-4 min-h-touch"
      data-testid="cart-toggle-button"
      :aria-expanded="isExpanded"
      aria-controls="cart-content"
      @click="toggle"
    >
      <div class="flex items-center gap-2">
        <ShoppingCartIcon class="h-5 w-5 text-blue-600" />
        <span class="font-medium text-gray-900">
          {{ cartStore.totalQuantity }}개 · {{ formatCurrency(cartStore.totalAmount) }}
        </span>
      </div>
      <component :is="isExpanded ? ChevronDownIcon : ChevronUpIcon" class="h-5 w-5 text-gray-500" />
    </button>

    <!-- Expanded content -->
    <div
      v-show="isExpanded"
      id="cart-content"
      class="overflow-y-auto px-4 pb-4"
      style="max-height: calc(70vh - 64px)"
    >
      <div class="space-y-2">
        <CartItem
          v-for="item in cartStore.items"
          :key="item.menuId"
          :item="item"
          @increment="cartStore.incrementItem(item.menuId)"
          @decrement="cartStore.decrementItem(item.menuId)"
          @remove="cartStore.removeItem(item.menuId)"
        />
      </div>

      <div class="mt-4 flex items-center justify-between border-t pt-4">
        <button
          class="min-h-touch rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          data-testid="cart-clear-button"
          @click="showClearConfirm = true"
        >
          전체 비우기
        </button>
        <div class="text-right">
          <p class="text-sm text-gray-500">총 금액</p>
          <p class="text-xl font-bold text-gray-900">{{ formatCurrency(cartStore.totalAmount) }}</p>
        </div>
      </div>

      <button
        class="mt-4 min-h-touch w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        :disabled="cartStore.isEmpty"
        data-testid="cart-checkout-button"
        @click="emit('checkout')"
      >
        주문하기
      </button>
    </div>
  </div>

  <ConfirmDialog
    :is-open="showClearConfirm"
    title="장바구니 비우기"
    message="장바구니를 비우시겠습니까?"
    confirm-text="비우기"
    cancel-text="취소"
    @confirm="handleClearConfirm"
    @cancel="showClearConfirm = false"
  />
</template>
