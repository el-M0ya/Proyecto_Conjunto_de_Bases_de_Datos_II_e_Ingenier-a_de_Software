import { AppError, ERROR_CATEGORIES, toAppError } from '@core/errors/AppError'
import {
  authRequestInterceptor,
  requestIdInterceptor,
  unwrapEnvelopeInterceptor,
} from '@core/http/interceptors'
import { beforeEach, describe, expect, it } from 'vitest'
import { tokenStorage } from '@core/auth/tokenStorage'
import type { HttpRequest, HttpResponse } from '@core/http/types'

/**
 * Petición GET de ejemplo para ejercitar los interceptores.
 *
 * @param url Ruta de la petición.
 * @returns Configuración de prueba.
 */
function peticion(url: string): HttpRequest {
  return { method: 'GET', url }
}

/**
 * Ejecuta un interceptor de petición y devuelve su resultado.
 *
 * Los interceptores están tipados como síncronos o asíncronos, de modo que la
 * prueba debe resolver la posible promesa antes de inspeccionar el resultado.
 *
 * @param interceptor Interceptor a ejecutar.
 * @param request Petición de entrada.
 * @returns Petición resultante ya resuelta.
 */
async function ejecutar(
  interceptor: (request: HttpRequest) => HttpRequest | Promise<HttpRequest>,
  request: HttpRequest,
): Promise<HttpRequest> {
  return interceptor(request)
}

describe('interceptores de petición', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('authRequestInterceptor', () => {
    it('adjunta el token de acceso a las peticiones de la API', async () => {
      tokenStorage.setTokens({ accessToken: 'secreto', refreshToken: null, expiresAt: null })

      const resultado = await ejecutar(authRequestInterceptor, peticion('/ejercicios'))

      expect(resultado.headers?.Authorization).toBe('Bearer secreto')
    })

    it('deja la petición intacta cuando no hay sesión', async () => {
      const resultado = await ejecutar(authRequestInterceptor, peticion('/ejercicios'))

      expect(resultado.headers).toBeUndefined()
    })

    it('no adjunta el token a las rutas de autenticación', async () => {
      tokenStorage.setTokens({ accessToken: 'secreto', refreshToken: null, expiresAt: null })

      const resultado = await ejecutar(authRequestInterceptor, peticion('/auth/login'))

      expect(resultado.headers?.Authorization).toBeUndefined()
    })

    it('conserva las cabeceras que ya traía la petición', async () => {
      tokenStorage.setTokens({ accessToken: 'secreto', refreshToken: null, expiresAt: null })

      const resultado = await ejecutar(authRequestInterceptor, {
        ...peticion('/ejercicios'),
        headers: { 'X-Test': '1' },
      })

      expect(resultado.headers).toMatchObject({ 'X-Test': '1', Authorization: 'Bearer secreto' })
    })
  })

  describe('requestIdInterceptor', () => {
    it('añade un identificador de correlación distinto en cada petición', async () => {
      const primero = await ejecutar(requestIdInterceptor, peticion('/ejercicios'))
      const segundo = await ejecutar(requestIdInterceptor, peticion('/ejercicios'))

      expect(primero.headers?.['X-Request-Id']).toBeDefined()
      expect(primero.headers?.['X-Request-Id']).not.toBe(segundo.headers?.['X-Request-Id'])
    })
  })
})

describe('despliegue del sobre de respuesta', () => {
  /**
   * Envuelve un cuerpo como respuesta normalizada.
   *
   * @param data Cuerpo de la respuesta.
   * @returns Respuesta normalizada.
   */
  function respuesta<T>(data: T): HttpResponse<T> {
    return { data, status: 200, headers: new Headers() }
  }

  it('despliega el sobre cuando la API lo devuelve', () => {
    const resultado = unwrapEnvelopeInterceptor(
      respuesta({ success: true, data: { id: 1 }, message: null }),
    )

    expect(resultado.data).toEqual({ id: 1 })
  })

  it('deja intacta una respuesta sin sobre', () => {
    const resultado = unwrapEnvelopeInterceptor(respuesta([1, 2, 3]))
    expect(resultado.data).toEqual([1, 2, 3])
  })

  it('no interpreta como sobre un cuerpo con `data` pero sin `success`', () => {
    const resultado = unwrapEnvelopeInterceptor(respuesta({ data: 1 }))
    expect(resultado.data).toEqual({ data: 1 })
  })

  it('tolera un cuerpo nulo', () => {
    expect(unwrapEnvelopeInterceptor(respuesta(null)).data).toBeNull()
  })
})

describe('errores de la aplicación', () => {
  it('expone la categoría de validación para los errores de campo', () => {
    const error = new AppError('Datos incorrectos', {
      category: ERROR_CATEGORIES.VALIDATION,
    })

    expect(error.category).toBe(ERROR_CATEGORIES.VALIDATION)
    expect(error.isAuthError).toBe(false)
  })

  it('conserva el detalle original del servidor en `details`', () => {
    const error = new AppError('Duplicado', { details: { campo: 'nombre' } })
    expect(error.details).toEqual({ campo: 'nombre' })
  })

  it('expone el error original como causa', () => {
    const original = new Error('fallo de red')
    expect(new AppError('envoltura', { cause: original }).cause).toBe(original)
  })

  it('normaliza una excepción de tipo desconocido', () => {
    const error = toAppError({ codigo: 500 })

    expect(error.details).toEqual({ codigo: 500 })
    expect(error.category).toBe(ERROR_CATEGORIES.UNKNOWN)
  })
})
