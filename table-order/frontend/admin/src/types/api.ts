import type { Order } from './order';

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface OrdersResponse {
  orders: Order[];
}

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';
