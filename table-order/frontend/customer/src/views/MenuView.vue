<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { useCartStore } from '@/stores/cart'
import { toastService } from '@/services/toastService'
import type { MenuItem } from '@/types/menu'
import AppLayout from '@/components/layout/AppLayout.vue'
import CategoryTabs from '@/components/menu/CategoryTabs.vue'
import MenuCard from '@/components/menu/MenuCard.vue'
import MenuDetailModal from '@/components/menu/MenuDetailModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const menuStore = useMenuStore()
const cartStore = useCartStore()

const selectedCategoryId = ref<number | null>(null)
const selectedMenu = ref<MenuItem | null>(null)
const isDetailOpen = ref(false)

onMounted(async () => {
  await menuStore.fetchMenu()
  if (menuStore.categories.length > 0) {
    selectedCategoryId.value = menuStore.categories[0].id
  }
})

function handleCategorySelect(categoryId: number) {
  selectedCategoryId.value = categoryId
}

function handleMenuTap(menu: MenuItem) {
  selectedMenu.value = menu
  isDetailOpen.value = true
}

function handleAddToCart(menu: MenuItem) {
  cartStore.addItem(menu)
  toastService.success(`${menu.name} 추가됨`)
  isDetailOpen.value = false
}
</script>

<template>
  <AppLayout>
    <div v-if="menuStore.isLoading" class="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>

    <ErrorMessage
      v-else-if="menuStore.error"
      :message="menuStore.error"
      :retryable="true"
      @retry="menuStore.fetchMenu()"
    />

    <template v-else>
      <CategoryTabs
        :categories="menuStore.categories"
        :selected-id="selectedCategoryId"
        @select="handleCategorySelect"
      />

      <div class="p-4">
        <div
          v-if="selectedCategoryId && menuStore.getMenusByCategory(selectedCategoryId).length > 0"
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          <MenuCard
            v-for="menu in menuStore.getMenusByCategory(selectedCategoryId)"
            :key="menu.id"
            :menu="menu"
            @tap="handleMenuTap"
            @add-to-cart="handleAddToCart"
          />
        </div>

        <EmptyState
          v-else
          message="메뉴가 없습니다"
        />
      </div>
    </template>

    <MenuDetailModal
      :menu="selectedMenu"
      :is-open="isDetailOpen"
      @close="isDetailOpen = false"
      @add-to-cart="handleAddToCart"
    />
  </AppLayout>
</template>
