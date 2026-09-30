import { ROLES } from '@core/rbac/roles'
import { PERMISSIONS, type Permission } from '@core/rbac/permissions'

/**
 * Registro de rutas de la aplicación.
 *
 * Cada ruta declara los roles y permisos que admite, de forma que la
 * autorización de navegación y la visibilidad del menú se resuelvan con la
 * misma fuente de verdad. Añadir una pantalla nueva es una entrada más en esta
 * tabla, sin tocar los guardas ni la barra lateral.
 */

/** Definición declarativa de una ruta de la aplicación. */
export interface RouteDefinition {
  /** Ruta absoluta dentro de la aplicación. */
  path: string
  /** Nombre legible de la pantalla, usado en títulos y migas de pan. */
  label: string
  /** Identificador de la funcionalidad a la que pertenece. */
  feature: string
  /** Permisos necesarios para acceder; vacío significa «sólo autenticación». */
  permissions?: readonly Permission[]
  /**
   * Indica si la ruta debe aparecer en el menú lateral.
   *
   * Las pantallas de detalle llevan un parámetro en la ruta y no son un
   * destino de navegación: se registran igualmente, para que el enrutador
   * pueda resolver sus permisos, pero no se ofrecen como enlace.
   */
  inMenu?: boolean
}

/**
 * Rutas de la aplicación agrupadas por sección del menú.
 */
export const APP_ROUTES = {
  /** Raíz de la aplicación. */
  root: '/',
  /** Inicio de sesión. */
  login: '/login',
  /** Panel principal. */
  dashboard: '/panel',
  /** Banco de ejercicios. */
  exercises: '/panel/ejercicios',
  /** Programas de entrenamiento. */
  programs: '/panel/programas',
  /** Listado de rutinas. */
  routines: '/panel/rutinas',
  /** Detalle de una rutina. */
  routineDetail: '/panel/rutinas/:rutinaId',
  /** Generación automática de rutinas. */
  routineGenerator: '/panel/rutinas/generar',
  /** Validación de rutinas por el jefe de sala. */
  routineValidation: '/panel/rutinas/validacion',
  /** Gestión de clientes. */
  clients: '/panel/clientes',
  /** Gestión de entrenadores. */
  trainers: '/panel/entrenadores',
  /** Sesiones de entrenamiento. */
  sessions: '/panel/sesiones',
  /** Solicitudes de ajuste de rutina. */
  adjustments: '/panel/ajustes',
  /** Reportes y gráficos. */
  reports: '/panel/reportes',
  /** Administración de usuarios y roles. */
  admin: '/panel/administracion',
  /** Página no encontrada. */
  notFound: '/404',
} as const

/**
 * Definición declarativa de las rutas privadas, con sus permisos asociados.
 *
 * La consumen tanto el guard de navegación como la barra lateral, de modo que
 * el menú nunca ofrece una opción que vaya a ser rechazada.
 */
export const PRIVATE_ROUTES: readonly RouteDefinition[] = [
  {
    path: APP_ROUTES.dashboard,
    label: 'Panel principal',
    feature: 'dashboard',
  },
  {
    path: APP_ROUTES.exercises,
    label: 'Banco de ejercicios',
    feature: 'exercises',
    permissions: [PERMISSIONS.EXERCISE_READ],
  },
  {
    path: APP_ROUTES.programs,
    label: 'Programas de entrenamiento',
    feature: 'programs',
    permissions: [PERMISSIONS.PROGRAM_READ],
  },
  {
    path: APP_ROUTES.routines,
    label: 'Rutinas',
    feature: 'routines',
    permissions: [PERMISSIONS.ROUTINE_READ],
  },
  {
    path: APP_ROUTES.routineGenerator,
    label: 'Generar rutina',
    feature: 'routines',
    permissions: [PERMISSIONS.ROUTINE_GENERATE],
  },
  {
    path: APP_ROUTES.routineValidation,
    label: 'Validar rutinas',
    feature: 'routines',
    permissions: [PERMISSIONS.ROUTINE_VALIDATE],
  },
  {
    // Pantalla de detalle: se registra para resolver sus permisos, pero no
    // aparece en el menú porque su ruta lleva un identificador.
    path: APP_ROUTES.routineDetail,
    label: 'Detalle de rutina',
    feature: 'routines',
    permissions: [PERMISSIONS.ROUTINE_READ],
    inMenu: false,
  },
  {
    path: APP_ROUTES.clients,
    label: 'Clientes',
    feature: 'clients',
    permissions: [PERMISSIONS.CLIENT_READ],
  },
  {
    path: APP_ROUTES.trainers,
    label: 'Entrenadores',
    feature: 'trainers',
    permissions: [PERMISSIONS.TRAINER_READ],
  },
  {
    path: APP_ROUTES.sessions,
    label: 'Sesiones',
    feature: 'sessions',
  },
  {
    path: APP_ROUTES.adjustments,
    label: 'Ajustes de rutina',
    feature: 'adjustments',
  },
  {
    path: APP_ROUTES.reports,
    label: 'Reportes',
    feature: 'reports',
    permissions: [PERMISSIONS.REPORT_READ],
  },
  {
    path: APP_ROUTES.admin,
    label: 'Administración',
    feature: 'admin',
    permissions: [PERMISSIONS.USER_MANAGE],
  },
]

/**
 * Ruta de destino tras autenticarse, deducida del rol principal del usuario.
 *
 * Todos los perfiles entran al panel, pero cada uno aterriza en la pantalla
 * donde tiene tareas pendientes según sus permisos.
 *
 * @param roles Roles del usuario autenticado.
 * @returns Ruta de destino tras el inicio de sesión.
 */
export function dashboardRouteForRoles(roles: readonly string[]): string {
  if (roles.includes(ROLES.ADMIN)) {
    return APP_ROUTES.dashboard
  }
  if (roles.includes(ROLES.JEFE_SALA)) {
    return APP_ROUTES.routineValidation
  }
  if (roles.includes(ROLES.ENTRENADOR)) {
    return APP_ROUTES.routineGenerator
  }
  return APP_ROUTES.routines
}
