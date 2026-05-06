export const STORAGE_KEYS = {
  AUTH_CREDENTIALS: 'auth_credentials',
  AUTH_TOKEN: 'auth_token',
  CART_ITEMS: 'cart_items',
} as const

export const storageService = {
  get<T>(key: string, validator?: (data: unknown) => data is T): T | null {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return null

      const parsed: unknown = JSON.parse(raw)

      if (validator && !validator(parsed)) {
        localStorage.removeItem(key)
        return null
      }

      return parsed as T
    } catch {
      localStorage.removeItem(key)
      return null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(key, serialized)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('[StorageService] Storage quota exceeded')
      }
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key)
  },

  clear(): void {
    localStorage.clear()
  },
}
