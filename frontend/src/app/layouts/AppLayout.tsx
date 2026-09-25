import { Dumbbell, Moon, Sun } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useSession } from '@features/auth/context/SessionContext'
import { useTheme } from '@app/providers/ThemeProvider'
import { APP_ROUTES, PRIVATE_ROUTES } from '@core/config/routes'
import { ROLE_LABELS } from '@core/rbac/roles'
import { hasPermission, type Permission } from '@core/rbac/permissions'
import { Button } from '@shared/components/ui/Button'
import { cn } from '@shared/lib/cn'
import { initialsOf } from '@shared/lib/format'

/**
 * Marca del producto, visible en la cabecera y en la barra lateral.
 *
 * @param props Composición de la marca.
 * @param compact Variante reducida para la barra lateral.
 * @returns Logotipo renderizado.
 */
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-lg">
        <Dumbbell className="size-5" aria-hidden="true" />
      </span>
      {!compact && (
        <div className="leading-tight">
          <p className="text-sm font-semibold">Base de Batos</p>
          <p className="text-muted-foreground text-xs">Planes de entrenamiento</p>
        </div>
      )}
    </div>
  )
}

/**
 * Elemento del menú lateral.
 *
 * @param props Destino, etiqueta y permiso requerido.
 * @param to Ruta de destino.
 * @param label Etiqueta visible.
 * @param permission Permiso necesario para mostrar la opción.
 * @returns Enlace de navegación renderizado, o `null` si no hay acceso.
 */
function SidebarLink({
  to,
  label,
  permission,
}: {
  to: string
  label: string
  permission?: Permission
}) {
  const { user } = useSession()

  if (permission && !hasPermission(user?.roles ?? [], permission)) {
    return null
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'block rounded-md px-3 py-2 text-sm transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
        )
      }
    >
      {label}
    </NavLink>
  )
}

/**
 * Barra lateral de navegación.
 *
 * Filtra sus enlaces según los permisos del usuario autenticado, de modo que
 * el menú y las rutas protegidas comparten exactamente el mismo criterio de
 * autorización.
 *
 * @returns Barra lateral renderizada.
 */
function Sidebar() {
  return (
    <aside className="bg-sidebar hidden w-64 shrink-0 border-r lg:block">
      <div className="flex h-16 items-center border-b px-4">
        <Brand />
      </div>
      <nav aria-label="Navegación principal" className="flex flex-col gap-1 p-3">
        {PRIVATE_ROUTES.filter((route) => route.inMenu !== false).map((route) => (
          <SidebarLink
            key={route.path}
            to={route.path}
            label={route.label}
            permission={route.permissions?.[0]}
          />
        ))}
      </nav>
    </aside>
  )
}

/**
 * Cabecera superior con el tema, el perfil y la salida de la sesión.
 *
 * @returns Cabecera renderizada.
 */
function Topbar() {
  const { user, signOut } = useSession()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  /**
   * Cierra la sesión y devuelve al usuario a la pantalla de acceso.
   */
  const handleSignOut = async (): Promise<void> => {
    await signOut()
    await navigate(APP_ROUTES.login, { replace: true })
  }

  return (
    <header className="bg-card flex h-16 items-center justify-between gap-4 border-b px-4">
      <div className="lg:hidden">
        <Brand compact />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'}
        >
          {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </Button>

        <div className="flex items-center gap-3 rounded-lg px-2 py-1">
          <span className="bg-primary/15 text-primary grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold">
            {initialsOf(user?.nombre ?? 'Usuario')}
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium">{user?.nombre}</p>
            <p className="text-muted-foreground text-xs">
              {user?.roles.map((rol) => ROLE_LABELS[rol]).join(' · ')}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => void handleSignOut()}>
          Salir
        </Button>
      </div>
    </header>
  )
}

/**
 * Esqueleto de todas las pantallas autenticadas.
 *
 * Divide el espacio en barra lateral, cabecera y área de contenido. El área
 * central se declara como `Outlet`, de modo que cada ruta privada aporta su
 * propio contenido sin repetir la estructura.
 *
 * @returns Estructura de la aplicación renderizada.
 */
export function AppLayout() {
  return (
    <div className="bg-background flex h-full min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-x-hidden p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
