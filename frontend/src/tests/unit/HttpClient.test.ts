import { HttpClient } from '@core/http/HttpClient'
import { AppError, ERROR_CATEGORIES } from '@core/errors/AppError'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Cliente HTTP aislado, sin interceptores de autenticación ni reintentos, para
 * verificar únicamente el comportamiento de la capa de red.
 */
function createClient(): HttpClient {
  return new HttpClient({ baseUrl: '', timeout: 1000, retries: 0 })
}

describe('cliente HTTP', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('construye la URL con los parámetros de consulta no nulos', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await createClient().request({
      method: 'GET',
      url: '/ejercicios',
      params: { page: 1, search: 'sentadilla', vacio: undefined, nulo: null },
    })

    const url = new URL(fetchSpy.mock.calls[0]?.[0] as string, 'http://localhost')
    expect(url.pathname).toBe('/ejercicios')
    expect(url.searchParams.get('page')).toBe('1')
    expect(url.searchParams.get('search')).toBe('sentadilla')
    expect(url.searchParams.has('vacio')).toBe(false)
    expect(url.searchParams.has('nulo')).toBe(false)
  })

  it('añade la cabecera Content-Type sólo cuando hay cuerpo', async () => {
    // Cada llamada necesita su propia respuesta: un objeto `Response` sólo
    // puede leerse una vez.
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(() =>
        Promise.resolve(
          new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }),
        ),
      )

    const client = createClient()
    await client.request({ method: 'GET', url: '/programas' })
    expect(
      (fetchSpy.mock.calls[0]?.[1]?.headers as Record<string, string>)['Content-Type'],
    ).toBeUndefined()

    await client.request({ method: 'POST', url: '/programas', body: { nombre: 'Hipertrofia' } })
    expect((fetchSpy.mock.calls[1]?.[1]?.headers as Record<string, string>)['Content-Type']).toBe(
      'application/json',
    )
  })

  it('traduce un estado 401 a un error de autenticación', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ code: 'SESSION_EXPIRED', message: 'Sesión expirada' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(createClient().request({ method: 'GET', url: '/auth/me' })).rejects.toMatchObject({
      category: ERROR_CATEGORIES.UNAUTHORIZED,
      code: 'SESSION_EXPIRED',
      message: 'Sesión expirada',
    })
  })

  it('traduce un conflicto 409 a su categoría de dominio', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'El ejercicio ya existe' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(
      createClient().request({ method: 'POST', url: '/ejercicios', body: {} }),
    ).rejects.toMatchObject({ category: ERROR_CATEGORIES.CONFLICT })
  })

  it('trata un cuerpo vacío como respuesta sin contenido', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))

    await expect(
      createClient().request({ method: 'DELETE', url: '/ejercicios/1' }),
    ).resolves.toBeNull()
  })

  it('aplica los interceptores de petición registrados', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }),
      )

    const client = createClient().useRequestInterceptor((request) => ({
      ...request,
      headers: { ...request.headers, 'X-Test': 'interceptor' },
    }))

    await client.request({ method: 'GET', url: '/programas' })

    expect((fetchSpy.mock.calls[0]?.[1]?.headers as Record<string, string>)['X-Test']).toBe(
      'interceptor',
    )
  })

  it('permite que un interceptor de error transforme el fallo', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'original' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const client = createClient().useErrorInterceptor(
      (error) => new AppError('mensaje revisado', { category: error.category }),
    )

    await expect(client.request({ method: 'GET', url: '/reportes' })).rejects.toThrow(
      'mensaje revisado',
    )
  })

  it('traduce un fallo de red a la categoría de red', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(
      createClient().request({ method: 'GET', url: '/ejercicios' }),
    ).rejects.toMatchObject({ category: ERROR_CATEGORIES.NETWORK })
  })
})
