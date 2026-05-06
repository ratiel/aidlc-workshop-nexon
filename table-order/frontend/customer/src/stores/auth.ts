import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthCredentials, AuthToken, AuthStatus } from '@/types/auth'
import { storageService, STORAGE_KEYS } from '@/services/storageService'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const storeId = ref<string | null>(null)
  const tableId = ref<number | null>(null)
  const tableNumber = ref<number | null>(null)
  const status = ref<AuthStatus>('unauthenticated')

  const isAuthenticated = computed(() => status.value === 'authenticated')

  function loadFromStorage(): void {
    const tokenData = storageService.get<AuthToken>(STORAGE_KEYS.AUTH_TOKEN)
    if (tokenData) {
      token.value = tokenData.token
      storeId.value = tokenData.storeId
      tableId.value = tokenData.tableId
      tableNumber.value = tokenData.tableNumber
      status.value = 'authenticated'
    }
  }

  async function login(credentials: AuthCredentials): Promise<boolean> {
    status.value = 'loading'

    const result = await authService.login(credentials)

    if (result.success) {
      const tokenData = result.data
      token.value = tokenData.token
      storeId.value = tokenData.storeId
      tableId.value = tokenData.tableId
      tableNumber.value = tokenData.tableNumber
      status.value = 'authenticated'

      storageService.set(STORAGE_KEYS.AUTH_CREDENTIALS, credentials)
      storageService.set(STORAGE_KEYS.AUTH_TOKEN, tokenData)
      return true
    }

    status.value = 'error'
    return false
  }

  async function verifyToken(): Promise<boolean> {
    if (!token.value) return false

    // Attempt a lightweight API call to verify token validity
    // If it fails with 401, the api service will handle re-auth
    const tokenData = storageService.get<AuthToken>(STORAGE_KEYS.AUTH_TOKEN)
    if (tokenData) {
      token.value = tokenData.token
      storeId.value = tokenData.storeId
      tableId.value = tokenData.tableId
      tableNumber.value = tokenData.tableNumber
      status.value = 'authenticated'
      return true
    }

    return false
  }

  function logout(): void {
    token.value = null
    storeId.value = null
    tableId.value = null
    tableNumber.value = null
    status.value = 'unauthenticated'

    storageService.remove(STORAGE_KEYS.AUTH_TOKEN)
    storageService.remove(STORAGE_KEYS.AUTH_CREDENTIALS)
  }

  return {
    token,
    storeId,
    tableId,
    tableNumber,
    status,
    isAuthenticated,
    loadFromStorage,
    login,
    verifyToken,
    logout,
  }
})
