import type { ApiResult, ApiError } from '@/types/api'
import { storageService, STORAGE_KEYS } from './storageService'
import type { AuthToken, AuthCredentials } from '@/types/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function getAuthToken(): string | null {
  const tokenData = storageService.get<AuthToken>(STORAGE_KEYS.AUTH_TOKEN)
  return tokenData?.token ?? null
}

function buildHeaders(options?: RequestInit): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> ?? {}),
  }

  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

function parseApiError(status: number, body: unknown): ApiError {
  if (body && typeof body === 'object' && 'code' in body && 'message' in body) {
    return body as ApiError
  }
  return {
    code: `HTTP_${status}`,
    message: status === 404 ? '요청한 리소스를 찾을 수 없습니다.' : '서버 오류가 발생했습니다.',
  }
}

async function handleUnauthorized<T>(url: string, options?: RequestInit): Promise<ApiResult<T>> {
  storageService.remove(STORAGE_KEYS.AUTH_TOKEN)

  const credentials = storageService.get<AuthCredentials>(STORAGE_KEYS.AUTH_CREDENTIALS)
  if (!credentials) {
    return { success: false, error: { code: 'AUTH_EXPIRED', message: '인증 정보가 만료되었습니다. 관리자에게 문의하세요.' } }
  }

  // Re-authenticate
  const loginResponse = await fetch(`${BASE_URL}/table/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  if (!loginResponse.ok) {
    storageService.remove(STORAGE_KEYS.AUTH_CREDENTIALS)
    return { success: false, error: { code: 'AUTH_FAILED', message: '인증에 실패했습니다. 정보를 확인해 주세요.' } }
  }

  const tokenData: AuthToken = await loginResponse.json()
  storageService.set(STORAGE_KEYS.AUTH_TOKEN, tokenData)

  // Retry original request
  return apiRequest<T>(url, options)
}

export async function apiRequest<T>(url: string, options?: RequestInit): Promise<ApiResult<T>> {
  try {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
    const response = await fetch(fullUrl, {
      ...options,
      headers: buildHeaders(options),
    })

    if (response.status === 401) {
      return handleUnauthorized<T>(url, options)
    }

    if (!response.ok) {
      let body: unknown = null
      try {
        body = await response.json()
      } catch { /* empty */ }
      return { success: false, error: parseApiError(response.status, body) }
    }

    const data: T = await response.json()
    return { success: true, data }
  } catch {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: '네트워크 연결을 확인해 주세요.' },
    }
  }
}

export const api = {
  get<T>(url: string): Promise<ApiResult<T>> {
    return apiRequest<T>(url, { method: 'GET' })
  },

  post<T>(url: string, body: unknown): Promise<ApiResult<T>> {
    return apiRequest<T>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  patch<T>(url: string, body: unknown): Promise<ApiResult<T>> {
    return apiRequest<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },

  delete<T>(url: string): Promise<ApiResult<T>> {
    return apiRequest<T>(url, { method: 'DELETE' })
  },
}
