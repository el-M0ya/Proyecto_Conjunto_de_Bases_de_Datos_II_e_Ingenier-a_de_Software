import { httpClient, type HttpClient } from '@core/http'
import { totalPagesOf, type ListQuery, type Page } from '@domain/shared/pagination'

/**
 * Adaptador base de los repositorios HTTP.
 *
 * Implementa el patrón Adapter: traduce las operaciones del puerto de dominio
 * (listas paginadas, entidades por identificador) a las llamadas HTTP
 * concretas del backend. Las subclases sólo deben aportar las rutas y los
 * mappers específicos de cada recurso.
 *
 * @typeParam T Entidad de dominio devuelta.
 */
export abstract class HttpRepository<T> {
  /** Cliente HTTP compartido por todos los repositorios. */
  protected readonly http: HttpClient

  /** Ruta base del recurso, relativa a la base de la API. */
  protected abstract readonly basePath: string

  /**
   * Crea el repositorio sobre un cliente HTTP.
   *
   * @param http Cliente HTTP a utilizar; por defecto, la instancia compartida.
   */
  constructor(http: HttpClient = httpClient) {
    this.http = http
  }

  /**
   * Ejecuta una consulta de listado paginado, ordenado y filtrable.
   *
   * @param query Parámetros de la consulta.
   * @param signal Señal de cancelación.
   * @param extraParams Parámetros adicionales específicos del recurso.
   * @returns Página de entidades ya normalizadas.
   */
  protected async fetchPage(
    query: ListQuery,
    signal?: AbortSignal,
    extraParams: Record<string, string | number | boolean | undefined> = {},
  ): Promise<Page<T>> {
    const payload = await this.http.request<PageDto<T>>({
      method: 'GET',
      url: this.basePath,
      params: {
        page: query.page,
        pageSize: query.pageSize,
        search: query.search,
        sortBy: query.sort?.field,
        sortDirection: query.sort?.direction,
        ...query.filters,
        ...extraParams,
      },
      signal,
    })

    return {
      items: (payload.items ?? []).map((item) => this.toEntity(item)),
      page: payload.page ?? query.page,
      pageSize: payload.pageSize ?? query.pageSize,
      total: payload.total ?? 0,
      totalPages: payload.totalPages ?? totalPagesOf(payload.total ?? 0, query.pageSize),
    }
  }

  /**
   * Traduce el DTO crudo del backend a la entidad de dominio.
   *
   * @param dto DTO devuelto por la API.
   * @returns Entidad de dominio normalizada.
   */
  protected abstract toEntity(dto: T): T
}

/**
 * Forma del sobre de paginación devuelto por el backend.
 *
 * @typeParam T Tipo de cada registro dentro del sobre.
 */
export interface PageDto<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages?: number
}
