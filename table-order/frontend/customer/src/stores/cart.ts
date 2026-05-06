import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem } from '@/types/cart'
import type { MenuItem } from '@/types/menu'
import { storageService, STORAGE_KEYS } from '@/services/storageService'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalAmount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const totalQuantity = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const isEmpty = computed(() => items.value.length === 0)

  function addItem(menu: MenuItem): void {
    const existing = items.value.find((i) => i.menuId === menu.id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({
        menuId: menu.id,
        name: menu.name,
        price: menu.price,
        quantity: 1,
        imageUrl: menu.imageUrl,
      })
    }
    saveToStorage()
  }

  function incrementItem(menuId: number): void {
    const item = items.value.find((i) => i.menuId === menuId)
    if (item) {
      item.quantity++
      saveToStorage()
    }
  }

  function decrementItem(menuId: number): void {
    const item = items.value.find((i) => i.menuId === menuId)
    if (!item) return

    if (item.quantity <= 1) {
      removeItem(menuId)
    } else {
      item.quantity--
      saveToStorage()
    }
  }

  function removeItem(menuId: number): void {
    items.value = items.value.filter((i) => i.menuId !== menuId)
    saveToStorage()
  }

  function clearCart(): void {
    items.value = []
    saveToStorage()
  }

  function loadFromStorage(): void {
    const stored = storageService.get<CartItem[]>(STORAGE_KEYS.CART_ITEMS)
    if (stored && Array.isArray(stored)) {
      items.value = stored
    }
  }

  function saveToStorage(): void {
    storageService.set(STORAGE_KEYS.CART_ITEMS, items.value)
  }

  return {
    items,
    totalAmount,
    totalQuantity,
    isEmpty,
    addItem,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    loadFromStorage,
    saveToStorage,
  }
})
