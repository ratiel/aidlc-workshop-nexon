import type { OrderStatus } from './order'

export type SSEEventType =
  | 'order_status_changed'
  | 'session_terminated'
  | 'order_deleted'
  | 'connected'

export interface OrderStatusChangedEvent {
  type: 'order_status_changed'
  orderId: number
  orderNumber: string
  newStatus: OrderStatus
}

export interface SessionTerminatedEvent {
  type: 'session_terminated'
  tableId: number
}

export interface OrderDeletedEvent {
  type: 'order_deleted'
  orderId: number
}

export type SSEEvent =
  | OrderStatusChangedEvent
  | SessionTerminatedEvent
  | OrderDeletedEvent
