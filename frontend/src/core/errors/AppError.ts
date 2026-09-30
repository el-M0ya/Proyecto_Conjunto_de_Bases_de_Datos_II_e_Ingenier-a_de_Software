/**
 * Jerarquía de errores de la aplicación.
 *
 * Modelar los fallos como tipos explícitos, en lugar de propagar `Error`
 * genéricos, permite que la capa de presentación distinga entre un fallo de
 * red, una sesión expirada o un error de validación del servidor, mostrando
 * cada caso con la respuesta adecuada.
 */

/** Categorías de fallo que la interfaz sabe cómo representar. */
export const ERROR_CATEGORIES = {
  /** Fallo de red: sin conexión, servidor inalcanzable o tiempo de espera agotado. */
  NETWORK: 'network',
  /** El servidor rechazó las credenciales o la sesión expiró. */
  UNAUTHORIZED: 'unauthorized',
  /** El usuario autenticado no tiene permiso para la operación. */
  FORBIDDEN: 'forbidden',
  /** El recurso solicitado no existe. */
  NOT_FOUND: 'not_found',
  /** Los datos enviados no cumplen las reglas de negocio del servidor. */
  VALIDATION: 'validation',
  /** Conflicto con el estado actual del recurso (duplicados, asignación doble). */
  CONFLICT: 'conflict',
  /** Fallo interno del servidor. */
  SERVER: 'server',
  /** Fallo no tipificado. */
  UNKNOWN: 'unknown',
} as const

/** Unión de las categorías de fallo. */
export type ErrorCategory = (typeof ERROR_CATEGORIES)[keyof typeof ERROR_CATEGORIES]

/** Error de aplicación con metadatos de contexto y respuesta del servidor. */
export class AppError extends Error {
  /** Categoría del fallo, utilizada por la interfaz para elegir la representación. */
  readonly category: ErrorCategory

  /** Código estable emitido por la API, útil para i18n y para trazas. */
  readonly code: string

  /** Estado HTTP asociado al fallo, si lo hubo. */
  readonly status: number | null

  /** Detalle adicional devuelto por el servidor (validaciones, campos, etc.). */
  readonly details: unknown

  /**
   * Crea un error de aplicación con sus metadatos.
   *
   * @param message Mensaje legible para el usuario final.
   * @param options Metadatos opcionales del error.
   */
  constructor(
    message: string,
    options: {
      category?: ErrorCategory
      code?: string
      status?: number | null
      details?: unknown
      cause?: unknown
    } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'AppError'
    this.category = options.category ?? ERROR_CATEGORIES.UNKNOWN
    this.code = options.code ?? 'UNKNOWN_ERROR'
    this.status = options.status ?? null
    this.details = options.details ?? null
  }

  /**
   * Indica si el fallo se debe a la ausencia o caducidad de la sesión.
   *
   * @returns `true` para errores de autenticación.
   */
  get isAuthError(): boolean {
    return this.category === ERROR_CATEGORIES.UNAUTHORIZED
  }
}

/**
 * Traduce un fallo HTTP a su categoría de dominio.
 *
 * @param status Código de estado HTTP de la respuesta.
 * @returns La categoría de error correspondiente.
 */
export function categoryFromStatus(status: number): ErrorCategory {
  switch (status) {
    case 400:
    case 422:
      return ERROR_CATEGORIES.VALIDATION
    case 401:
      return ERROR_CATEGORIES.UNAUTHORIZED
    case 403:
      return ERROR_CATEGORIES.FORBIDDEN
    case 404:
      return ERROR_CATEGORIES.NOT_FOUND
    case 409:
      return ERROR_CATEGORIES.CONFLICT
    default:
      return status >= 500 ? ERROR_CATEGORIES.SERVER : ERROR_CATEGORIES.UNKNOWN
  }
}

/**
 * Normaliza cualquier excepción a un {@link AppError}.
 *
 * @param error Excepción capturada, de tipo desconocido.
 * @param fallbackMessage Mensaje a usar cuando el error no aporta información.
 * @returns Instancia de {@link AppError} con metadatos coherentes.
 */
export function toAppError(error: unknown, fallbackMessage = 'Error inesperado'): AppError {
  if (error instanceof AppError) {
    return error
  }
  if (error instanceof Error) {
    return new AppError(error.message || fallbackMessage, { cause: error })
  }
  return new AppError(fallbackMessage, { details: error })
}
