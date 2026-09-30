import { APP_ROUTES, PRIVATE_ROUTES, dashboardRouteForRoles } from '@core/config/routes'
import { PERMISSIONS } from '@core/rbac/permissions'
import { ROLES } from '@core/rbac/roles'
import { describe, expect, it } from 'vitest'

describe('registro de rutas', () => {
  it('no declara rutas duplicadas', () => {
    const paths = PRIVATE_ROUTES.map((route) => route.path)

    expect(new Set(paths).size).toBe(paths.length)
  })

  it('mantiene el prefijo del panel en todas las rutas privadas', () => {
    for (const route of PRIVATE_ROUTES) {
      expect(route.path.startsWith(APP_ROUTES.dashboard)).toBe(true)
    }
  })

  it('exige autenticación en el panel, que no es una ruta pública', () => {
    expect(APP_ROUTES.dashboard).not.toBe(APP_ROUTES.login)
    expect(APP_ROUTES.login).toBe('/login')
  })

  it('asocia a cada ruta protegida un permiso real del catálogo', () => {
    const permisosDeclarados = Object.values(PERMISSIONS)

    for (const route of PRIVATE_ROUTES) {
      for (const permiso of route.permissions ?? []) {
        expect(permisosDeclarados).toContain(permiso)
      }
    }
  })

  it('exige permiso de administrador para la sección de administración', () => {
    const admin = PRIVATE_ROUTES.find((route) => route.path === APP_ROUTES.admin)

    expect(admin?.permissions).toContain(PERMISSIONS.USER_MANAGE)
  })

  it('registra también las pantallas de detalle, aunque no vayan en el menú', () => {
    const detalle = PRIVATE_ROUTES.find((route) => route.path === APP_ROUTES.routineDetail)

    // El enrutador resuelve estas rutas al construir el árbol, así que omittinglas
    // del registro provoca un fallo en tiempo de ejecución.
    expect(detalle).toBeDefined()
    expect(detalle?.inMenu).toBe(false)
  })

  it('ofrece en el menú únicamente las rutas marcadas como tales', () => {
    const enMenu = PRIVATE_ROUTES.filter((route) => route.inMenu !== false)

    expect(enMenu.every((route) => !route.path.includes(':'))).toBe(true)
    expect(enMenu.length).toBeLessThan(PRIVATE_ROUTES.length)
  })
})

describe('destino tras autenticarse', () => {
  it('lleva al administrador a su panel', () => {
    expect(dashboardRouteForRoles([ROLES.ADMIN])).toBe(APP_ROUTES.dashboard)
  })

  it('lleva al jefe de sala a la validación de rutinas', () => {
    expect(dashboardRouteForRoles([ROLES.JEFE_SALA])).toBe(APP_ROUTES.routineValidation)
  })

  it('lleva al entrenador a la generación de rutinas', () => {
    expect(dashboardRouteForRoles([ROLES.ENTRENADOR])).toBe(APP_ROUTES.routineGenerator)
  })

  it('lleva al cliente a sus rutinas', () => {
    expect(dashboardRouteForRoles([ROLES.CLIENTE])).toBe(APP_ROUTES.routines)
  })

  it('respeta la precedencia cuando el usuario acumula varios roles', () => {
    expect(dashboardRouteForRoles([ROLES.CLIENTE, ROLES.ADMIN])).toBe(APP_ROUTES.dashboard)
    expect(dashboardRouteForRoles([ROLES.CLIENTE, ROLES.JEFE_SALA])).toBe(
      APP_ROUTES.routineValidation,
    )
  })

  it('cae en las rutinas ante un conjunto de roles vacío', () => {
    expect(dashboardRouteForRoles([])).toBe(APP_ROUTES.routines)
  })
})
