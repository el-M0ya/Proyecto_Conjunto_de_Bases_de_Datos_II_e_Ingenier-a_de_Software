import type { AppError } from '../errors/AppError'

/**
 * Configuración común a todas las peticiones salientes.
 */
export interface HttpRequestConfig {
  /** Método HTTP. */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Ruta relativa a la base de la API, ya normalizada. */
  url: string
  /** Parámetros de consulta serializados en la URL. */
  params?: Record<string, string | number | boolean | undefined | null>
  /** Cuerpo de la petición; los objetos se serializan como JSON. */
  body?: unknown
  /** Cabeceras HTTP adicionales. */
  headers?: Record<string, string>
  /** Tiempo máximo de espera en milisegundos; `0` desactiva el límite. */
  timeout?: number
  /** Número de reintentos automáticos permitidos. */
  retries?: number
  /** Señal de cancelación propagada desde el componente que inicia la petición. */
  signal?: AbortSignal
  /** Clave de caché para el gestor de estado del servidor. */
  queryKey?: readonly unknown[]
}

/** Petición normalizada, tal y como la recibe un interceptor. */
export type HttpRequest = HttpRequestConfig

/**
 * Respuesta normalizada de la capa HTTP.
 *
 * @typeParam T Tipo de dato de negocio deserializado desde la propiedad `data`.
 */
export interface HttpResponse<T> {
  /** Cuerpo de negocio ya deserializado. */
  data: T
  /** Estado HTTP de la respuesta. */
  status: number
  /** Cabeceras de la respuesta. */
  headers: Headers
}

/** Interceptor que transforma una petición antes de su envío. */
export type RequestInterceptor = (request: HttpRequest) => HttpRequest | Promise<HttpRequest>

/** Interceptor que transforma una respuesta antes de devolverla. */
export type ResponseInterceptor<T> = (
  response: HttpResponse<T>,
) => HttpResponse<T> | Promise<HttpResponse<T>>

/** Interceptor que transforma un fallo antes de propagarlo. */
export type ErrorInterceptor = (error: AppError) => AppError | Promise<AppError>
