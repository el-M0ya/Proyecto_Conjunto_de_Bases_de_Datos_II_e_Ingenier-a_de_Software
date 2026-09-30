import type { Ejercicio } from '@domain/entities'
import type { EjercicioRepository } from '@domain/repositories'
import type { ListQuery, Page } from '@domain/shared/pagination'
import { toEjercicio, type EjercicioDto } from '../mappers'
import { HttpRepository } from '../http/HttpRepository'

/**
 * Implementación HTTP del repositorio de ejercicios.
 *
 * Traduce el puerto {@link EjercicioRepository} a las rutas `/ejercicios` del
 * backend. Toda la lógica de red queda encapsulada aquí: las funcionalidades
 * de la capa de presentación nunca conocen estas rutas.
 */
export class HttpEjercicioRepository
  extends HttpRepository<Ejercicio>
  implements EjercicioRepository
{
  /** Ruta base del recurso ejercicios. */
  protected readonly basePath = '/ejercicios'

  /**
   * Convierte el DTO del backend en entidad de dominio.
   *
   * @param dto DTO del ejercicio.
   * @returns Entidad de dominio normalizada.
   */
  protected toEntity(dto: EjercicioDto): Ejercicio {
    return toEjercicio(dto)
  }

  /**
   * Lista los ejercicios del banco.
   *
   * @param query Parámetros de paginación, búsqueda y ordenación.
   * @param signal Señal de cancelación de la consulta.
   * @returns Página de ejercicios.
   */
  async list(query: ListQuery, signal?: AbortSignal): Promise<Page<Ejercicio>> {
    return this.fetchPage(query, signal)
  }

  /**
   * Obtiene un ejercicio por su identificador.
   *
   * @param id Identificador del ejercicio.
   * @param signal Señal de cancelación de la consulta.
   * @returns El ejercicio solicitado.
   */
  async getById(id: string, signal?: AbortSignal): Promise<Ejercicio> {
    const dto = await this.http.request<EjercicioDto>({
      method: 'GET',
      url: `${this.basePath}/${id}`,
      signal,
    })
    return toEjercicio(dto)
  }

  /**
   * Registra un ejercicio nuevo en el banco.
   *
   * @param ejercicio Datos del ejercicio a crear.
   * @returns El ejercicio creado.
   */
  async create(ejercicio: Omit<Ejercicio, 'id' | 'creadoEn'>): Promise<Ejercicio> {
    const dto = await this.http.request<EjercicioDto>({
      method: 'POST',
      url: this.basePath,
      body: ejercicio,
    })
    return toEjercicio(dto)
  }

  /**
   * Actualiza un ejercicio existente.
   *
   * @param id Identificador del ejercicio a modificar.
   * @param cambios Campos a actualizar.
   * @returns El ejercicio ya actualizado.
   */
  async update(id: string, cambios: Partial<Omit<Ejercicio, 'id'>>): Promise<Ejercicio> {
    const dto = await this.http.request<EjercicioDto>({
      method: 'PUT',
      url: `${this.basePath}/${id}`,
      body: cambios,
    })
    return toEjercicio(dto)
  }

  /**
   * Elimina un ejercicio del banco.
   *
   * @param id Identificador del ejercicio.
   */
  async remove(id: string): Promise<void> {
    await this.http.request<null>({ method: 'DELETE', url: `${this.basePath}/${id}` })
  }
}
