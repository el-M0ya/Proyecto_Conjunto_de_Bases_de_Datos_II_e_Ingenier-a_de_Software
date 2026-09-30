/**
 * Tipos del sistema de control de acceso basado en roles (RBAC).
 *
 * El enunciado del proyecto define cuatro perfiles de usuario. Este archivo
 * es la única fuente de verdad sobre los roles existentes; el resto de la
 * aplicación debe referenciarlos a través de estas constantes y nunca usar
 * cadenas literales.
 */

/** Perfiles de usuario soportados por el sistema. */
export const ROLES = {
  /** Administrador: alta de usuarios, control de duplicados y asignaciones. */
  ADMIN: 'administrador',
  /** Entrenador: crea ejercicios y genera rutinas. */
  ENTRENADOR: 'entrenador',
  /** Jefe de sala: revisa y aprueba las rutinas generadas. */
  JEFE_SALA: 'jefe_sala',
  /** Cliente: ejecuta las rutinas asignadas y registra sus sesiones. */
  CLIENTE: 'cliente',
} as const

/** Unión de los roles admitidos. */
export type Role = (typeof ROLES)[keyof typeof ROLES]

/**
 * Lista de todos los roles, útil para poblar filtros y para las pruebas.
 */
export const ALL_ROLES: readonly Role[] = Object.values(ROLES)

/**
 * Comprueba si un valor arbitrario es un rol válido del sistema.
 *
 * @param value Valor candidato.
 * @returns `true` si el valor corresponde a un rol declarado en {@link ROLES}.
 */
export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ALL_ROLES as readonly string[]).includes(value)
}

/**
 * Etiquetas legibles de cada rol, destinadas a la interfaz de usuario.
 * Se separan del valor interno para poder localizarlas o cambiar su redacción
 * sin afectar a la lógica de autorización.
 */
export const ROLE_LABELS: Readonly<Record<Role, string>> = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.ENTRENADOR]: 'Entrenador',
  [ROLES.JEFE_SALA]: 'Jefe de sala',
  [ROLES.CLIENTE]: 'Cliente',
}
