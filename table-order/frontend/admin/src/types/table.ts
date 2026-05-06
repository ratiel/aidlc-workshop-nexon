import type { Order } from './order';

export interface Table {
  id: string;
  tableNumber: number;
  sessionId: string | null;
  currentOrders: Order[];
  totalAmount: number;
  lastOrderAt: string | null;
  isHighlighted: boolean;
}

export interface SetupTableRequest {
  tableNumber: number;
  password: string;
}
