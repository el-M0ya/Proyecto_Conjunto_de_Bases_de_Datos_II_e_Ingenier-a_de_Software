import { InMemoryStore } from '@core/storage/InMemoryStore'
import { WebStorageStore } from '@core/storage/WebStorageStore'
import { STORAGE_KEYS } from '@core/storage/storeFactory'
import { describe, expect, it } from 'vitest'

describe('almacenes clave-valor', () => {
  describe('InMemoryStore', () => {
    it('respeta el contrato completo de lectura y escritura', () => {
      const store = new InMemoryStore()

      expect(store.get('ausente')).toBeNull()
      expect(store.has('ausente')).toBe(false)

      store.set('clave', 'valor')
      expect(store.get('clave')).toBe('valor')
      expect(store.has('clave')).toBe(true)

      store.remove('clave')
      expect(store.get('clave')).toBeNull()
    })

    it('vacía por completo el almacén', () => {
      const store = new InMemoryStore()
      store.set('a', '1')
      store.set('b', '2')

      store.clear()

      expect(store.has('a')).toBe(false)
      expect(store.has('b')).toBe(false)
    })
  })

  describe('WebStorageStore', () => {
    it('delega en la interfaz Storage del navegador', () => {
      localStorage.clear()
      const store = new WebStorageStore(localStorage)

      store.set(STORAGE_KEYS.THEME, 'dark')
      expect(store.get(STORAGE_KEYS.THEME)).toBe('dark')
      expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('dark')

      store.remove(STORAGE_KEYS.THEME)
      expect(store.get(STORAGE_KEYS.THEME)).toBeNull()
    })

    it('no propaga los errores lanzados por un almacén inaccesible', () => {
      const store = new WebStorageStore({
        getItem: () => {
          throw new Error('SecurityError')
        },
        setItem: () => {
          throw new Error('QuotaExceededError')
        },
        removeItem: () => {
          throw new Error('SecurityError')
        },
        clear: () => {
          throw new Error('SecurityError')
        },
        key: () => null,
        length: 0,
      })

      expect(() => store.set('clave', 'valor')).not.toThrow()
      expect(store.get('clave')).toBeNull()
      expect(store.has('clave')).toBe(false)
      expect(() => store.remove('clave')).not.toThrow()
      expect(() => store.clear()).not.toThrow()
    })
  })
})
