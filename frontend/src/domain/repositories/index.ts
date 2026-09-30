import type {
  Cliente,
  Ejercicio,
  Entrenador,
  GrupoMuscular,
  ProgramaEntrenamiento,
  Rutina,
  SesionEntrenamiento,
  SolicitudAjuste,
  UserProfile,
} from '../entities'
import type { ListQuery, Page } from '../shared/pagination'

/**
 * Contratos de repositorio del dominio (puertos).
 *
 * El dominio declara **qué** necesita; la capa de infraestructura decide
 * **cómo** se obtiene. Esta separación es la que permite que las
 * funcionalidades (casos de uso) se escriban una sola vez y se prueben con
 * dobles de prueba, sin levantar un servidor ni conocer el protocolo HTTP.
 *
 * Todas las entidades devueltas están ya normalizadas a entidades de dominio:
 * quien implemente el puerto es responsable de traducir el DTO crudo del
 * backend a los tipos aquí declarados.
 */

/** Repositorio del banco de ejercicios. */
export interface EjercicioRepository {
  /**
   * Lista los ejercicios con paginación, búsqueda y ordenación.
   *
   * @param query Parámetros de consulta del listado.
   * @param signal Señal de cancelación de la consulta.
   * @returns Página de ejercicios.
   */
  list(query: ListQuery, signal?: AbortSignal): Promise<Page<Ejercicio>>

  /**
   * Obtiene un ejercicio por su identificador.
   *
   * @param id Identificador del ejercicio.
   * @param signal Señal de cancelación de la consulta.
   * @returns El ejercicio solicitado.
   */
  getById(id: string, signal?: AbortSignal): Promise<Ejercicio>

  /**
   * Registra un ejercicio nuevo en el banco.
   *
   * @param ejercicio Datos del ejercicio a crear.
   * @returns El ejercicio creado, con su identificador asignado por el servidor.
   */
  create(ejercicio: Omit<Ejercicio, 'id' | 'creadoEn'>): Promise<Ejercicio>

  /**
   * Actualiza un ejercicio existente.
   *
   * @param id Identificador del ejercicio a modificar.
   * @param cambios Campos a actualizar.
   * @returns El ejercicio ya actualizado.
   */
  update(id: string, cambios: Partial<Omit<Ejercicio, 'id'>>): Promise<Ejercicio>

  /**
   * Elimina un ejercicio del banco.
   *
   * @param id Identificador del ejercicio.
   */
  remove(id: string): Promise<void>
}

/** Repositorio de programas de entrenamiento. */
export interface ProgramaRepository {
  /**
   * Lista los programas de entrenamiento.
   *
   * @param query Parámetros de consulta del listado.
   * @param signal Señal de cancelación de la consulta.
   * @returns Página de programas.
   */
  list(query: ListQuery, signal?: AbortSignal): Promise<Page<ProgramaEntrenamiento>>

  /**
   * Obtiene un programa por su identificador.
   *
   * @param id Identificador del programa.
   * @param signal Señal de cancelación de la consulta.
   * @returns El programa solicitado.
   */
  getById(id: string, signal?: AbortSignal): Promise<ProgramaEntrenamiento>
}

/** Repositorio de rutinas y de su estructura de bloques. */
export interface RutinaRepository {
  /**
   * Lista las rutinas, opcionalmente acotadas a un programa.
   *
   * @param query Parámetros de consulta del listado.
   * @param programaId Filtro opcional por programa de entrenamiento.
   * @param signal Señal de cancelación de la consulta.
   * @returns Página de rutinas.
   */
  list(query: ListQuery, programaId?: string, signal?: AbortSignal): Promise<Page<Rutina>>

  /**
   * Obtiene una rutina con su estructura completa de bloques.
   *
   * @param id Identificador de la rutina.
   * @param signal Señal de cancelación de la consulta.
   * @returns La rutina solicitada.
   */
  getById(id: string, signal?: AbortSignal): Promise<Rutina>

  /**
   * Solicita la generación automática de una rutina a partir de sus parámetros.
   *
   * @param solicitud Parámetros y ejercicios de partida.
   * @returns La rutina generada por el sistema.
   */
  generate(solicitud: unknown): Promise<Rutina>

  /**
   * Registra la validación (aprobación o rechazo) de una rutina.
   *
   * @param id Identificador de la rutina validada.
   * @param resultado Decisión del jefe de sala y observaciones.
   * @returns La rutina ya validada.
   */
  validate(id: string, resultado: unknown): Promise<Rutina>

  /**
   * Asigna una rutina a un cliente, impidiendo la asignación doble.
   *
   * @param rutinaId Identificador de la rutina.
   * @param clienteId Identificador del cliente.
   * @returns Confirmación de la asignación.
   */
  assign(rutinaId: string, clienteId: string): Promise<void>
}

