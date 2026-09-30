/**
 * Contrato de almacenamiento clave-valor.
 *
 * Abstrae el mecanismo físico de persistencia en el navegador. Permite
 * implementar el patrón Strategy con distintas políticas (almacenamiento
 * local, almacenamiento de sesión, memoria) sin que el código de dominio
 * ——que consume tokens y preferencias—— dependa de la API concreta de
 * `window.localStorage`.
 */
export interface KeyValueStore {
  /**
   * Lee un valor almacenado.
   *
   * @param key Clave de lectura.
   * @returns El valor almacenado o `null` si la clave no existe.
   */
  get(key: string): string | null

  /**
   * Escribe un valor.
   *
   * @param key Clave de escritura.
   * @param value Valor a almacenar.
   */
  set(key: string, value: string): void

  /**
   * Elimina una clave.
   *
   * @param key Clave a eliminar.
   */
  remove(key: string): void

  /**
   * Comprueba la existencia de una clave.
   *
   * @param key Clave a comprobar.
   * @returns `true` si la clave está presente.
   */
  has(key: string): boolean

  /**
   * Vacía por completo el almacén.
   *
   * Se declara para que las implementaciones basadas en la interfaz `Storage`
   * de la Web API y las de memoria respeten el mismo contrato.
   */
  clear(): void
}

/**
 * Nombres de todas las claves utilizadas por la aplicación.
 *
 * Centralizarlas evita colisiones entre módulos y permite migrar el esquema de
 * almacenamiento en un único punto.
 */
export const STORAGE_KEYS = {
  /** Tokens de autenticación de la sesión actual. */
  ACCESS_TOKEN: 'bb2:auth:access_token',
  /** Token de renovación de la sesión. */
  REFRESH_TOKEN: 'bb2:auth:refresh_token',
  /** Datos del usuario autenticado. */
  USER_PROFILE: 'bb2:auth:user',
  /** Preferencia de tema (claro/oscuro/sistema). */
  THEME: 'bb2:theme',
  /** Columna y dirección de ordenación de las tablas de reportes. */
  TABLE_SORT: 'bb2:tables:sort',
  /** Último programa de entrenamiento seleccionado. */
  LAST_SELECTED_PROGRAM: 'bb2:preferences:last_program',
} as const

/** Unión de las claves válidas del almacenamiento. */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
