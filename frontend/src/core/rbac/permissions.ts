import { ROLES, type Role } from './roles'

/**
 * Catálogo de permisos y su relación con los roles.
 *
 * Cada permiso es un verbo en la forma `recurso:acción`. Este enfoque
 * declarativo permite resolver la pregunta «¿qué puede hacer este usuario?»
 * con una tabla, sin condicionales dispersos por los componentes, y facilita
 * auditar la cobertura de los requerimientos funcionales del proyecto.
 */

/** Permisos discretos del sistema. */
export const PERMISSIONS = {
  /* --- Ejercicios ------------------------------------------------------- */
  EXERCISE_CREATE: 'ejercicio:crear',
  EXERCISE_READ: 'ejercicio:leer',
  EXERCISE_UPDATE: 'ejercicio:actualizar',
  EXERCISE_DELETE: 'ejercicio:eliminar',
  EXERCISE_DUPLICATES_REVIEW: 'ejercicio:revisar_duplicados',

  /* --- Programas de entrenamiento --------------------------------------- */
  PROGRAM_READ: 'programa:leer',
  PROGRAM_MANAGE: 'programa:gestionar',

  /* --- Rutinas ---------------------------------------------------------- */
  ROUTINE_GENERATE: 'rutina:generar',
  ROUTINE_READ: 'rutina:leer',
  ROUTINE_READ_ALL_BY_PROGRAM: 'rutina:leer_todas_del_programa',
  ROUTINE_VALIDATE: 'rutina:validar',
  ROUTINE_ASSIGN: 'rutina:asignar',
  ROUTINE_EXECUTE: 'rutina:ejecutar',

  /* --- Ajustes de rutina ------------------------------------------------ */
  ADJUSTMENT_REQUEST: 'ajuste:solicitar',
  ADJUSTMENT_RESOLVE: 'ajuste:resolver',

  /* --- Clientes y entrenadores ------------------------------------------ */
  CLIENT_READ: 'cliente:leer',
  CLIENT_MANAGE: 'cliente:gestionar',
  TRAINER_READ: 'entrenador:leer',
  TRAINER_MANAGE: 'entrenador:gestionar',

  /* --- Reportes --------------------------------------------------------- */
  REPORT_READ: 'reporte:leer',
  REPORT_EXPORT: 'reporte:exportar',

  /* --- Administración --------------------------------------------------- */
  USER_MANAGE: 'usuario:gestionar',
  ROLE_MANAGE: 'rol:gestionar',
} as const

/** Unión de los permisos admitidos. */
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

/**
 * Permisos asociados a cada rol.
 *
 * Se declara como matriz de roles a permisos para que la asignación sea legible
 * y auditable en una sola pantalla (requisito de control de calidad).
 */
const ROLE_PERMISSIONS: Readonly<Record<Role, readonly Permission[]>> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.EXERCISE_DUPLICATES_REVIEW,
    PERMISSIONS.PROGRAM_READ,
    PERMISSIONS.PROGRAM_MANAGE,
    PERMISSIONS.ROUTINE_ASSIGN,
    PERMISSIONS.ROUTINE_READ,
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.CLIENT_MANAGE,
    PERMISSIONS.TRAINER_READ,
    PERMISSIONS.TRAINER_MANAGE,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.ROLE_MANAGE,
  ],

  [ROLES.ENTRENADOR]: [
    PERMISSIONS.EXERCISE_CREATE,
    PERMISSIONS.EXERCISE_READ,
    PERMISSIONS.EXERCISE_UPDATE,
    PERMISSIONS.PROGRAM_READ,
    PERMISSIONS.ROUTINE_GENERATE,
    PERMISSIONS.ROUTINE_READ,
    PERMISSIONS.ROUTINE_READ_ALL_BY_PROGRAM,
    PERMISSIONS.ADJUSTMENT_RESOLVE,
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.TRAINER_READ,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_EXPORT,
  ],

  [ROLES.JEFE_SALA]: [
    PERMISSIONS.EXERCISE_READ,
    PERMISSIONS.PROGRAM_READ,
    PERMISSIONS.ROUTINE_READ,
    PERMISSIONS.ROUTINE_READ_ALL_BY_PROGRAM,
    PERMISSIONS.ROUTINE_VALIDATE,
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.TRAINER_READ,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_EXPORT,
  ],

  [ROLES.CLIENTE]: [
    PERMISSIONS.ROUTINE_READ,
    PERMISSIONS.ROUTINE_EXECUTE,
    PERMISSIONS.ADJUSTMENT_REQUEST,
    PERMISSIONS.PROGRAM_READ,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_EXPORT,
  ],
}

/**
 * Devuelve el conjunto de permisos asociados a un rol.
 *
 * @param role Rol del usuario.
 * @returns Lista de permisos del rol; lista vacía si el rol no existe.
 */
export function permissionsForRole(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

/**
 * Indica si un rol tiene asignado un permiso concreto.
 *
 * @param role Rol del usuario.
 * @param permission Permiso a comprobar.
 * @returns `true` si el rol incluye el permiso.
 */
export function roleHasPermission(role: Role, permission: Permission): boolean {
  return permissionsForRole(role).includes(permission)
}

/**
 * Indica si un conjunto de roles incluye el permiso buscado.
 *
 * Permite aplicar la regla «basta con uno de mis roles» sin duplicar la lógica
 * en cada componente.
 *
 * @param roles Roles del usuario.
 * @param permission Permiso a comprobar.
 * @returns `true` si al menos un rol incluye el permiso.
 */
export function hasPermission(roles: readonly Role[], permission: Permission): boolean {
  return roles.some((role) => roleHasPermission(role, permission))
}

/**
 * Indica si el usuario tiene alguno de los roles indicados.
 *
 * @param roles Roles del usuario.
 * @param acceptedRoles Roles admitidos para la operación.
 * @returns `true` si hay intersección entre ambos conjuntos.
 */
export function hasAnyRole(roles: readonly Role[], acceptedRoles: readonly Role[]): boolean {
  return roles.some((role) => acceptedRoles.includes(role))
}
