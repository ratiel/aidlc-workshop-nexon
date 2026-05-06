import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '@/stores/cart'
import type { MenuItem } from '@/types/menu'

function makeMenuItem(id: number, price: number): MenuItem {
  return {
    id,
    name: `Menu ${id}`,
    price,
    description: 'desc',
    imageUrl: 'https://example.com/img.jpg',
    categoryId: 1,
  }
}

describe('Cart Store PBT', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('totalAmount equals sum of price * quantity for all items', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 100 }),
            price: fc.integer({ min: 1, max: 100000 }),
            addCount: fc.integer({ min: 1, max: 10 }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (menuActions) => {
          setActivePinia(createPinia())
          localStorage.clear()
          const store = useCartStore()

          // Deduplicate by id
          const uniqueMenus = new Map<number, { price: number; addCount: number }>()
          for (const action of menuActions) {
            uniqueMenus.set(action.id, { price: action.price, addCount: action.addCount })
          }

          for (const [id, { price, addCount }] of uniqueMenus) {
            const menu = makeMenuItem(id, price)
            for (let i = 0; i < addCount; i++) {
              store.addItem(menu)
            }
          }

          const expectedTotal = Array.from(uniqueMenus.entries()).reduce(
            (sum, [_, { price, addCount }]) => sum + price * addCount,
            0
          )

          expect(store.totalAmount).toBe(expectedTotal)
        }
      )
    )
  })

  it('totalQuantity equals sum of all quantities', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 50 }),
            addCount: fc.integer({ min: 1, max: 5 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (actions) => {
          setActivePinia(createPinia())
          localStorage.clear()
          const store = useCartStore()

          const quantities = new Map<number, number>()
          for (const { id, addCount } of actions) {
            const menu = makeMenuItem(id, 1000)
            for (let i = 0; i < addCount; i++) {
              store.addItem(menu)
            }
            quantities.set(id, (quantities.get(id) || 0) + addCount)
          }

          const expectedQuantity = Array.from(quantities.values()).reduce((a, b) => a + b, 0)
          expect(store.totalQuantity).toBe(expectedQuantity)
        }
      )
    )
  })

  it('clearCart always results in empty state', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 0, maxLength: 20 }),
        (menuIds) => {
          setActivePinia(createPinia())
          localStorage.clear()
          const store = useCartStore()

          for (const id of menuIds) {
            store.addItem(makeMenuItem(id, 5000))
          }

          store.clearCart()
          expect(store.items).toHaveLength(0)
          expect(store.totalAmount).toBe(0)
          expect(store.totalQuantity).toBe(0)
          expect(store.isEmpty).toBe(true)
        }
      )
    )
  })

  it('totalAmount is never negative', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 20 }),
            price: fc.integer({ min: 0, max: 100000 }),
          }),
          { minLength: 0, maxLength: 15 }
        ),
        (items) => {
          setActivePinia(createPinia())
          localStorage.clear()
          const store = useCartStore()

          for (const { id, price } of items) {
            store.addItem(makeMenuItem(id, price))
          }

          expect(store.totalAmount).toBeGreaterThanOrEqual(0)
        }
      )
    )
  })
})
