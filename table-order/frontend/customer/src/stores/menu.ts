import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Category, MenuItem } from '@/types/menu'
import { menuService } from '@/services/menuService'

export const useMenuStore = defineStore('menu', () => {
  const categories = ref<Category[]>([])
  const menuItems = ref<MenuItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getMenusByCategory = computed(() => {
    return (categoryId: number): MenuItem[] => {
      return menuItems.value.filter((item) => item.categoryId === categoryId)
    }
  })

  async function fetchMenu(): Promise<void> {
    isLoading.value = true
    error.value = null

    const result = await menuService.fetchMenu()

    if (result.success) {
      categories.value = result.data.categories
      menuItems.value = result.data.items
    } else {
      error.value = result.error.message
    }

    isLoading.value = false
  }

  return {
    categories,
    menuItems,
    isLoading,
    error,
    getMenusByCategory,
    fetchMenu,
  }
})
