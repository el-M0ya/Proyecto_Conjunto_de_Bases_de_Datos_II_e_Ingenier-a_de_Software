import { env } from '../config/env'
import { AppError, categoryFromStatus, ERROR_CATEGORIES, toAppError } from '../errors/AppError'
import { httpStatusError, networkError, unwrapEnvelopeInterceptor } from './interceptors'
import type {
  ErrorInterceptor,
  HttpRequest,
  HttpRequestConfig,
  HttpResponse,
  RequestInterceptor,
} from './types'

/**
 * Cliente HTTP del proyecto.
 *
 * Aplica el patrón Chain of Responsibility: cada concern transversal
 * (autenticación, trazabilidad, reintentos, tiempo de espera, normalización de
 * errores) se implementa como un interceptor independiente y componible. La
 * clase no conoce la lógica de negocio; sólo sabe enviar peticiones y
 * garantizar que sus suksesos y sus fallos tengan siempre la misma forma.
 *
 * Ninguna otra capa de la aplicación debe usar `fetch` directamente: hacerlo
 * saltaría la traza, el manejo unificado de errores y la revalidación de
 * sesión, que son precisamente los beneficios de esta abstracción.
 */
export class HttpClient {
  /** Ruta base de la API. */
  private readonly baseUrl: string

  /** Tiempo máximo de espera por defecto, en milisegundos. */
  private readonly defaultTimeout: number

  /** Número de reintentos por defecto. */
  private readonly defaultRetries: number

  /** Cadena de interceptores de petición. */
  private requestInterceptors: RequestInterceptor[] = []

  /** Cadena de interceptores de respuesta. */
  private responseInterceptors: ((response: HttpResponse<unknown>) => HttpResponse<unknown>)[] = []

  /** Cadena de interceptores de error. */
  private errorInterceptors: ErrorInterceptor[] = []

  /**
   * Crea un cliente con los valores por defecto indicados.
   *
   * El despliegue del sobre `{ success, data }` que envuelve el backend se
   * registra como comportamiento propio del cliente, y no como interceptor
   * opcional: el sobre forma parte del contrato de la API, de modo que toda
   * instancia —incluidas las que crean las pruebas— debe respetarlo. De lo
   * contrario, un cliente propio devolvería el sobre entero y cada repositorio
   * tendría que desenvolverlo por su cuenta.
   *
   * @param options Valores por defecto de la instancia.
   */
  constructor(
    options: {
      baseUrl?: string
      timeout?: number
      retries?: number
    } = {},
  ) {
    this.baseUrl = options.baseUrl ?? env.VITE_API_BASE_URL
    this.defaultTimeout = options.timeout ?? env.VITE_API_TIMEOUT
    this.defaultRetries = options.retries ?? env.VITE_API_RETRY_COUNT
    this.responseInterceptors.push(unwrapEnvelopeInterceptor)
  }

  /**
   * Registra un interceptor de petición.
   *
   * @param interceptor Interceptor a incorporar a la cadena.
   * @returns La propia instancia, para permitir encadenamiento.
   */
  useRequestInterceptor(interceptor: RequestInterceptor): this {
    this.requestInterceptors.push(interceptor)
    return this
  }

  /**
   * Registra un interceptor de respuesta.
   *
   * @param interceptor Interceptor a incorporar a la cadena.
   * @returns La propia instancia, para permitir encadenamiento.
   */
  useResponseInterceptor(
    interceptor: (response: HttpResponse<unknown>) => HttpResponse<unknown>,
  ): this {
    this.responseInterceptors.push(interceptor)
    return this
  }

  /**
   * Registra un interceptor de error.
   *
   * @param interceptor Interceptor a incorporar a la cadena.
   * @returns La propia instancia, para permitir encadenamiento.
   */
  useErrorInterceptor(interceptor: ErrorInterceptor): this {
    this.errorInterceptors.push(interceptor)
    return this
  }

  /**
   * Envía una petición y devuelve su cuerpo de negocio deserializado.
   *
   * @typeParam T Tipo esperado del cuerpo de respuesta.
   * @param config Configuración de la petición.
   * @returns El cuerpo de negocio ya normalizado.
   * @throws {AppError} Si la petición falla o agota los reintentos.
   */
  async request<T>(config: HttpRequestConfig): Promise<T> {
    const response = await this.send<T>(config)
    return response.data
  }

