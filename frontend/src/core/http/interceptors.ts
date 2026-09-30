import { AppError, categoryFromStatus, ERROR_CATEGORIES, toAppError } from '../errors/AppError'
import { tokenStorage } from '../auth/tokenStorage'
import type { ErrorInterceptor, HttpResponse, RequestInterceptor } from './types'

/**
 * Interceptor que adjunta el token de acceso a cada petición saliente.
 *
 * Se registra en la cadena de petición del cliente HTTP, de modo que ninguna
 * funcionalidad tenga que recordar añadir la cabecera de autorización.
 *
 * @param request Petición de salida.
 * @returns La misma petición con la cabecera `Authorization` incorporada.
 */
export const authRequestInterceptor: RequestInterceptor = (request) => {
  // Las rutas públicas se identifican de forma declarativa mediante el prefijo.
  if (request.url.startsWith('/auth/')) {
    return request
  }

  const token = tokenStorage.getAccessToken()
  if (!token) {
    return request
  }

  return {
    ...request,
    headers: { ...request.headers, Authorization: `Bearer ${token}` },
  }
}

/**
 * Interceptor que inyecta la cabecera `X-Request-Id` en cada petición.
 *
 * Permite correlacionar los registros del navegador con los del servidor al
 * depurar incidencias en un entorno distribuido.
 *
 * @param request Petición de salida.
 * @returns La misma petición con el identificador de correlación.
 */
export const requestIdInterceptor: RequestInterceptor = (request) => {
  const requestId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

  return { ...request, headers: { ...request.headers, 'X-Request-Id': requestId } }
}

/**
 * Interceptor que normaliza el sobre de respuesta del backend.
 *
 * El backend envuelve toda respuesta de negocio en un sobre `ApiEnvelope`. Este
 * interceptor lo despliega para que los repositorios trabajen siempre con el
 * dato de negocio, sin conocer la forma del sobre.
 *
 * @param response Respuesta normalizada.
 * @returns Respuesta con la propiedad `data` desplegada.
 */
export const unwrapEnvelopeInterceptor = <T>(response: HttpResponse<T>): HttpResponse<T> => {
  const payload = response.data as unknown
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'data' in (payload as Record<string, unknown>) &&
    'success' in (payload as Record<string, unknown>)
  ) {
    return { ...response, data: (payload as Record<string, unknown>).data as T }
  }
  return response
}

/**
 * Interceptor que normaliza los fallos de negocio devueltos por la API.
 *
 * La API responde con un sobre `{ success: false, code, message, details }` en
 * lugar de entregar el error directamente; este interceptor reconstruye el
 * {@link AppError} correspondiente y garantiza que la capa de presentación
 * siempre reciba un error tipado.
 *
 * @param error Error ya normalizado por el cliente HTTP.
 * @returns El mismo error, o uno de validación si el sobre lo indicaba.
 */
export const businessErrorInterceptor: ErrorInterceptor = (error) => {
  const details = error.details as { code?: string; details?: unknown } | null
  if (details?.code && error.category === ERROR_CATEGORIES.SERVER) {
    return new AppError(error.message, {
      category: error.category,
      code: details.code,
      status: error.status,
      details: details.details,
    })
  }
  return error
}

/**
 * Construye un error de red a partir de un fallo de `fetch`.
 *
 * `toAppError` preserva el mensaje original pero asigna la categoría
 * `UNKNOWN`; aquí se fuerza explícitamente la categoría de red, que es la que
 * permite a la interfaz ofrecer «Reintentar» y al cliente HTTP reintentar la
 * operación.
 *
 * @param cause Excepción original lanzada por `fetch`.
 * @returns Error normalizado con la categoría de red.
 */
export function networkError(cause: unknown): AppError {
  const normalized = toAppError(cause, 'No se pudo conectar con el servidor')
  return new AppError(normalized.message, {
    category: ERROR_CATEGORIES.NETWORK,
    code: 'NETWORK_ERROR',
    cause,
  })
}

/**
 * Construye un error a partir de un estado HTTP con cuerpo vacío.
 *
 * @param status Estado HTTP recibido.
 * @param statusText Texto de estado devuelto por el servidor.
 * @returns Error normalizado con la categoría derivada del estado.
 */
export function httpStatusError(status: number, statusText: string): AppError {
  return new AppError(statusText || `Error ${status}`, {
    category: categoryFromStatus(status),
    status,
  })
}
