import type { KeyValueStore } from './KeyValueStore'

/**
 * Implementación de {@link KeyValueStore} sobre la interfaz `Storage` de la
 * Web API (`localStorage` o `sessionStorage`).
 *
 * Todos los métodos son tolerantes a fallos: en modo incógnito, con cookies
 * bloqueadas o al superar la cuota, el navegador puede lanzar
 * `SecurityError` o `QuotaExceededError`. En esos casos la aplicación
 * continúa funcionando con una degradación silenciosa en lugar de romperse.
 */
export class WebStorageStore implements KeyValueStore {
  /** Referencia al almacén de la Web API. */
  private readonly storage: Storage

  /**
   * Crea un almacén sobre la interfaz `Storage` de la Web API.
   *
   * @param storage Almacén de destino (`window.localStorage`, etc.).
   */
  constructor(storage: Storage) {
    this.storage = storage
  }

  /**
   * Lee un valor almacenado.
   *
   * @param key Clave de lectura.
   * @returns El valor almacenado o `null` si no existe o no se puede leer.
   */
  get(key: string): string | null {
    try {
      return this.storage.getItem(key)
    } catch {
      return null
    }
  }

  /**
   * Escribe un valor.
   *
   * @param key Clave de escritura.
   * @param value Valor a almacenar.
   */
  set(key: string, value: string): void {
    try {
      this.storage.setItem(key, value)
    } catch {
      // Cuota superada o almacenamiento bloqueado: la sesión seguirá en memoria.
    }
  }

  /**
   * Elimina una clave.
   *
   * @param key Clave a eliminar.
   */
  remove(key: string): void {
    try {
      this.storage.removeItem(key)
    } catch {
      // Sin efecto si el almacenamiento no está disponible.
    }
  }

  /**
   * Comprueba la existencia de una clave.
   *
   * @param key Clave a comprobar.
   * @returns `true` si la clave está presente.
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /** Vacía por completo el almacén. */
  clear(): void {
    try {
      this.storage.clear()
    } catch {
      // Sin efecto si el almacenamiento no está disponible.
    }
  }
}