/** Repositorio de clientes del gimnasio. */
export interface ClienteRepository {
  /**
   * Lista los clientes.
   *
   * @param query Parámetros de consulta del listado.
   * @param signal Señal de cancelación de la consulta.
   * @returns Página de clientes.
   */
  list(query: ListQuery, signal?: AbortSignal): Promise<Page<Cliente>>

  /**
   * Obtiene un cliente por su identificador.
   *
   * @param id Identificador del cliente.
   * @param signal Señal de cancelación de la consulta.
   * @returns El cliente solicitado.
   */
  getById(id: string, signal?: AbortSignal): Promise<Cliente>
}

/** Repositorio de entrenadores. */
export interface EntrenadorRepository {
  /**
   * Lista los entrenadores.
   *
   * @param query Parámetros de consulta del listado.
   * @param signal Señal de cancelación de la consulta.
   * @returns Página de entrenadores.
   */
  list(query: ListQuery, signal?: AbortSignal): Promise<Page<Entrenador>>

  /**
   * Obtiene un entrenador por su identificador.
   *
   * @param id Identificador del entrenador.
   * @param signal Señal de cancelación de la consulta.
   * @returns El entrenador solicitado.
   */
  getById(id: string, signal?: AbortSignal): Promise<Entrenador>
}

/** Repositorio de las sesiones de entrenamiento ejecutadas. */
export interface SesionRepository {
  /**
   * Lista las sesiones registradas.
   *
   * @param query Parámetros de consulta del listado.
   * @param clienteId Filtro opcional por cliente.
   * @param signal Señal de cancelación de la consulta.
   * @returns Página de sesiones.
   */
  list(
    query: ListQuery,
    clienteId?: string,
    signal?: AbortSignal,
  ): Promise<Page<SesionEntrenamiento>>

  /**
   * Registra una sesión ejecutada por un cliente.
   *
   * @param sesion Datos de la sesión a registrar.
   * @returns La sesión ya persistida.
   */
  register(sesion: Omit<SesionEntrenamiento, 'id'>): Promise<SesionEntrenamiento>
}

/** Repositorio de solicitudes de ajuste de rutina. */
export interface AjusteRepository {
  /**
   * Lista las solicitudes de ajuste.
   *
   * @param query Parámetros de consulta del listado.
   * @param signal Señal de cancelación de la consulta.
   * @returns Página de solicitudes.
   */
  list(query: ListQuery, signal?: AbortSignal): Promise<Page<SolicitudAjuste>>

  /**
   * Registra la solicitud de ajuste de un cliente, designando al entrenador.
   *
   * @param solicitud Datos de la solicitud.
   * @returns La solicitud ya registrada.
   */
  request(
    solicitud: Omit<SolicitudAjuste, 'id' | 'fechaSolicitud' | 'estado'>,
  ): Promise<SolicitudAjuste>

  /**
   * Guarda el resultado del ajuste manual realizado por el entrenador.
   *
   * @param id Identificador de la solicitud.
   * @param resultado Resultado y estado final de la solicitud.
   * @returns La solicitud ya resuelta.
   */
  resolve(id: string, resultado: unknown): Promise<SolicitudAjuste>
}

/** Repositorio de catálogos auxiliares: grupos musculares y sedes. */
export interface CatalogoRepository {
  /**
   * Lista los grupos musculares del sistema.
   *
   * @param signal Señal de cancelación de la consulta.
   * @returns Lista de grupos musculares.
   */
  gruposMusculares(signal?: AbortSignal): Promise<GrupoMuscular[]>
}

/** Repositorio de autenticación y sesión. */
export interface AuthRepository {
  /**
   * Autentica al usuario y devuelve su sesión.
   *
   * @param credenciales Correo y contraseña.
   * @returns Sesión iniciada con sus tokens y el perfil del usuario.
   */
  login(credenciales: { correo: string; password: string }): Promise<AuthSession>

  /**
   * Renueva el token de acceso de la sesión vigente.
   *
   * @param refreshToken Token de renovación vigente.
   * @returns Sesión con el token de acceso renovado.
   */
  refresh(refreshToken: string): Promise<AuthSession>

  /**
   * Cierra la sesión en el backend.
   *
   * @param accessToken Token de acceso vigente.
   */
  logout(accessToken: string): Promise<void>

  /**
   * Recupera el perfil del usuario autenticado.
   *
   * @param accessToken Token de acceso vigente.
   * @returns Perfil con los roles asignados.
   */
  me(accessToken: string): Promise<UserProfile>
}

/** Resultado de una operación de autenticación. */
export interface AuthSession {
  accessToken: string
  refreshToken: string | null
  /** Expiración del token de acceso, en epoch milisegundos. */
  expiresAt: number | null
  usuario: UserProfile
}
