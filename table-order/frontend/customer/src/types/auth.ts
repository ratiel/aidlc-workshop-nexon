export interface AuthCredentials {
  storeId: string
  tableNumber: number
  password: string
}

export interface AuthToken {
  token: string
  tableId: number
  storeId: string
  tableNumber: number
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading' | 'error'
