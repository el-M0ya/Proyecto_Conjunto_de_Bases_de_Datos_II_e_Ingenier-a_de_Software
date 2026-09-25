import { ERROR_CATEGORIES } from '@core/errors/AppError'
import { HttpClient } from '@core/http/HttpClient'
import { HttpEjercicioRepository } from '@infrastructure/repositories/HttpEjercicioRepository'
import { http, HttpResponse } from 'msw'
import { mockServer } from '@mocks/server'
import { beforeEach, describe, expect, it } from 'vitest'

/**
 * Repositorio bajo prueba.
 *
 * Se construye sin `baseUrl` explícito para que tome la ruta base del entorno
 * (`/api`), que es la que usan también los manejadores de MSW. Fijarla a cadena
 * vacía produciría rutas como `/ejercicios` en lugar de `/api/ejercicios`, que
 * no casarían con ningún manejador.
 *
 * @returns Repositorio de ejercicios aislado del cliente HTTP compartido.
 */
function crearRepositorio(): HttpEjercicioRepository {
  return new HttpEjercicioRepository(new HttpClient({ timeout: 1000, retries: 0 }))
}

describe('repositorio de ejercicios', () => {
  beforeEach(() => {
    mockServer.resetHandlers()
  })

  describe('list', () => {
    it('devuelve la página de ejercicios con la entidad ya normalizada', async () => {
      const page = await crearRepositorio().list({ page: 1, pageSize: 10 })

      expect(page.items).toHaveLength(1)
      expect(page.items[0]).toMatchObject({
        nombre: 'Sentadilla búlgara',
        tipo: 'fuerza',
        intensidad: 'alta',
        autorId: '1',
      })
      expect(page.total).toBe(1)
      expect(page.totalPages).toBe(1)
    })

    it('normaliza el identificador numérico del backend a cadena', async () => {
      mockServer.use(
        http.get('/api/ejercicios', () =>
          HttpResponse.json({
            success: true,
            data: {
              items: [
                {
                  id: 42,
                  nombre: 'Press de banca',
                  tipo: 'fuerza',
                  intensidad: 'media',
                },
              ],
              page: 1,
              pageSize: 10,
              total: 1,
              totalPages: 1,
            },
          }),
        ),
      )

      const page = await crearRepositorio().list({ page: 1, pageSize: 10 })

      expect(page.items[0]?.id).toBe('42')
    })

    it('sustituye los valores de enumeración desconocidos por un valor por defecto', async () => {
      mockServer.use(
        http.get('/api/ejercicios', () =>
          HttpResponse.json({
            success: true,
            data: {
              items: [{ id: 7, nombre: 'Ejercicio nuevo', tipo: 'pilates', intensidad: 'extrema' }],
              page: 1,
              pageSize: 10,
              total: 1,
            },
          }),
        ),
      )

      const page = await crearRepositorio().list({ page: 1, pageSize: 10 })

      expect(page.items[0]?.tipo).toBe('fuerza')
      expect(page.items[0]?.intensidad).toBe('media')
    })

    it('calcula las páginas totales cuando el backend no las informa', async () => {
      mockServer.use(
        http.get('/api/ejercicios', () =>
          HttpResponse.json({
            success: true,
            data: { items: [], page: 1, pageSize: 10, total: 25 },
          }),
        ),
      )

      const page = await crearRepositorio().list({ page: 1, pageSize: 10 })

      expect(page.totalPages).toBe(3)
    })

    it('tolera un sobre sin elementos', async () => {
      mockServer.use(
        http.get('/api/ejercicios', () => HttpResponse.json({ success: true, data: {} })),
      )

      const page = await crearRepositorio().list({ page: 1, pageSize: 10 })

      expect(page.items).toEqual([])
      expect(page.total).toBe(0)
    })

    it('reenvía a la API la búsqueda, la ordenación y los filtros', async () => {
      let urlRecibida = ''

      mockServer.use(
        http.get('/api/ejercicios', ({ request }) => {
          urlRecibida = request.url
          return HttpResponse.json({
            success: true,
            data: { items: [], page: 1, pageSize: 10, total: 0 },
          })
        }),
      )

      await crearRepositorio().list({
        page: 2,
        pageSize: 25,
        search: 'sentadilla',
        sort: { field: 'nombre', direction: 'desc' },
        filters: { intensidad: 'alta' },
      })

      const url = new URL(urlRecibida)
      expect(url.searchParams.get('page')).toBe('2')
      expect(url.searchParams.get('pageSize')).toBe('25')
      expect(url.searchParams.get('search')).toBe('sentadilla')
      expect(url.searchParams.get('sortBy')).toBe('nombre')
      expect(url.searchParams.get('sortDirection')).toBe('desc')
      expect(url.searchParams.get('intensidad')).toBe('alta')
    })
  })

  describe('getById', () => {
    it('obtiene un ejercicio por su identificador', async () => {
      mockServer.use(
        http.get('/api/ejercicios/9', () =>
          HttpResponse.json({
            success: true,
            data: { id: 9, nombre: 'Sentadilla summation', tipo: 'fuerza', intensidad: 'alta' },
          }),
        ),
      )

      const ejercicio = await crearRepositorio().getById('9')

      expect(ejercicio.id).toBe('9')
      expect(ejercicio.nombre).toBe('Sentadilla summation')
    })

    it('propaga el error cuando el ejercicio no existe', async () => {
      mockServer.use(
        http.get('/api/ejercicios/404', () =>
          HttpResponse.json(
            { success: false, message: 'Ejercicio no encontrado' },
            { status: 404 },
          ),
        ),
      )

      await expect(crearRepositorio().getById('404')).rejects.toMatchObject({
        category: ERROR_CATEGORIES.NOT_FOUND,
      })
    })
  })

  describe('create', () => {
    it('envía el ejercicio y devuelve la entidad creada', async () => {
      let cuerpo: unknown

      mockServer.use(
        http.post('/api/ejercicios', async ({ request }) => {
          cuerpo = await request.json()
          return HttpResponse.json(
            {
              success: true,
              data: { id: 100, ...(cuerpo as object), creado_en: '2026-09-22T10:00:00Z' },
            },
            { status: 201 },
          )
        }),
      )

      const creado = await crearRepositorio().create({
        nombre: 'Hiperextensión',
        descripcion: null,
        tipo: 'fuerza',
        intensidad: 'baja',
        gruposMusculares: [],
        autorId: '1',
      })

      expect(cuerpo).toMatchObject({ nombre: 'Hiperextensión', intensidad: 'baja' })
      expect(creado.id).toBe('100')
    })

    it('rechaza un ejercicio duplicado con un conflicto tipado', async () => {
      mockServer.use(
        http.post('/api/ejercicios', () =>
          HttpResponse.json(
            { success: false, message: 'Ya existe un ejercicio con ese nombre' },
            { status: 409 },
          ),
        ),
      )

      await expect(
        crearRepositorio().create({
          nombre: 'Sentadilla búlgara',
          descripcion: null,
          tipo: 'fuerza',
          intensidad: 'alta',
          gruposMusculares: [],
          autorId: '1',
        }),
      ).rejects.toMatchObject({ category: ERROR_CATEGORIES.CONFLICT })
    })
  })

  describe('update', () => {
    it('envía sólo los campos modificados', async () => {
      let metodo = ''
      let cuerpo: unknown

      mockServer.use(
        http.put('/api/ejercicios/5', async ({ request }) => {
          metodo = request.method
          cuerpo = await request.json()
          return HttpResponse.json({
            success: true,
            data: { id: 5, nombre: 'Press militar', tipo: 'fuerza', intensidad: 'alta' },
          })
        }),
      )

      const actualizado = await crearRepositorio().update('5', { intensidad: 'alta' })

      expect(metodo).toBe('PUT')
      expect(cuerpo).toEqual({ intensidad: 'alta' })
      expect(actualizado.nombre).toBe('Press militar')
    })
  })

  describe('remove', () => {
    it('elimina el ejercicio indicado', async () => {
      let eliminado = ''

      mockServer.use(
        http.delete('/api/ejercicios/:id', ({ params }) => {
          eliminado = String(params.id)
          return new HttpResponse(null, { status: 204 })
        }),
      )

      await expect(crearRepositorio().remove('3')).resolves.toBeUndefined()
      expect(eliminado).toBe('3')
    })
  })
})
