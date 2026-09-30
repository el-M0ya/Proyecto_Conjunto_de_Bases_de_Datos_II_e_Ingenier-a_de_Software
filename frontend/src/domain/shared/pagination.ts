/**
 * Contratos de paginación, ordenación y filtrado compartidos por el dominio.
 *
 * Todos los listados del sistema (ejercicios, rutinas, clientes, reportes)
 * comparten el mismo contrato de paginación y ordenación. Centralizarlo aquí
 * permite que un único componente de tabla reutilizable atienda todos los
 * reportes del enunciado, incluido el ordenamiento por columna.
 */

/** Sentido de ordenación de una columna. */
export const SORT_DIRECTIONS = ['asc', 'desc'] as const

/** Sentido de ordenación admitido. */
export type SortDirection = (typeof SORT_DIRECTIONS)[number]

/**
 * Criterio de ordenación de una consulta.
 */
export interface SortCriterion {
  /** Nombre del campo por el que se ordena. */
  field: string
  /** Sentido de ordenación. */
  direction: SortDirection
}

/** Parámetros de paginación de un listado. */
export interface PaginationParams {
  /** Número de página, empezando en 1. */
  page: number
  /** Registros por página. */
  pageSize: number
}

/**
 * Página de resultados de un listado paginado.
 *
 * @typeParam T Tipo de cada registro devuelto.
 */
export interface Page<T> {
  /** Registros de la página actual. */
  items: T[]
  /** Número de página actual (1-based). */
  page: number
  /** Tamaño de página aplicado. */
  pageSize: number
  /** Número total de registros que cumplen el filtro. */
  total: number
  /** Número total de páginas calculadas. */
  totalPages: number
}

/**
 * Parámetros de consulta de un listado paginado, ordenable y filtrable.
 */
export interface ListQuery extends PaginationParams {
  /** Texto de búsqueda libre. */
  search?: string
  /** Criterio de ordenación aplicado. */
  sort?: SortCriterion
  /** Filtros específicos del recurso (por ejemplo, grupo muscular o intensidad). */
  filters?: Record<string, string | number | boolean | null>
}

/**
 * Calcula el número total de páginas a partir del tamaño de página y el total
 * de registros, garantizando al menos una página aunque no haya resultados.
 *
 * @param total Número total de registros.
 * @param pageSize Tamaño de página aplicado.
 * @returns Número de páginas, mínimo 1.
 */
export function totalPagesOf(total: number, pageSize: number): number {
  if (pageSize <= 0) {
    return 1
  }
  return Math.max(1, Math.ceil(total / pageSize))
}
