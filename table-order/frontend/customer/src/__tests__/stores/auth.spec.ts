import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { storageService, STORAGE_KEYS } from '@/services/storageService'

vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}))

import { authService } from '@/services/authService'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('starts unauthenticated', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.status).toBe('unauthenticated')
  })

  it('loads token from storage', () => {
    storageService.set(STORAGE_KEYS.AUTH_TOKEN, {
      token: 'abc123',
      tableId: 5,
      storeId: 'store1',
      tableNumber: 3,
    })

    const store = useAuthStore()
    store.loadFromStorage()

    expect(store.isAuthenticated).toBe(true)
    expect(store.token).toBe('abc123')
    expect(store.tableId).toBe(5)
    expect(store.tableNumber).toBe(3)
  })

  it('login success sets authenticated state', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      success: true,
      data: { token: 'new-token', tableId: 2, storeId: 'store1', tableNumber: 7 },
    })

    const store = useAuthStore()
    const result = await store.login({ storeId: 'store1', tableNumber: 7, password: 'pass' })

    expect(result).toBe(true)
    expect(store.isAuthenticated).toBe(true)
    expect(store.token).toBe('new-token')
  })

  it('login failure sets error state', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      success: false,
      error: { code: 'AUTH_FAILED', message: 'Invalid credentials' },
    })

    const store = useAuthStore()
    const result = await store.login({ storeId: 'store1', tableNumber: 7, password: 'wrong' })

    expect(result).toBe(false)
    expect(store.status).toBe('error')
    expect(store.isAuthenticated).toBe(false)
  })

  it('logout clears all state and storage', () => {
    storageService.set(STORAGE_KEYS.AUTH_TOKEN, { token: 'x', tableId: 1, storeId: 's', tableNumber: 1 })
    storageService.set(STORAGE_KEYS.AUTH_CREDENTIALS, { storeId: 's', tableNumber: 1, password: 'p' })

    const store = useAuthStore()
    store.loadFromStorage()
    store.logout()

    expect(store.isAuthenticated).toBe(false)
    expect(store.token).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_CREDENTIALS)).toBeNull()
  })
})
