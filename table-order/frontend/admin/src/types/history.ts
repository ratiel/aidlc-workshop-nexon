import type { OrderItem } from './order';

export interface OrderHistory {
  id: string;
  orderNumber: string;
  tableNumber: number;
  sessionId: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  completedAt: string;
}

export interface OrderHistoryQuery {
  tableId: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface OrderHistoryResponse {
  history: OrderHistory[];
  total: number;
}
