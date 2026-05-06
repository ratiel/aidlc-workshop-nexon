import type { CreateOrderRequest, CreateOrderResponse, Order } from '@/types/order'
import type { ApiResult } from '@/types/api'
import { api } from './api'

export const orderService = {
  async createOrder(request: CreateOrderRequest): Promise<ApiResult<CreateOrderResponse>> {
    return api.post<CreateOrderResponse>('/orders', request)
  },

  async fetchOrders(): Promise<ApiResult<Order[]>> {
    return api.get<Order[]>('/orders')
  },
}
