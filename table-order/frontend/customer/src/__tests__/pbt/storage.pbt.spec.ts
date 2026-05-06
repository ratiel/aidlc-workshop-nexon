import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { storageService } from '@/services/storageService'

describe('storageService PBT', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('roundtrip: set then get returns same value for strings', () => {
    fc.assert(
      fc.property(fc.string(), (value) => {
        storageService.set('pbt-test', value)
        const retrieved = storageService.get<string>('pbt-test')
        expect(retrieved).toBe(value)
      })
    )
  })

  it('roundtrip: set then get returns same value for numbers', () => {
    fc.assert(
      fc.property(fc.integer(), (value) => {
        storageService.set('pbt-test', value)
        const retrieved = storageService.get<number>('pbt-test')
        expect(retrieved).toBe(value)
      })
    )
  })

  it('roundtrip: set then get returns same value for objects', () => {
    const arbCartItem = fc.record({
      menuId: fc.nat(),
      name: fc.string({ minLength: 1 }),
      price: fc.nat(),
      quantity: fc.integer({ min: 1, max: 1000 }),
      imageUrl: fc.webUrl(),
    })

    fc.assert(
      fc.property(fc.array(arbCartItem, { minLength: 0, maxLength: 20 }), (items) => {
        storageService.set('pbt-test', items)
        const retrieved = storageService.get('pbt-test')
        expect(retrieved).toEqual(items)
      })
    )
  })

  it('get returns null after remove', () => {
    fc.assert(
      fc.property(fc.string(), fc.jsonValue(), (key, value) => {
        const safeKey = `pbt-${key.replace(/[^a-z0-9]/gi, '_')}`
        storageService.set(safeKey, value)
        storageService.remove(safeKey)
        expect(storageService.get(safeKey)).toBeNull()
      })
    )
  })
})
