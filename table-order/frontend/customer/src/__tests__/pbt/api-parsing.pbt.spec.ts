import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { Order, OrderStatus } from '@/types/order'
import type { Category, MenuItem } from '@/types/menu'

/**
 * PBT: Verify that our type guards and parsing logic
 * handle arbitrary JSON structures safely without throwing.
 */

function isValidOrder(data: unknown): data is Order {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.id === 'number' &&
    typeof obj.orderNumber === 'string' &&
    typeof obj.status === 'string' &&
    ['pending', 'preparing', 'completed'].includes(obj.status as string) &&
    Array.isArray(obj.items) &&
    typeof obj.totalAmount === 'number' &&
    typeof obj.createdAt === 'string'
  )
}

function isValidCategory(data: unknown): data is Category {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  return typeof obj.id === 'number' && typeof obj.name === 'string'
}

function isValidMenuItem(data: unknown): data is MenuItem {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.price === 'number' &&
    typeof obj.description === 'string' &&
    typeof obj.imageUrl === 'string' &&
    typeof obj.categoryId === 'number'
  )
}

describe('API Parsing PBT', () => {
  it('isValidOrder never throws on arbitrary JSON', () => {
    fc.assert(
      fc.property(fc.jsonValue(), (value) => {
        // Should never throw, only return boolean
        const result = isValidOrder(value)
        expect(typeof result).toBe('boolean')
      })
    )
  })

  it('isValidOrder returns true for valid order objects', () => {
    const arbStatus = fc.constantFrom<OrderStatus>('pending', 'preparing', 'completed')
    const arbOrder = fc.record({
      id: fc.nat(),
      orderNumber: fc.string({ minLength: 1 }),
      status: arbStatus,
      items: fc.array(
        fc.record({
          menuId: fc.nat(),
          name: fc.string(),
          quantity: fc.integer({ min: 1 }),
          price: fc.nat(),
          subtotal: fc.nat(),
        })
      ),
      totalAmount: fc.nat(),
      createdAt: fc.date().map((d) => d.toISOString()),
    })

    fc.assert(
      fc.property(arbOrder, (order) => {
        expect(isValidOrder(order)).toBe(true)
      })
    )
  })

  it('isValidCategory never throws on arbitrary JSON', () => {
    fc.assert(
      fc.property(fc.jsonValue(), (value) => {
        const result = isValidCategory(value)
        expect(typeof result).toBe('boolean')
      })
    )
  })

  it('isValidMenuItem never throws on arbitrary JSON', () => {
    fc.assert(
      fc.property(fc.jsonValue(), (value) => {
        const result = isValidMenuItem(value)
        expect(typeof result).toBe('boolean')
      })
    )
  })

  it('isValidMenuItem returns true for valid menu items', () => {
    const arbMenuItem = fc.record({
      id: fc.nat(),
      name: fc.string({ minLength: 1 }),
      price: fc.nat(),
      description: fc.string(),
      imageUrl: fc.webUrl(),
      categoryId: fc.nat(),
    })

    fc.assert(
      fc.property(arbMenuItem, (item) => {
        expect(isValidMenuItem(item)).toBe(true)
      })
    )
  })
})
