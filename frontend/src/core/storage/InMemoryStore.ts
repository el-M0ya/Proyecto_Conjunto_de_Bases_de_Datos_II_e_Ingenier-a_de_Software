import type { KeyValueStore } from './KeyValueStore'

/**
 * Implementación de {@link KeyValueStore} respaldada por un `Map` en memoria.
 *
 * Cumple dos papeles:
 * 1. Degrada de forma segura la aplicación cuando el navegador no permite
 *    usar `localStorage` (por ejemplo, con el almacenamiento bloqueado).
 * 2. Proporciona un almacén limpio y aislado en las pruebas unitarias, sin
 *    necesidad de limpiar el estado global entre casos.
 */
export class InMemoryStore implements KeyValueStore {
  /** Mapa interno que actúa como almacén. */
  private readonly entries = new Map<string, string>()

  /**
   * Lee un valor almacenado.
   *
   * @param key Clave de lectura.
   * @returns El valor almacenado o `null` si no existe.
   */
  get(key: string): string | null {
    return this.entries.get(key) ?? null
  }

  /**
   * Escribe un valor.
   *
   * @param key Clave de escritura.
   * @param value Valor a almacenar.
   */
  set(key: string, value: string): void {
    this.entries.set(key, value)
  }

  /**
   * Elimina una clave.
   *
   * @param key Clave a eliminar.
   */
  remove(key: string): void {
    this.entries.delete(key)
  }

  /**
   * Comprueba la existencia de una clave.
   *
   * @param key Clave a comprobar.
   * @returns `true` si la clave está presente.
   */
  has(key: string): boolean {
    return this.entries.has(key)
  }

  /** Vacía por completo el almacén. */
  clear(): void {
    this.entries.clear()
  }
}
