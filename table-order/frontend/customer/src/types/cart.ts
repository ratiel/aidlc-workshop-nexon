export interface CartItem {
  menuId: number
  name: string
  price: number
  quantity: number
  imageUrl: string
}

export interface CartState {
  items: CartItem[]
  totalAmount: number
  totalQuantity: number
}
