import { HttpClient } from './HttpClient'
import {
  authRequestInterceptor,
  businessErrorInterceptor,
  requestIdInterceptor,
} from './interceptors'

/**
 * Instancia única del cliente HTTP de la aplicación.
 *
 * Se construye aquí, y no en un punto de uso, para que todos los repositorios
 * compartan exactamente la misma configuración y las mismas cadenas de
 * interceptores. En las pruebas se puede crear una instancia propia de
 * {@link HttpClient} para inyectar comportamiento específico.
 *
 * El orden de la cadena importa y está justificado:
 *
 * 1. `requestIdInterceptor` — etiqueta la petición para poder correlacionar los
 *    registros del navegador con los del servidor.
 * 2. `authRequestInterceptor` — adjunta el token de acceso a las rutas privadas.
 * 3. `businessErrorInterceptor` — normaliza el sobre de error del backend.
 *
 * El despliegue del sobre de respuesta no se registra aquí: lo aplica el propio
 * cliente en su constructor, por ser parte del contrato de la API.
 *
 * @example
 * ```ts
 * const pagina = await httpClient.request<Page<Ejercicio>>({
 *   method: 'GET',
 *   url: '/ejercicios',
 *   params: { page: 1, pageSize: 10 },
 * })
 * ```
 */
export const httpClient = new HttpClient()
  .useRequestInterceptor(requestIdInterceptor)
  .useRequestInterceptor(authRequestInterceptor)
  .useErrorInterceptor(businessErrorInterceptor)

export { HttpClient }
export type * from './types'
