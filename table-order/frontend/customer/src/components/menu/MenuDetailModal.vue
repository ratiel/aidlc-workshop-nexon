<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { PlusIcon } from '@heroicons/vue/24/solid'
import type { MenuItem } from '@/types/menu'
import { formatCurrency } from '@/utils/format'

defineProps<{
  menu: MenuItem | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  'add-to-cart': [menu: MenuItem]
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen && menu"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
        data-testid="menu-detail-modal"
        @click.self="emit('close')"
      >
        <Transition name="scale">
          <div
            v-if="isOpen && menu"
            class="w-full max-w-md rounded-t-2xl bg-white sm:rounded-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            :aria-label="`${menu.name} 상세 정보`"
          >
            <div class="relative aspect-[16/9] bg-gray-100">
              <img
                :src="menu.imageUrl"
                :alt="menu.name"
                class="h-full w-full object-cover"
              />
              <button
                class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="닫기"
                data-testid="menu-detail-close"
                @click="emit('close')"
              >
                <XMarkIcon class="h-5 w-5 text-gray-700" />
              </button>
            </div>

            <div class="p-5">
              <h2 class="text-xl font-bold text-gray-900">{{ menu.name }}</h2>
              <p class="mt-1 text-2xl font-bold text-blue-600">{{ formatCurrency(menu.price) }}</p>
              <p class="mt-3 text-gray-600 leading-relaxed">{{ menu.description }}</p>

              <button
                class="mt-6 min-h-touch w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-lg font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors active:scale-[0.98]"
                data-testid="menu-detail-add-button"
                @click="emit('add-to-cart', menu)"
              >
                <PlusIcon class="h-5 w-5" />
                장바구니에 추가
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
