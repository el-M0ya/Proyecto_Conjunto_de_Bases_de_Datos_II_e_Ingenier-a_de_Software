import { httpClient, type HttpClient } from '@core/http'
import type { AuthRepository, EjercicioRepository } from '@domain/repositories'
import { HttpAuthRepository } from '@infrastructure/repositories/HttpAuthRepository'
import { HttpEjercicioRepository } from '@infrastructure/repositories/HttpEjercicioRepository'

/**
 * Contenedor de inyección de dependencias.
 *
 * Aplica el patrón Registry: registra una única implementación de cada puerto
 * del dominio y la entrega bajo demanda. Las funcionalidades consumen
 * `container.ejercicios` y no saben si la implementación habla HTTP, si los
 * datos vienen de MSW o de un doble de prueba.
 *
 * Sustituir la infraestructura completa (por ejemplo, para pasar de la API
 * real a un servicio en memoria) se reduce entonces a reemplazar las
 * implementaciones registradas aquí, sin tocar ni un solo componente.
 */
class Container {
  /** Implementación del repositorio de autenticación. */
  private readonly authRepository: AuthRepository

  /** Implementación del repositorio de ejercicios. */
  private readonly ejercicioRepository: EjercicioRepository

  /**
   * Registra las implementaciones de los puertos del dominio.
   *
   * @param http Cliente HTTP a inyectar en los repositorios.
   */
  constructor(http: HttpClient = httpClient) {
    this.authRepository = new HttpAuthRepository(http)
    this.ejercicioRepository = new HttpEjercicioRepository(http)
  }

  /** Puerto de autenticación y sesión. */
  get auth(): AuthRepository {
    return this.authRepository
  }

  /** Puerto del banco de ejercicios. */
  get ejercicios(): EjercicioRepository {
    return this.ejercicioRepository
  }
}

/**
 * Contenedor de dependencias de la aplicación.
 *
 * Se exporta una única instancia: es el punto de composición único del
 * frontend, equivalente al «composition root» de la arquitectura hexagonal.
 */
export const container = new Container()
