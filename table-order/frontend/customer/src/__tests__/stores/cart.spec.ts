import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '@/stores/cart'
import type { MenuItem } from '@/types/menu'

const mockMenu: MenuItem = {
  id: 1,
  name: '김치찌개',
  price: 8000,
  description: '맛있는 김치찌개',
  imageUrl: 'https://example.com/kimchi.jpg',
  categoryId: 1,
}

const mockMenu2: MenuItem = {
  id: 2,
  name: '된장찌개',
  price: 7000,
  description: '구수한 된장찌개',
  imageUrl: 'https://example.com/doenjang.jpg',
  categoryId: 1,
}

describe('useCartStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('starts with empty cart', () => {
    const store = useCartStore()
    expect(store.items).toEqual([])
    expect(store.totalAmount).toBe(0)
    expect(store.totalQuantity).toBe(0)
    expect(store.isEmpty).toBe(true)
  })

  it('adds item to cart', () => {
    const store = useCartStore()
    store.addItem(mockMenu)

    expect(store.items).toHaveLength(1)
    expect(store.items[0].menuId).toBe(1)
    expect(store.items[0].quantity).toBe(1)
    expect(store.totalAmount).toBe(8000)
    expect(store.totalQuantity).toBe(1)
    expect(store.isEmpty).toBe(false)
  })

  it('increments quantity for existing item', () => {
    const store = useCartStore()
    store.addItem(mockMenu)
    store.addItem(mockMenu)

    expect(store.items).toHaveLength(1)
    expect(store.items[0].quantity).toBe(2)
    expect(store.totalAmount).toBe(16000)
  })

  it('increments item quantity', () => {
    const store = useCartStore()
    store.addItem(mockMenu)
    store.incrementItem(1)

    expect(store.items[0].quantity).toBe(2)
  })

  it('decrements item quantity', () => {
    const store = useCartStore()
    store.addItem(mockMenu)
    store.addItem(mockMenu)
    store.decrementItem(1)

    expect(store.items[0].quantity).toBe(1)
  })

  it('removes item when decrement reaches 0', () => {
    const store = useCartStore()
    store.addItem(mockMenu)
    store.decrementItem(1)

    expect(store.items).toHaveLength(0)
    expect(store.isEmpty).toBe(true)
  })

  it('removes specific item', () => {
    const store = useCartStore()
    store.addItem(mockMenu)
    store.addItem(mockMenu2)
    store.removeItem(1)

    expect(store.items).toHaveLength(1)
    expect(store.items[0].menuId).toBe(2)
  })

  it('clears all items', () => {
    const store = useCartStore()
    store.addItem(mockMenu)
    store.addItem(mockMenu2)
    store.clearCart()

    expect(store.items).toHaveLength(0)
    expect(store.totalAmount).toBe(0)
  })

  it('calculates total correctly with multiple items', () => {
    const store = useCartStore()
    store.addItem(mockMenu)   // 8000 x 1
    store.addItem(mockMenu2)  // 7000 x 1
    store.incrementItem(1)    // 8000 x 2

    expect(store.totalAmount).toBe(8000 * 2 + 7000)
    expect(store.totalQuantity).toBe(3)
  })

  it('persists to localStorage', () => {
    const store = useCartStore()
    store.addItem(mockMenu)

    const stored = JSON.parse(localStorage.getItem('cart_items')!)
    expect(stored).toHaveLength(1)
    expect(stored[0].menuId).toBe(1)
  })

  it('loads from localStorage', () => {
    localStorage.setItem('cart_items', JSON.stringify([
      { menuId: 1, name: '김치찌개', price: 8000, quantity: 3, imageUrl: 'url' },
    ]))

    const store = useCartStore()
    store.loadFromStorage()

    expect(store.items).toHaveLength(1)
    expect(store.items[0].quantity).toBe(3)
    expect(store.totalAmount).toBe(24000)
  })
})
