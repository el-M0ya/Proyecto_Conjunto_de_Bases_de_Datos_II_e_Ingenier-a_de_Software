import { describe, expect, it } from 'vitest'
import {
  hasAnyRole,
  hasPermission,
  PERMISSIONS,
  permissionsForRole,
  roleHasPermission,
} from '@core/rbac/permissions'
import { ROLES, isRole } from '@core/rbac/roles'

describe('control de acceso basado en roles', () => {
  describe('isRole', () => {
    it('reconoce los roles declarados por el sistema', () => {
      expect(isRole(ROLES.ADMIN)).toBe(true)
      expect(isRole(ROLES.ENTRENADOR)).toBe(true)
      expect(isRole(ROLES.JEFE_SALA)).toBe(true)
      expect(isRole(ROLES.CLIENTE)).toBe(true)
    })

    it('rechaza valores que no son roles del sistema', () => {
      expect(isRole('superusuario')).toBe(false)
      expect(isRole(42)).toBe(false)
      expect(isRole(null)).toBe(false)
    })
  })

  describe('roleHasPermission', () => {
    it('permite al entrenador generar rutinas', () => {
      expect(roleHasPermission(ROLES.ENTRENADOR, PERMISSIONS.ROUTINE_GENERATE)).toBe(true)
    })

    it('reserva la validación de rutinas al jefe de sala', () => {
      expect(roleHasPermission(ROLES.JEFE_SALA, PERMISSIONS.ROUTINE_VALIDATE)).toBe(true)
      expect(roleHasPermission(ROLES.ENTRENADOR, PERMISSIONS.ROUTINE_VALIDATE)).toBe(false)
    })

    it('restringe la gestión de usuarios al administrador', () => {
      expect(roleHasPermission(ROLES.ADMIN, PERMISSIONS.USER_MANAGE)).toBe(true)
      expect(roleHasPermission(ROLES.CLIENTE, PERMISSIONS.USER_MANAGE)).toBe(false)
    })

    it('devuelve una lista vacía para un rol inexistente', () => {
      expect(permissionsForRole('desconocido' as never)).toEqual([])
    })
  })

  describe('hasPermission', () => {
    it('basta con que uno de los roles tenga el permiso', () => {
      const roles = [ROLES.CLIENTE, ROLES.ENTRENADOR]
      expect(hasPermission(roles, PERMISSIONS.ROUTINE_GENERATE)).toBe(true)
      expect(hasPermission(roles, PERMISSIONS.ROUTINE_VALIDATE)).toBe(false)
    })

    it('no concede permisos cuando no hay roles', () => {
      expect(hasPermission([], PERMISSIONS.REPORT_READ)).toBe(false)
    })
  })

  describe('hasAnyRole', () => {
    it('detecta la intersección entre roles', () => {
      expect(hasAnyRole([ROLES.ENTRENADOR, ROLES.CLIENTE], [ROLES.CLIENTE])).toBe(true)
      expect(hasAnyRole([ROLES.ENTRENADOR], [ROLES.CLIENTE, ROLES.ADMIN])).toBe(false)
    })
  })
})
