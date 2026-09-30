import type { Role } from '@core/rbac/roles'

/**
 * Entidades del dominio de «Base de Batos».
 *
 * Este módulo es deliberadamente puro: no conoce React, la capa HTTP ni
 * detalles de infraestructura. Describe únicamente el vocabulario del negocio
 * que comparte con la base de datos y con el backend, y que la interfaz
 * manipula.
 */

/** Nivel de intensidad de un ejercicio, según el enunciado del proyecto. */
export const INTENSITY_LEVELS = ['baja', 'media', 'alta'] as const

/** Nivel de intensidad admitido. */
export type IntensityLevel = (typeof INTENSITY_LEVELS)[number]

/** Tipo de ejercicio, según el enunciado del proyecto. */
export const EXERCISE_TYPES = ['fuerza', 'cardio', 'flexibilidad'] as const

/** Tipo de ejercicio admitido. */
export type ExerciseType = (typeof EXERCISE_TYPES)[number]

/** Estado del ciclo de vida de una rutina generada. */
export const ROUTINE_STATUSES = [
  'borrador',
  'pendiente_validacion',
  'aprobada',
  'rechazada',
] as const

/** Estado de una rutina. */
export type RoutineStatus = (typeof ROUTINE_STATUSES)[number]

/** Estado de una sesión de entrenamiento ejecutada por un cliente. */
export const SESSION_STATUSES = ['en_curso', 'completada', 'abandonada'] as const

/** Estado de una sesión. */
export type SessionStatus = (typeof SESSION_STATUSES)[number]

/** Estado de una solicitud de ajuste de rutina. */
export const ADJUSTMENT_STATUSES = ['pendiente', 'en_proceso', 'resuelta', 'rechazada'] as const

/** Estado de una solicitud de ajuste. */
export type AdjustmentStatus = (typeof ADJUSTMENT_STATUSES)[number]

/**
 * Identificadores de las entidades del dominio.
 *
 * Se modelan como cadenas opacas en lugar de `number` para no acoplar la
 * interfaz al tipo de clave de la base de datos, que todavía puede cambiar
 * durante el diseño del MERX.
 */
export type EntityId = string

/** Sede física del gimnasio a la que pertenece un cliente. */
export interface Sede {
  id: EntityId
  nombre: string
  direccion: string | null
  telefono: string | null
}

/** Grupo muscular cubierto por los ejercicios. */
export interface GrupoMuscular {
  id: EntityId
  nombre: string
  descripcion: string | null
}

/**
 * Programa de entrenamiento.
 *
 * Según el enunciado, cada programa tiene identificador único, nombre,
 * objetivo y la lista de grupos musculares a cubrir a lo largo del ciclo.
 */
export interface ProgramaEntrenamiento {
  id: EntityId
  nombre: string
  objetivo: string
  gruposMusculares: GrupoMuscular[]
  activo: boolean
}

/**
 * Entrenador.
 *
 * Según el enunciado se almacena identificador, nombre, especialidad y los
 * programas para los que está autorizado a generar o validar rutinas.
 */
export interface Entrenador {
  id: EntityId
  nombre: string
  especialidad: string
  programasAutorizados: EntityId[]
}

/** Ejercicio del banco de ejercicios. */
export interface Ejercicio {
  id: EntityId
  nombre: string
  descripcion: string | null
  tipo: ExerciseType
  intensidad: IntensityLevel
  gruposMusculares: GrupoMuscular[]
  /** Entrenador que ingresó el ejercicio en el banco. */
  autorId: EntityId
  creadoEn: string
}

/** Cliente del gimnasio. */
export interface Cliente {
  id: EntityId
  nombre: string
  edad: number
  sedeId: EntityId
  programasInscritos: EntityId[]
}

/**
 * Parámetros con los que se generó una rutina.
 *
 * El enunciado exige que la parametrización se almacene junto a la rutina
 * generada, de modo que el reporte pueda reconstruir los criterios utilizados.
 */
export interface ParametrosRutina {
  /** Proporción de ejercicios por tipo (fuerza, cardio, flexibilidad). */
  proporcionPorTipo: Partial<Record<ExerciseType, number>>
  /** Número de ejercicios por grupo muscular. */
  coberturaPorGrupoMuscular: Record<string, number>
  /** Número total de ejercicios de la rutina. */
  cantidadTotal: number
  /** Distribución deseada de niveles de intensidad. */
  distribucionIntensidad: Partial<Record<IntensityLevel, number>>
}

/** Bloque de la estructura variable de una rutina. */
export interface BloqueRutina {
  id: EntityId
  /** Tipo de bloque (calentamiento, circuito, series, descanso, enfriamiento). */
  tipo: string
  titulo: string
  /** Ejercicios incluidos en el bloque. */
  ejercicios: Ejercicio[]
  /** Número de repeticiones o de vueltas del bloque. */
  repeticiones: number | null
  /** Descanso en segundos entre ejecuciones del bloque. */
  descansoSegundos: number | null
  /** Bloques anidados, para circuitos compuestos. */
  bloquesHijo: BloqueRutina[]
}

/**
 * Rutina de entrenamiento.
 *
 * La estructura de bloques es de esquema variable por decisión explícita del
 * enunciado: se conserva como documento independiente, con su propia forma,
 * en lugar de ajustarse a un esquema relacional común.
 */
export interface Rutina {
  id: EntityId
  nombre: string
  programaId: EntityId
  /** Entrenador que generó la rutina. */
  creadorId: EntityId
  /** Jefe de sala que validó la rutina, si ya fue validada. */
  validadorId: EntityId | null
  estado: RoutineStatus
  parametros: ParametrosRutina
  bloques: BloqueRutina[]
  fechaCreacion: string
  fechaValidacion: string | null
  observacionesValidacion: string | null
}

/** Sesión de entrenamiento registrada por un cliente. */
export interface SesionEntrenamiento {
  id: EntityId
  rutinaId: EntityId
  clienteId: EntityId
  fecha: string
  estado: SessionStatus
  /** Proporción de ejercicios completados, entre 0 y 1. */
  tasaFinalizacion: number
  duracionMinutos: number | null
}

/** Solicitud de ajuste de rutina presentada por un cliente. */
export interface SolicitudAjuste {
  id: EntityId
  rutinaId: EntityId
  clienteId: EntityId
  /** Entrenador que el cliente designa para ejecutar el ajuste. */
  entrenadorDesignadoId: EntityId
  motivo: string
  estado: AdjustmentStatus
  /** Resultado del ajuste manual realizado. */
  resultado: string | null
  fechaSolicitud: string
  fechaResolucion: string | null
}

/**
 * Perfil del usuario autenticado.
 *
 * Combina los datos de acceso con los del rol concreto, que el backend resuelve
 * según el tipo de usuario registrado.
 */
export interface UserProfile {
  id: EntityId
  nombre: string
  correo: string
  roles: Role[]
  /** Identificador de la entidad de dominio asociada (cliente, entrenador...). */
  perfilId: EntityId | null
}
