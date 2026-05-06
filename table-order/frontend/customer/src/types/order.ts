export type OrderStatus = 'pending' | 'preparing' | 'completed'

export interface OrderItemRequest {
  menuId: number
  name: string
  quantity: number
  price: number
}

export interface CreateOrderRequest {
  storeId: string
  tableId: number
  sessionId: string
  items: OrderItemRequest[]
  totalAmount: number
}

export interface CreateOrderResponse {
  orderId: number
  orderNumber: string
  createdAt: string
}

export interface OrderItem {
  menuId: number
  name: string
  quantity: number
  price: number
  subtotal: number
}

export interface Order {
  id: number
  orderNumber: string
  status: OrderStatus
  items: OrderItem[]
  totalAmount: number
  createdAt: string
}
