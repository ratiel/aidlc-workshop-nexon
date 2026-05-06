export interface Category {
  id: number
  name: string
}

export interface MenuItem {
  id: number
  name: string
  price: number
  description: string
  imageUrl: string
  categoryId: number
}

export interface CategoryWithMenus {
  category: Category
  items: MenuItem[]
}
