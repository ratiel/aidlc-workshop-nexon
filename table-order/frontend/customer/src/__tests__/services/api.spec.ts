import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from '@/services/api'
import { storageService, STORAGE_KEYS } from '@/services/storageService'

describe('api service', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('adds Authorization header when token exists', async () => {
    storageService.set(STORAGE_KEYS.AUTH_TOKEN, {
      token: 'test-token',
      tableId: 1,
      storeId: 'store1',
      tableNumber: 5,
    })

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: 'ok' }), { status: 200 })
    )

    await api.get('/test')

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    )
  })

  it('returns success result on 200', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), { status: 200 })
    )

    const result = await api.get('/test')
    expect(result).toEqual({ success: true, data: { id: 1 } })
  })

  it('returns error result on 500', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ code: 'SERVER_ERROR', message: 'fail' }), { status: 500 })
    )

    const result = await api.get('/test')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('SERVER_ERROR')
    }
  })

  it('returns NETWORK_ERROR on fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'))

    const result = await api.get('/test')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('NETWORK_ERROR')
    }
  })

  it('sends POST with body', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ created: true }), { status: 201 })
    )

    await api.post('/orders', { items: [] })

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ items: [] }),
      })
    )
  })
})
