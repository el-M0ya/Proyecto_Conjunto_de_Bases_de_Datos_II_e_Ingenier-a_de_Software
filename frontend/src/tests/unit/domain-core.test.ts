import { describe, expect, it } from 'vitest'
import { totalPagesOf } from '@domain/shared/pagination'
import { AppError, categoryFromStatus, toAppError } from '@core/errors/AppError'
import { ERROR_CATEGORIES } from '@core/errors/AppError'
import { loadEnv } from '@core/config/env'

describe('dominio compartido', () => {
  describe('totalPagesOf', () => {
    it('calcula el número de páginas a partir del total y el tamaño', () => {
      expect(totalPagesOf(45, 10)).toBe(5)
      expect(totalPagesOf(40, 10)).toBe(4)
    })

    it('devuelve al menos una página cuando no hay resultados', () => {
      expect(totalPagesOf(0, 10)).toBe(1)
    })

    it('evita la división por cero cuando el tamaño de página no es válido', () => {
      expect(totalPagesOf(10, 0)).toBe(1)
      expect(totalPagesOf(10, -5)).toBe(1)
    })
  })
})

describe('errores de la aplicación', () => {
  describe('categoryFromStatus', () => {
    it.each([
      [400, ERROR_CATEGORIES.VALIDATION],
      [401, ERROR_CATEGORIES.UNAUTHORIZED],
      [403, ERROR_CATEGORIES.FORBIDDEN],
      [404, ERROR_CATEGORIES.NOT_FOUND],
      [409, ERROR_CATEGORIES.CONFLICT],
      [422, ERROR_CATEGORIES.VALIDATION],
      [500, ERROR_CATEGORIES.SERVER],
      [503, ERROR_CATEGORIES.SERVER],
      [302, ERROR_CATEGORIES.UNKNOWN],
    ])('clasifica el estado %i como %s', (status, expected) => {
      expect(categoryFromStatus(status)).toBe(expected)
    })
  })

  describe('toAppError', () => {
    it('conserva un AppError sin volver a envolverlo', () => {
      const original = new AppError('original')
      expect(toAppError(original)).toBe(original)
    })

    it('envuelve un Error nativo conservando su mensaje', () => {
      const error = toAppError(new Error('fallo de red'))
      expect(error.message).toBe('fallo de red')
      expect(error.category).toBe(ERROR_CATEGORIES.UNKNOWN)
    })

    it('usa el mensaje de reserva cuando el error no aporta información', () => {
      expect(toAppError('texto plano', 'mensaje de reserva').message).toBe('mensaje de reserva')
    })
  })

  it('identifica los errores de autenticación', () => {
    const error = new AppError('sesión expirada', { category: ERROR_CATEGORIES.UNAUTHORIZED })
    expect(error.isAuthError).toBe(true)
  })
})

describe('configuración del entorno', () => {
  it('normaliza la ruta base de la API', () => {
    expect(loadEnv({ VITE_API_BASE_URL: '/api/' }).VITE_API_BASE_URL).toBe('api')
    expect(loadEnv({ VITE_API_BASE_URL: '//api//' }).VITE_API_BASE_URL).toBe('api')
  })

  it('interpreta la ruta vacía como «mismo origen»', () => {
    expect(loadEnv({ VITE_API_BASE_URL: '/' }).VITE_API_BASE_URL).toBe('')
  })

  it('convierte VITE_ENABLE_MOCKS en un booleano', () => {
    expect(loadEnv({ VITE_ENABLE_MOCKS: 'true' }).VITE_ENABLE_MOCKS).toBe(true)
    expect(loadEnv({ VITE_ENABLE_MOCKS: 'false' }).VITE_ENABLE_MOCKS).toBe(false)
  })

  it('aplica los valores por defecto declarados', () => {
    const env = loadEnv({})
    expect(env.VITE_APP_NAME).toBe('Base de Batos')
    expect(env.VITE_DEFAULT_LOCALE).toBe('es-CU')
    expect(env.VITE_API_TIMEOUT).toBe(15_000)
  })

  it('rechaza un modo de entorno desconocido', () => {
    expect(() => loadEnv({ VITE_APP_ENV: 'produccion' })).toThrow()
  })
})
