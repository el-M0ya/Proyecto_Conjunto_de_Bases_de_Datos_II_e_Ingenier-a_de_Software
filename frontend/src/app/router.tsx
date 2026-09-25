import { Navigate, createBrowserRouter } from 'react-router-dom'
import { PermissionRoute, ProtectedRoute } from './guards/RouteGuards'
import { AppLayout } from './layouts/AppLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { DashboardPage } from '@features/dashboard/pages/DashboardPage'
import { ErrorPage } from './pages/ErrorPage'
import { LoadingState } from '@shared/components/feedback/States'
import { LoginPage } from '@features/auth/pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PlaceholderPage } from '@features/shared/pages/PlaceholderPage'
import { APP_ROUTES, PRIVATE_ROUTES, dashboardRouteForRoles } from '@core/config/routes'
import { PERMISSIONS } from '@core/rbac/permissions'
import { useSession } from '@features/auth/context/SessionContext'
import type { RouteDefinition } from '@core/config/routes'

/**
 * Busca la definición de una ruta en el registro central.
 *
 * Garantiza que toda pantalla del enrutador tenga su entrada correspondiente en
 * {@link PRIVATE_ROUTES}, que es la única fuente de verdad compartida con el
 * menú lateral y con los guardas de permisos. Añadir una pantalla obliga, por
 * tanto, a declararla una sola vez.
 *
 * @param path Ruta absoluta a localizar.
 * @returns Definición de la ruta.
 * @throws {Error} Si la ruta no está declarada en el registro.
 */
function findRoute(path: string): RouteDefinition {
  const route = PRIVATE_ROUTES.find((candidate) => candidate.path === path)
  if (!route) {
    throw new Error(`La ruta "${path}" no está declarada en PRIVATE_ROUTES`)
  }
  return route
}

/**
 * Redirige la raíz de la aplicación al destino que corresponde al usuario.
 *
 * Evita que un usuario autenticado vuelva al formulario de acceso y que uno
 * anónimo aterrice en una pantalla que no puede ver.
 *
 * @returns Componente de redirección.
 */
function NavigateToApp() {
  const { isAuthenticated, isLoading, user } = useSession()

  if (isLoading) {
    return <LoadingState className="min-h-screen" />
  }

  const destination = isAuthenticated ? dashboardRouteForRoles(user?.roles ?? []) : APP_ROUTES.login

  // `replace` impide que la raíz quede en el historial del navegador.
  return <Navigate to={destination} replace />
}

/**
 * Enrutador de la aplicación.
 *
 * El árbol se declara una única vez y se apoya en piezas reutilizables
 * (`ProtectedRoute`, `PermissionRoute` y `AppLayout`), de modo que la
 * autorización y la estructura visual no se repiten en cada pantalla.
 *
 * Las pantallas cuya funcionalidad todavía no existe se sirven con
 * {@link PlaceholderPage}, que es trivial y no penaliza la descarga inicial.
 * Cuando cada módulo se implemente, su página pasará a cargarse con
 * `lazyPage` (ver `app/router/lazyPage.tsx`) para que la descarga inicial se
 * limite al esqueleto, la autenticación y el panel; es la vía prevista para
 * que los reportes con gráficos y la exportación a PDF no penalicen al resto
 * de usuarios.
 *
 * @returns Instancia del enrutador lista para montar.
 */
export const router = createBrowserRouter([
  {
    // Rutas públicas.
    path: APP_ROUTES.root,
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <NavigateToApp /> },
      { path: 'login', element: <LoginPage /> },
    ],
  },
  {
    // Árbol de rutas privadas: exige sesión iniciada.
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: APP_ROUTES.dashboard.slice(1),
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          {
            path: 'ejercicios',
            element: <PlaceholderPage route={findRoute(APP_ROUTES.exercises)} />,
          },
          {
            path: 'programas',
            element: <PlaceholderPage route={findRoute(APP_ROUTES.programs)} />,
          },
          {
            path: 'rutinas',
            element: <PlaceholderPage route={findRoute(APP_ROUTES.routines)} />,
          },
          {
            path: 'rutinas/generar',
            element: <PlaceholderPage route={findRoute(APP_ROUTES.routineGenerator)} />,
          },
          {
            path: 'rutinas/validacion',
            element: <PlaceholderPage route={findRoute(APP_ROUTES.routineValidation)} />,
          },
          {
            path: 'rutinas/:rutinaId',
            element: <PlaceholderPage route={findRoute(APP_ROUTES.routineDetail)} />,
          },
          {
            path: 'ajustes',
            element: (
              <PermissionRoute permission={PERMISSIONS.ADJUSTMENT_REQUEST}>
                <PlaceholderPage route={findRoute(APP_ROUTES.adjustments)} />
              </PermissionRoute>
            ),
          },
          {
            path: 'clientes',
            element: <PlaceholderPage route={findRoute(APP_ROUTES.clients)} />,
          },
          {
            path: 'entrenadores',
            element: <PlaceholderPage route={findRoute(APP_ROUTES.trainers)} />,
          },
          {
            path: 'sesiones',
            element: <PlaceholderPage route={findRoute(APP_ROUTES.sessions)} />,
          },
          {
            path: 'reportes',
            element: (
              <PermissionRoute permission={PERMISSIONS.REPORT_READ}>
                <PlaceholderPage route={findRoute(APP_ROUTES.reports)} />
              </PermissionRoute>
            ),
          },
          {
            path: 'administracion',
            element: (
              <PermissionRoute permission={PERMISSIONS.USER_MANAGE}>
                <PlaceholderPage route={findRoute(APP_ROUTES.admin)} />
              </PermissionRoute>
            ),
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
