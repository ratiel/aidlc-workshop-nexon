import { apiRequest } from './api';
import type {
  AdminCredentials,
  LoginResponse,
  OrdersResponse,
  Order,
  OrderStatus,
  OrderHistoryQuery,
  OrderHistoryResponse,
  SetupTableRequest,
} from '@/types';

export const adminApi = {
  // Auth
  async login(credentials: AdminCredentials): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Orders
  async getOrders(): Promise<OrdersResponse> {
    return apiRequest<OrdersResponse>('/admin/orders');
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return apiRequest<Order>(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteOrder(orderId: string): Promise<void> {
    return apiRequest<void>(`/admin/orders/${orderId}`, {
      method: 'DELETE',
    });
  },

  // Tables
  async completeTable(tableId: string): Promise<void> {
    return apiRequest<void>(`/admin/tables/${tableId}/complete`, {
      method: 'POST',
    });
  },

  async getTableHistory(
    tableId: string,
    query?: Omit<OrderHistoryQuery, 'tableId'>
  ): Promise<OrderHistoryResponse> {
    const params = new URLSearchParams();
    if (query?.startDate) params.set('startDate', query.startDate);
    if (query?.endDate) params.set('endDate', query.endDate);
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));

    const queryString = params.toString();
    const path = `/admin/tables/${tableId}/history${queryString ? `?${queryString}` : ''}`;
    return apiRequest<OrderHistoryResponse>(path);
  },

  async setupTable(request: SetupTableRequest): Promise<void> {
    return apiRequest<void>('/admin/tables/setup', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};
