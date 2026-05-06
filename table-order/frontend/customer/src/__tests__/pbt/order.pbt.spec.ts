import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { setActivePinia, createPinia } from 'pinia'
import { useOrderStore } from '@/stores/order'
import type { Order, OrderStatus } from '@/types/order'

const validStatuses: OrderStatus[] = ['pending', 'preparing', 'completed']

function makeOrder(id: number, status: OrderStatus): Order {
  return {
    id,
    orderNumber: `ORD-${id.toString().padStart(3, '0')}`,
    status,
    items: [],
    totalAmount: 10000,
    createdAt: '2026-01-01T00:00:00Z',
  }
}

describe('Order Store PBT', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('updateOrderStatus always results in a valid status', () => {
    const arbStatus = fc.constantFrom<OrderStatus>('pending', 'preparing', 'completed')

    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        arbStatus,
        arbStatus,
        (orderId, initialStatus, newStatus) => {
          setActivePinia(createPinia())
          const store = useOrderStore()
          store.orders = [makeOrder(orderId, initialStatus)]

          store.updateOrderStatus(orderId, newStatus)

          expect(validStatuses).toContain(store.orders[0].status)
          expect(store.orders[0].status).toBe(newStatus)
        }
      )
    )
  })

  it('removeOrder reduces order count by exactly 1', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 1, maxLength: 20 }),
        (orderIds) => {
          setActivePinia(createPinia())
          const store = useOrderStore()
          const uniqueIds = [...new Set(orderIds)]
          store.orders = uniqueIds.map((id) => makeOrder(id, 'pending'))

          const initialCount = store.orders.length
          const idToRemove = uniqueIds[0]
          store.removeOrder(idToRemove)

          expect(store.orders.length).toBe(initialCount - 1)
          expect(store.orders.find((o) => o.id === idToRemove)).toBeUndefined()
        }
      )
    )
  })

  it('clearOrders always results in empty state', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 0, maxLength: 10 }),
        (orderIds) => {
          setActivePinia(createPinia())
          const store = useOrderStore()
          store.orders = orderIds.map((id) => makeOrder(id, 'pending'))

          store.clearOrders()

          expect(store.orders).toHaveLength(0)
          expect(store.lastOrderResult).toBeNull()
        }
      )
    )
  })
})
