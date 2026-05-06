import type { AuthCredentials, AuthToken } from '@/types/auth'
import type { ApiResult } from '@/types/api'
import { apiRequest } from './api'

export const authService = {
  async login(credentials: AuthCredentials): Promise<ApiResult<AuthToken>> {
    return apiRequest<AuthToken>('/table/auth', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },
}
