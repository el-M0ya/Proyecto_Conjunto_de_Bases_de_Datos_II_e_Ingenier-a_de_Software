import type { Role } from '@core/rbac/roles'
import { hasAnyRole, hasPermission, type Permission } from '@core/rbac/permissions'
import type { AuthSession } from '@domain/repositories'
import { container } from '@core/di/container'
import { tokenStorage } from '@core/auth/tokenStorage'
import type { UserProfile } from '@domain/entities'

/**
 * Estado de la sesión visible para la interfaz.
 */
export interface SessionState {
  /** Perfil del usuario autenticado, o `null` si no hay sesión. */
  user: UserProfile | null
  /** Indica si la comprobación inicial de sesión sigue en curso. */
  isLoading: boolean
  /** `true` si hay un usuario autenticado. */
  isAuthenticated: boolean
}

/**
 * Fachada de la sesión de usuario (patrón Facade).
 *
 * Concentra en un único objeto todas las operaciones relacionadas con la
 * sesión: restaurar, autenticar, renovar, cerrar y consultar permisos. Los
 * componentes no necesitan saber si la sesión vive en `localStorage`, si el
 * token se renueva con un `refresh` o de dónde procede el perfil.
 *
 * @example
 * ```ts
 * const session = useSession()
 * await session.signIn({ correo, password })
 * if (session.hasPermission(PERMISSIONS.ROUTINE_VALIDATE)) { ... }
 * ```
 */
export class SessionFacade {
  /**
   * Recupera la sesión persistida, si todavía es válida.
   *
   * Si el token ha caducado pero existe un token de renovación, intenta
   * renovarlo antes de darla por perdida: evita que el usuario tenga que
   * autenticarse de nuevo al recargar la página.
   *
   * @returns La sesión recuperada o `null` si no hay sesión utilizable.
   */
  async restore(): Promise<AuthSession | null> {
    const tokens = tokenStorage.getTokens()
    if (!tokens) {
      return null
    }

    if (!tokenStorage.isExpired()) {
      // El token sigue vigente: basta con recuperar el perfil.
      return this.hydrate(tokens.accessToken)
    }

    if (tokens.refreshToken) {
      try {
        return await container.auth.refresh(tokens.refreshToken)
      } catch {
        tokenStorage.clear()
        return null
      }
    }

    tokenStorage.clear()
    return null
  }

  /**
   * Autentica al usuario y persiste la sesión.
   *
   * @param credenciales Correo y contraseña introducidos por el usuario.
   * @returns La sesión iniciada.
   */
  async signIn(credenciales: { correo: string; password: string }): Promise<AuthSession> {
    return container.auth.login(credenciales)
  }

  /**
   * Cierra la sesión, descartando los tokens locales.
   *
   * La limpieza local se ejecuta en un `finally` aunque la llamada remota
   * falle: el usuario debe poder salir de la aplicación aunque el servidor no
   * responda, y la fachada es la propietaria del estado de sesión, de modo que
   * la garantía no puede delegarse en una implementación concreta.
   *
   * @returns Promesa resuelta cuando la sesión ha quedado cerrada.
   */
  async signOut(): Promise<void> {
    const token = tokenStorage.getAccessToken()
    try {
      if (token) {
        await container.auth.logout(token)
      }
    } finally {
      tokenStorage.clear()
    }
  }

  /**
   * Renueva el token de acceso de la sesión vigente.
   *
   * @returns La sesión renovada, o `null` si no era posible renovarla.
   */
  async refresh(): Promise<AuthSession | null> {
    const tokens = tokenStorage.getTokens()
    if (!tokens?.refreshToken) {
      return null
    }

    try {
      return await container.auth.refresh(tokens.refreshToken)
    } catch {
      tokenStorage.clear()
      return null
    }
  }

  /**
   * Descarga el perfil del usuario a partir de un token de acceso.
   *
   * @param accessToken Token de acceso vigente.
   * @returns El perfil del usuario.
   */
  async fetchProfile(accessToken: string): Promise<UserProfile> {
    return container.auth.me(accessToken)
  }

  /**
   * Indica si el usuario tiene un permiso concreto.
   *
   * @param user Perfil del usuario, o `null` si no hay sesión.
   * @param permission Permiso a comprobar.
   * @returns `true` si al menos uno de los roles del usuario lo incluye.
   */
  hasPermission(user: UserProfile | null, permission: Permission): boolean {
    return user !== null && hasPermission(user.roles, permission)
  }

  /**
   * Indica si el usuario tiene alguno de los roles indicados.
   *
   * @param user Perfil del usuario, o `null` si no hay sesión.
   * @param acceptedRoles Roles admitidos.
   * @returns `true` si hay intersección entre los roles del usuario y los indicados.
   */
  hasAnyRole(user: UserProfile | null, acceptedRoles: readonly Role[]): boolean {
    return user !== null && hasAnyRole(user.roles, acceptedRoles)
  }

  /**
   * Recupera el perfil asociado a un token de acceso.
   *
   * @param accessToken Token de acceso vigente.
   * @returns Sesión con el perfil descargado, o `null` si el token ya no es válido.
   */
  private async hydrate(accessToken: string): Promise<AuthSession | null> {
    const tokens = tokenStorage.getTokens()
    try {
      const usuario = await this.fetchProfile(accessToken)
      return {
        accessToken,
        refreshToken: tokens?.refreshToken ?? null,
        expiresAt: tokens?.expiresAt ?? null,
        usuario,
      }
    } catch {
      tokenStorage.clear()
      return null
    }
  }
}

/**
 * Fachada de sesión compartida por toda la aplicación.
 */
export const sessionFacade = new SessionFacade()
