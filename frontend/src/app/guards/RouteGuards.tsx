import { useSession } from '@features/auth/context/SessionContext'
import { hasPermission } from '@core/rbac/permissions'
import type { Permission } from '@core/rbac/permissions'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { APP_ROUTES } from '@core/config/routes'
import { LoadingState } from '@shared/components/feedback/States'

/**
 * Guardia de rutas privadas (patrón Guard).
 *
 * Se ejecuta antes de montar la pantalla y decide entre dejar pasar al
 * contenido, redirigir al inicio de sesión o mostrar un estado de espera
 * mientras se restaura la sesión. Al conservar la ruta solicitada en el
 * estado de la navegación, el usuario vuelve a ella tras autenticarse en
 * lugar de aterrizar siempre en el panel.
 *
 * @returns Contenido protegido, redirección o estado de carga.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useSession()
  const location = useLocation()

  if (isLoading) {
    return <LoadingState className="min-h-screen" />
  }

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.login} state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}

/**
 * Guardia de permisos (patrón Guard).
 *
 * Se declara en el árbol de rutas junto a cada pantalla que exige un
 * permiso concreto. Devuelve la pantalla de «no autorizado» en lugar de
 * redirigir, para que el usuario entienda por qué no puede acceder.
 *
 * @param props Permiso exigido y contenido protegido.
 * @param permission Permiso que el usuario debe tener.
 * @param children Contenido de la ruta protegida.
 * @returns Contenido autorizado o mensaje de acceso denegado.
 */
export function PermissionRoute({
  permission,
  children,
}: {
  permission: Permission
  children: ReactNode
}) {
  const { user } = useSession()

  if (!hasPermission(user?.roles ?? [], permission)) {
    return <ForbiddenState />
  }

  return children
}

/**
 * Pantalla mostrada cuando el usuario carece de permisos.
 *
 * @returns Mensaje de acceso denegado.
 */
export function ForbiddenState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
      <p className="text-lg font-semibold">Acceso denegado</p>
      <p className="text-muted-foreground max-w-md text-sm">
        Tu perfil no tiene permisos para consultar esta sección. Si crees que se trata de un error,
        comunícate con el administrador del gimnasio.
      </p>
    </div>
  )
}
