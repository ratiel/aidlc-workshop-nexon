import { describe, it, expect, beforeEach, vi } from 'vitest'
import { storageService, STORAGE_KEYS } from '@/services/storageService'

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('get', () => {
    it('returns null when key does not exist', () => {
      expect(storageService.get('nonexistent')).toBeNull()
    })

    it('returns parsed JSON value', () => {
      localStorage.setItem('test', JSON.stringify({ name: 'hello' }))
      expect(storageService.get('test')).toEqual({ name: 'hello' })
    })

    it('returns null and removes key on invalid JSON', () => {
      localStorage.setItem('test', 'not-json{{{')
      expect(storageService.get('test')).toBeNull()
      expect(localStorage.getItem('test')).toBeNull()
    })

    it('validates with validator function', () => {
      const isString = (data: unknown): data is string => typeof data === 'string'
      localStorage.setItem('test', JSON.stringify('hello'))
      expect(storageService.get('test', isString)).toBe('hello')
    })

    it('returns null when validator fails', () => {
      const isNumber = (data: unknown): data is number => typeof data === 'number'
      localStorage.setItem('test', JSON.stringify('not-a-number'))
      expect(storageService.get('test', isNumber)).toBeNull()
      expect(localStorage.getItem('test')).toBeNull()
    })
  })

  describe('set', () => {
    it('stores serialized value', () => {
      storageService.set('test', { a: 1 })
      expect(localStorage.getItem('test')).toBe('{"a":1}')
    })

    it('handles QuotaExceededError gracefully', () => {
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new DOMException('quota exceeded', 'QuotaExceededError')
        throw error
      })
      expect(() => storageService.set('test', 'value')).not.toThrow()
      spy.mockRestore()
    })
  })

  describe('remove', () => {
    it('removes the key', () => {
      localStorage.setItem('test', 'value')
      storageService.remove('test')
      expect(localStorage.getItem('test')).toBeNull()
    })
  })

  describe('STORAGE_KEYS', () => {
    it('has expected keys', () => {
      expect(STORAGE_KEYS.AUTH_CREDENTIALS).toBe('auth_credentials')
      expect(STORAGE_KEYS.AUTH_TOKEN).toBe('auth_token')
      expect(STORAGE_KEYS.CART_ITEMS).toBe('cart_items')
    })
  })
})
