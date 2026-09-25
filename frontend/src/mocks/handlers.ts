import { http, HttpResponse } from 'msw'
import { ROLES, type Role } from '@core/rbac/roles'

/** Usuarios de prueba, uno por cada rol del sistema. */
export const MOCK_USERS: Readonly<Record<Role, { correo: string; password: string }>> = {
  [ROLES.ADMIN]: { correo: 'admin@basedebatos.cu', password: 'Admin2026!' },
  [ROLES.ENTRENADOR]: { correo: 'entrenador@basedebatos.cu', password: 'Entrena2026!' },
  [ROLES.JEFE_SALA]: { correo: 'jefe@basedebatos.cu', password: 'JefeSala2026!' },
  [ROLES.CLIENTE]: { correo: 'cliente@basedebatos.cu', password: 'Cliente2026!' },
}

/** Sobre de respuesta con los metadatos del contrato de la API. */
interface ApiEnvelope<T> {
  success: boolean
  data: T
  message: string | null
  timestamp: string
}

/**
 * Construye el sobre de respuesta que usa la API.
 *
 * @param data Carga útil de la respuesta.
 * @returns Sobre de respuesta con los metadatos del contrato de la API.
 */
function envelope<T>(data: T): ApiEnvelope<T> {
  return { success: true, data, message: null, timestamp: new Date().toISOString() }
}

/**
 * Manejadores simulados de la API.
 *
 * Sirven para desarrollar la interfaz sin depender del backend y para
 * escribir pruebas de integración deterministas. Al residir en MSW, los
 * repositorios reales se ejercitan tal y como lo harán en producción.
 */
export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const credentials = (await request.json()) as { correo: string; password: string }
    const match = Object.values(MOCK_USERS).find((user) => user.correo === credentials.correo)

    if (!match || match.password !== credentials.password) {
      return HttpResponse.json(
        { success: false, code: 'INVALID_CREDENTIALS', message: 'Credenciales incorrectas' },
        { status: 401 },
      )
    }

    const role = (Object.entries(MOCK_USERS).find(([, user]) => user === match)?.[0] ??
      ROLES.CLIENTE) as Role

    return HttpResponse.json(
      envelope({
        accessToken: `mock-access-${role}`,
        refreshToken: `mock-refresh-${role}`,
        expiresAt: Date.now() + 3_600_000,
        usuario: {
          id: `usr-${role}`,
          nombre: `Usuario de prueba (${role})`,
          correo: match.correo,
          roles: [role],
          perfil_id: `per-${role}`,
        },
      }),
    )
  }),

  http.get('/api/auth/me', () =>
    HttpResponse.json(
      envelope({
        id: 'usr-mock',
        nombre: 'Usuario de prueba',
        correo: 'prueba@basedebatos.cu',
        roles: [ROLES.ENTRENADOR],
        perfil_id: 'per-mock',
      }),
    ),
  ),

  http.get('/api/ejercicios', () =>
    HttpResponse.json(
      envelope({
        items: [
          {
            id: 1,
            nombre: 'Sentadilla búlgara',
            descripcion: 'Ejercicio compuesto de tren inferior.',
            tipo: 'fuerza',
            intensidad: 'alta',
            grupos_musculares: [{ id: 1, nombre: 'Cuádriceps', descripcion: null }],
            autor_id: 1,
            creado_en: '2026-09-01T10:00:00Z',
          },
        ],
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      }),
    ),
  ),
]
