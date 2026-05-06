import type { Category, MenuItem } from '@/types/menu'
import type { ApiResult } from '@/types/api'
import { api } from './api'

export interface MenuResponse {
  categories: Category[]
  items: MenuItem[]
}

export const menuService = {
  async fetchMenu(): Promise<ApiResult<MenuResponse>> {
    return api.get<MenuResponse>('/menu')
  },
}
