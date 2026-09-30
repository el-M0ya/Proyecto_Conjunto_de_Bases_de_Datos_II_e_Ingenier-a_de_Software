import { persistentStore, STORAGE_KEYS } from '../storage/storeFactory'

/**
 * Credenciales de la sesión del usuario.
 */
export interface SessionTokens {
  /** Token de acceso a los recursos de la API. */
  accessToken: string
  /** Token de renovación de la sesión. */
  refreshToken: string | null
  /** Instante de expiración del token de acceso, en epoch milisegundos. */
  expiresAt: number | null
}

/**
 * Estrategia de persistencia de los tokens de sesión.
 *
 * Aplica el patrón Strategy: el resto de la aplicación opera contra esta
 * interfaz, y la política concreta de almacenamiento (persistente, de
 * sesión o sólo en memoria) puede cambiarse sin tocar el código que la usa.
 * Adicionalmente, serializa y deserializa el token para centralizar el manejo
 * de errores de datos corruptos.
 */
export class TokenStorage {
  /** Almacén persistente donde se guardan los tokens. */
  private readonly store = persistentStore

  /**
   * Recupera la sesión almacenada.
   *
   * @returns Los tokens vigentes o `null` si no hay sesión o si el dato
   *   almacenado está corrupto.
   */
  getTokens(): SessionTokens | null {
    const raw = this.store.get(STORAGE_KEYS.ACCESS_TOKEN)
    if (!raw) {
      return null
    }

    try {
      const parsed = JSON.parse(raw) as Partial<SessionTokens>
      if (typeof parsed.accessToken !== 'string' || parsed.accessToken.length === 0) {
        // Dato corrupto: se descarta en lugar de propagar un estado inválido.
        this.clear()
        return null
      }
      return {
        accessToken: parsed.accessToken,
        refreshToken: typeof parsed.refreshToken === 'string' ? parsed.refreshToken : null,
        expiresAt: typeof parsed.expiresAt === 'number' ? parsed.expiresAt : null,
      }
    } catch {
      this.clear()
      return null
    }
  }

  /**
   * Persiste la sesión del usuario.
   *
   * @param tokens Tokens de acceso, renovación y expiración.
   */
  setTokens(tokens: SessionTokens): void {
    this.store.set(STORAGE_KEYS.ACCESS_TOKEN, JSON.stringify(tokens))
  }

  /**
   * Recupera únicamente el token de acceso.
   *
   * @returns El token de acceso vigente o `null`.
   */
  getAccessToken(): string | null {
    return this.getTokens()?.accessToken ?? null
  }

  /**
   * Actualiza el token de acceso tras una renovación de sesión, conservando el
   * resto de metadatos.
   *
   * @param accessToken Nuevo token de acceso.
   * @param expiresAt Nueva expiración, si el backend la informa.
   */
  updateAccessToken(accessToken: string, expiresAt: number | null = null): void {
    const current = this.getTokens()
    this.setTokens({
      accessToken,
      refreshToken: current?.refreshToken ?? null,
      expiresAt,
    })
  }

  /**
   * Comprueba si el token de acceso ha caducado.
   *
   * @param margenAnticipacionMs Margen de seguridad para renovar antes de la
   *   expiración real.
   * @returns `true` si no hay token o ha caducado.
   */
  isExpired(margenAnticipacionMs = 30_000): boolean {
    const tokens = this.getTokens()
    if (!tokens) {
      return true
    }
    if (tokens.expiresAt === null) {
      return false
    }
    return Date.now() >= tokens.expiresAt - margenAnticipacionMs
  }

  /** Elimina la sesión persistida. */
  clear(): void {
    this.store.remove(STORAGE_KEYS.ACCESS_TOKEN)
  }
}

/**
 * Instancia única de la estrategia de almacenamiento de tokens.
 *
 * Se exporta como objeto ya construido para evitar que múltiples módulos
 * compitan por escribir en el mismo almacén.
 */
export const tokenStorage = new TokenStorage()
