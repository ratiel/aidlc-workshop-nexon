import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Order, OrderStatus, CreateOrderResponse } from '@/types/order'
import { orderService } from '@/services/orderService'
import { useCartStore } from './cart'
import { useAuthStore } from './auth'

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const lastOrderResult = ref<CreateOrderResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function createOrder(): Promise<boolean> {
    const cartStore = useCartStore()
    const authStore = useAuthStore()

    if (cartStore.isEmpty || !authStore.isAuthenticated) return false

    isLoading.value = true
    error.value = null

    const result = await orderService.createOrder({
      storeId: authStore.storeId!,
      tableId: authStore.tableId!,
      sessionId: '', // Server manages session
      items: cartStore.items.map((item) => ({
        menuId: item.menuId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: cartStore.totalAmount,
    })

    isLoading.value = false

    if (result.success) {
      lastOrderResult.value = result.data
      cartStore.clearCart()
      return true
    }

    error.value = result.error.message
    return false
  }

  async function fetchOrders(): Promise<void> {
    isLoading.value = true
    error.value = null

    const result = await orderService.fetchOrders()

    if (result.success) {
      orders.value = result.data
    } else {
      error.value = result.error.message
    }

    isLoading.value = false
  }

  function updateOrderStatus(orderId: number, newStatus: OrderStatus): void {
    const order = orders.value.find((o) => o.id === orderId)
    if (order) {
      order.status = newStatus
    }
  }

  function removeOrder(orderId: number): void {
    orders.value = orders.value.filter((o) => o.id !== orderId)
  }

  function clearOrders(): void {
    orders.value = []
    lastOrderResult.value = null
  }

  return {
    orders,
    lastOrderResult,
    isLoading,
    error,
    createOrder,
    fetchOrders,
    updateOrderStatus,
    removeOrder,
    clearOrders,
  }
})
