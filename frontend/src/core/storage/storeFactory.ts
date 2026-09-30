import { InMemoryStore } from './InMemoryStore'
import type { KeyValueStore } from './KeyValueStore'
import { WebStorageStore } from './WebStorageStore'

export { STORAGE_KEYS, type StorageKey } from './KeyValueStore'

/**
 * Fábrica de almacenes clave-valor.
 *
 * Aplica el patrón Factory: decide en un único punto qué implementación de
 * {@link KeyValueStore} se entrega al resto de la aplicación. Cambiar la
 * política de persistencia (por ejemplo, migrar a IndexedDB) sólo requiere
 * modificar esta función.
 *
 * @param storeName Almacén de la Web API deseado.
 * @returns Instancia de {@link InMemoryStore} si el almacén solicitado no está
 *   disponible (por ejemplo, cuando el navegador bloquea las cookies).
 */
function createStore(storeName: 'localStorage' | 'sessionStorage'): KeyValueStore {
  try {
    const storage = window[storeName]
    // Acceso de prueba: en algunos navegadores el objeto existe pero lanza al
    // leerlo cuando las cookies están deshabilitadas.
    const probeKey = '__bb2_probe__'
    storage.setItem(probeKey, '1')
    storage.removeItem(probeKey)
    return new WebStorageStore(storage)
  } catch {
    return new InMemoryStore()
  }
}

/**
 * Almacenamiento persistente entre recargas de la página.
 *
 * Se usa para el token de acceso, la perfil del usuario y las preferencias de
 * la interfaz.
 */
export const persistentStore: KeyValueStore = createStore('localStorage')

/**
 * Almacenamiento limitado al pestaña actual.
 *
 * Se reserva para datos sensibles de corta vida o para comprobaciones
 * intermedias que no deben sobrevivir al cierre de la pestaña.
 */
export const sessionStore: KeyValueStore = createStore('sessionStorage')
