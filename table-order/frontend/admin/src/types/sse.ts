import type { Order, OrderStatus } from './order';

export interface SSENewOrderEvent {
  type: 'new_order';
  data: Order;
}

export interface SSEOrderStatusChangedEvent {
  type: 'order_status_changed';
  data: {
    orderId: string;
    tableId: string;
    newStatus: OrderStatus;
  };
}

export interface SSEOrderDeletedEvent {
  type: 'order_deleted';
  data: {
    orderId: string;
    tableId: string;
    newTotalAmount: number;
  };
}

export interface SSETableCompletedEvent {
  type: 'table_completed';
  data: {
    tableId: string;
  };
}

export type SSEEvent =
  | SSENewOrderEvent
  | SSEOrderStatusChangedEvent
  | SSEOrderDeletedEvent
  | SSETableCompletedEvent;

export type SSEEventType = SSEEvent['type'];
