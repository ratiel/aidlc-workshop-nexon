import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useOrderStore } from '@/stores/order'
import type { Order } from '@/types/order'

describe('useOrderStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with empty orders', () => {
    const store = useOrderStore()
    expect(store.orders).toEqual([])
    expect(store.lastOrderResult).toBeNull()
  })

  it('updates order status', () => {
    const store = useOrderStore()
    store.orders = [
      { id: 1, orderNumber: 'ORD-001', status: 'pending', items: [], totalAmount: 10000, createdAt: '2026-01-01' },
    ]

    store.updateOrderStatus(1, 'preparing')
    expect(store.orders[0].status).toBe('preparing')
  })

  it('removes order by id', () => {
    const store = useOrderStore()
    store.orders = [
      { id: 1, orderNumber: 'ORD-001', status: 'pending', items: [], totalAmount: 10000, createdAt: '2026-01-01' },
      { id: 2, orderNumber: 'ORD-002', status: 'pending', items: [], totalAmount: 5000, createdAt: '2026-01-01' },
    ]

    store.removeOrder(1)
    expect(store.orders).toHaveLength(1)
    expect(store.orders[0].id).toBe(2)
  })

  it('clears all orders', () => {
    const store = useOrderStore()
    store.orders = [
      { id: 1, orderNumber: 'ORD-001', status: 'pending', items: [], totalAmount: 10000, createdAt: '2026-01-01' },
    ]
    store.lastOrderResult = { orderId: 1, orderNumber: 'ORD-001', createdAt: '2026-01-01' }

    store.clearOrders()
    expect(store.orders).toEqual([])
    expect(store.lastOrderResult).toBeNull()
  })

  it('does not update non-existent order', () => {
    const store = useOrderStore()
    store.orders = [
      { id: 1, orderNumber: 'ORD-001', status: 'pending', items: [], totalAmount: 10000, createdAt: '2026-01-01' },
    ]

    store.updateOrderStatus(999, 'completed')
    expect(store.orders[0].status).toBe('pending')
  })
})