  /**
   * Ejecuta la cadena completa de interceptores y despacha la petición.
   *
   * @typeParam T Tipo esperado del cuerpo de respuesta.
   * @param config Configuración de la petición.
   * @returns Respuesta normalizada tras pasar por los interceptores.
   * @throws {AppError} Si la petición no puede completarse.
   */
  private async send<T>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.dispatchWithRetries<T>(config)
      return await this.applyResponseInterceptors<T>(response)
    } catch (error) {
      throw await this.applyErrorInterceptors(toAppError(error))
    }
  }

  /**
   * Ejecuta la petición aplicando la política de reintentos.
   *
   * Sólo se reintentan fallos transitorios (red no disponible o estado 5xx):
   * un error de validación o de permisos se propagará de inmediato, ya que
   * repetirlo produciría exactamente el mismo resultado.
   *
   * @typeParam T Tipo esperado del cuerpo de respuesta.
   * @param config Configuración original de la petición.
   * @param attempt Número de intento actual, empezando en cero.
   * @returns Respuesta normalizada.
   * @throws {AppError} Si se agotan los intentos o el fallo no es reintentable.
   */
  private async dispatchWithRetries<T>(
    config: HttpRequestConfig,
    attempt = 0,
  ): Promise<HttpResponse<T>> {
    const request = await this.applyRequestInterceptors({
      ...config,
      timeout: config.timeout ?? this.defaultTimeout,
      retries: config.retries ?? this.defaultRetries,
    })

    try {
      return await this.fetchWithTimeout<T>(request)
    } catch (error) {
      const appError = toAppError(error)
      const maxRetries = request.retries ?? 0

      if (attempt < maxRetries && this.isRetryable(appError)) {
        // Espera exponencial, lo que reduce la presión sobre el servidor cuando
        // existe una incidencia transitoria generalizada.
        const backoffMs = 2 ** attempt * 300
        await new Promise((resolve) => setTimeout(resolve, backoffMs))
        return this.dispatchWithRetries<T>(config, attempt + 1)
      }
      throw appError
    }
  }

  /**
   * Ejecuta la petición contra la red aplicando el tiempo de espera.
   *
   * @typeParam T Tipo esperado del cuerpo de respuesta.
   * @param request Petición ya interceptada.
   * @returns Respuesta normalizada.
   * @throws {AppError} Ante cualquier fallo de red o estado no exitoso.
   */
  private async fetchWithTimeout<T>(request: HttpRequest): Promise<HttpResponse<T>> {
    const controller = new AbortController()
    const timeout = request.timeout ?? 0

    const timer =
      timeout > 0
        ? setTimeout(() => {
            controller.abort()
          }, timeout)
        : undefined

    // Se combinan la señal interna con la del componente que originó la petición,
    // de forma que la cancelación de una consulta de React Query también cancele
    // la petición de red asociada.
    const signal = request.signal
      ? AbortSignal.any([request.signal, controller.signal])
      : controller.signal

    try {
      const url = this.buildUrl(request.url, request.params)
      const response = await fetch(url, {
        method: request.method,
        headers: this.buildHeaders(request),
        body: this.serializeBody(request),
        signal,
      })

      if (!response.ok) {
        throw await this.buildHttpError(response)
      }

      return {
        data: (await this.parseBody(response)) as T,
        status: response.status,
        headers: response.headers,
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      // `AbortError` por temporizador se traduce a un error de tiempo de espera,
      // que la interfaz puede presentar de forma más útil que un error de red.
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new AppError('La solicitud tardó demasiado en responder', {
          category: ERROR_CATEGORIES.NETWORK,
          code: 'REQUEST_TIMEOUT',
          cause: error,
        })
      }
      throw networkError(error)
    } finally {
      if (timer !== undefined) {
        clearTimeout(timer)
      }
    }
  }

  /**
   * Construye la URL final, combinando la ruta base, la ruta y la query string.
   *
   * @param url Ruta relativa ya normalizada.
   * @param params Parámetros de consulta; los valores nulos o indefinidos se omiten.
   * @returns URL absoluta lista para `fetch`.
   */
  private buildUrl(url: string, params: HttpRequest['params'] = {}): string {
    const path = `${this.baseUrl}${url}`
    const search = new URLSearchParams()

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        search.append(key, String(value))
      }
    }

    const query = search.toString()
    return query ? `${path}?${query}` : path
  }

  /**
   * Construye las cabeceras de la petición.
   *
   * @param request Petición ya interceptada.
   * @returns Objeto de cabeceras.
   */
  private buildHeaders(request: HttpRequest): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...request.headers,
    }

    if (request.body !== undefined && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    return headers
  }

  /**
   * Serializa el cuerpo de la petición.
   *
   * @param request Petición ya interceptada.
   * @returns Cuerpo listo para `fetch`, o `undefined` si no hay cuerpo.
   */
  private serializeBody(request: HttpRequest): BodyInit | undefined {
    if (request.body === undefined) {
      return undefined
    }
    if (request.body instanceof FormData) {
      return request.body
    }
    return JSON.stringify(request.body)
  }

  /**
   * Deserializa el cuerpo de la respuesta, tolerando respuestas vacías.
   *
   * @param response Respuesta nativa de `fetch`.
   * @returns El cuerpo parseado o `null` si la respuesta no tiene contenido.
   */
  private async parseBody(response: Response): Promise<unknown> {
    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      return null
    }

    const contentType = response.headers.get('Content-Type') ?? ''
    if (!contentType.includes('application/json')) {
      return await response.text()
    }

    const text = await response.text()
    return text.length > 0 ? JSON.parse(text) : null
  }

  /**
   * Construye un error de negocio a partir de una respuesta no exitosa.
   *
   * @param response Respuesta nativa de `fetch` con estado no 2xx.
   * @returns Error normalizado con el mensaje y el detalle del servidor.
   */
  private async buildHttpError(response: Response): Promise<AppError> {
    const body = await this.readJsonBody(response)
    if (body === null) {
      // Respuesta sin cuerpo JSON válido: sólo se dispone del estado HTTP.
      return httpStatusError(response.status, response.statusText)
    }

    const envelope = body as { message?: string; code?: string; details?: unknown } | null
    return new AppError(envelope?.message ?? response.statusText, {
      category: categoryFromStatus(response.status),
      code: envelope?.code,
      status: response.status,
      details: envelope?.details ?? envelope,
    })
  }

  /**
   * Lee el cuerpo JSON de una respuesta de error.
   *
   * @param response Respuesta nativa de `fetch`.
   * @returns El cuerpo deserializado, o `null` si no es JSON válido.
   */
  private async readJsonBody(response: Response): Promise<unknown> {
    try {
      return await response.json()
    } catch {
      return null
    }
  }

  /**
   * Indica si un fallo admite un nuevo intento.
   *
   * @param error Error ya normalizado.
   * @returns `true` para fallos de red y de servidor.
   */
  private isRetryable(error: AppError): boolean {
    return error.category === ERROR_CATEGORIES.NETWORK || error.category === ERROR_CATEGORIES.SERVER
  }

  /**
   * Aplica la cadena de interceptores de petición.
   *
   * @param request Petición inicial.
   * @returns Petición transformada por toda la cadena.
   */
  private async applyRequestInterceptors(request: HttpRequest): Promise<HttpRequest> {
    let current = request
    for (const interceptor of this.requestInterceptors) {
      // `Promise.resolve` unifica interceptores síncronos y asíncronos.
      current = await Promise.resolve(interceptor(current))
    }
    return current
  }

  /**
   * Aplica la cadena de interceptores de respuesta.
   *
   * @typeParam T Tipo esperado del cuerpo de respuesta.
   * @param response Respuesta producida por la capa de red.
   * @returns Respuesta transformada por toda la cadena.
   */
  private async applyResponseInterceptors<T>(response: HttpResponse<T>): Promise<HttpResponse<T>> {
    let current = response as HttpResponse<unknown>
    for (const interceptor of this.responseInterceptors) {
      // `Promise.resolve` unifica interceptores síncronos y asíncronos.
      current = await Promise.resolve(interceptor(current))
    }
    return current as HttpResponse<T>
  }

  /**
   * Aplica la cadena de interceptores de error.
   *
   * @param error Error ya normalizado.
   * @returns Error final, listo para propagarse a la capa de presentación.
   */
  private async applyErrorInterceptors(error: AppError): Promise<AppError> {
    let current = error
    for (const interceptor of this.errorInterceptors) {
      // `Promise.resolve` unifica interceptores síncronos y asíncronos.
      current = await Promise.resolve(interceptor(current))
    }
    return current
  }
}
