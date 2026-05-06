import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SSEEvent } from '@/types/sse'
import { sseManager, type SSEConnectionStatus } from '@/services/sseService'
import { useOrderStore } from './order'
import { useCartStore } from './cart'

export const useSSEStore = defineStore('sse', () => {
  const connectionStatus = ref<SSEConnectionStatus>('disconnected')
  const reconnectAttempt = ref(0)

  let unsubscribeEvent: (() => void) | null = null
  let unsubscribeStatus: (() => void) | null = null

  function connect(tableId: number, token: string): void {
    disconnect()

    unsubscribeEvent = sseManager.onEvent(handleEvent)
    unsubscribeStatus = sseManager.onStatusChange((status) => {
      connectionStatus.value = status
    })

    sseManager.connect(tableId, token)
  }

  function disconnect(): void {
    sseManager.disconnect()
    unsubscribeEvent?.()
    unsubscribeStatus?.()
    unsubscribeEvent = null
    unsubscribeStatus = null
    connectionStatus.value = 'disconnected'
    reconnectAttempt.value = 0
  }

  function handleEvent(event: SSEEvent): void {
    const orderStore = useOrderStore()

    switch (event.type) {
      case 'order_status_changed':
        orderStore.updateOrderStatus(event.orderId, event.newStatus)
        break

      case 'order_deleted':
        orderStore.removeOrder(event.orderId)
        break

      case 'session_terminated':
        handleSessionTerminated()
        break
    }
  }

  function handleSessionTerminated(): void {
    const cartStore = useCartStore()
    const orderStore = useOrderStore()

    cartStore.clearCart()
    orderStore.clearOrders()
    disconnect()

    // Navigate to menu (handled by the component watching this state)
    // The App.vue will watch for session termination
  }

  return {
    connectionStatus,
    reconnectAttempt,
    connect,
    disconnect,
    handleEvent,
    handleSessionTerminated,
  }
})
