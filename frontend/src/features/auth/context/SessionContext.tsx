import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Permission } from '@core/rbac/permissions'
import type { Role } from '@core/rbac/roles'
import type { UserProfile } from '@domain/entities'
import { sessionFacade, type SessionState } from '../services/SessionFacade'

/**
 * Valor que expone el proveedor de sesión a la aplicación.
 */
export interface SessionContextValue extends SessionState {
  /** Autentica al usuario y actualiza el estado de sesión. */
  signIn: (credenciales: { correo: string; password: string }) => Promise<void>
  /** Cierra la sesión y limpia el estado. */
  signOut: () => Promise<void>
  /** Indica si el usuario tiene un permiso concreto. */
  hasPermission: (permission: Permission) => boolean
  /** Indica si el usuario tiene alguno de los roles indicados. */
  hasAnyRole: (roles: readonly Role[]) => boolean
}

/**
 * Contexto de sesión.
 *
 * Se declara fuera del componente para que su valor no se regenere en cada
 * renderizado y para poder consumirlo desde cualquier utility.
 */
export const SessionContext = createContext<SessionContextValue | null>(null)

/**
 * Proveedor de sesión (patrón Provider).
 *
 * Es el único responsable de mantener en memoria el estado de autenticación.
 * Cualquier componente que necesite conocer la sesión, o comprobar un permiso,
 * lo obtiene a través de {@link useSession}, sin necesidad de recibir props.
 *
 * @param props Componentes hijos que forman parte de la sesión.
 * @param children Árbol de la aplicación.
 * @returns El proveedor con su valor de contexto.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Al montar, se intenta restaurar la sesión persistida para no obligar al
  // usuario a autenticarse en cada recarga.
  useEffect(() => {
    let cancelled = false

    /**
     * Restaura la sesión persistida y refleja el resultado en el estado.
     *
     * @returns Promesa resuelta cuando la comprobación ha terminado.
     */
    const restore = async (): Promise<void> => {
      const session = await sessionFacade.restore()
      if (cancelled) {
        return
      }
      setUser(session?.usuario ?? null)
      setIsLoading(false)
    }

    void restore()

    return () => {
      cancelled = true
    }
  }, [])

  /**
   * Autentica al usuario y refleja el resultado en el estado de sesión.
   *
   * @param credenciales Correo y contraseña introducidos por el usuario.
   * @throws {AppError} Si las credenciales son rechazadas por el backend.
   */
  const signIn = useCallback(async (credenciales: { correo: string; password: string }) => {
    const session = await sessionFacade.signIn(credenciales)
    setUser(session.usuario)
  }, [])

  /**
   * Cierra la sesión y deja el estado de autenticación limpio.
   */
  const signOut = useCallback(async () => {
    await sessionFacade.signOut()
    setUser(null)
  }, [])

  /**
   * Comprueba un permiso sobre el usuario autenticado.
   *
   * @param permission Permiso a comprobar.
   * @returns `true` si el usuario lo posee.
   */
  const hasPermission = useCallback(
    (permission: Permission) => sessionFacade.hasPermission(user, permission),
    [user],
  )

  /**
   * Comprueba si el usuario tiene alguno de los roles indicados.
   *
   * @param roles Roles admitidos.
   * @returns `true` si hay coincidencia.
   */
  const hasAnyRole = useCallback(
    (roles: readonly Role[]) => sessionFacade.hasAnyRole(user, roles),
    [user],
  )

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      signIn,
      signOut,
      hasPermission,
      hasAnyRole,
    }),
    [user, isLoading, signIn, signOut, hasPermission, hasAnyRole],
  )

  return <SessionContext value={value}>{children}</SessionContext>
}

/**
 * Consume el estado de la sesión.
 *
 * Lanza un error explícito si se usa fuera del proveedor: es un fallo de
 * cableado que conviene hacer visible de inmediato y no enmascarar con un
 * valor por defecto que ocultaría el problema.
 *
 * @returns El valor del contexto de sesión.
 * @throws {Error} Si el hook se invoca fuera de {@link SessionProvider}.
 */
export function useSession(): SessionContextValue {
  const context = use(SessionContext)
  if (context === null) {
    throw new Error('useSession debe usarse dentro de un <SessionProvider>')
  }
  return context
}
