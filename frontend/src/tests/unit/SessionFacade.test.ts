import { SessionFacade } from '@features/auth/services/SessionFacade'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { container } from '@core/di/container'
import { PERMISSIONS } from '@core/rbac/permissions'
import { ROLES } from '@core/rbac/roles'
import { tokenStorage } from '@core/auth/tokenStorage'
import { STORAGE_KEYS } from '@core/storage/storeFactory'
import type { AuthRepository, AuthSession } from '@domain/repositories'
import type { UserProfile } from '@domain/entities'

/** Perfil de usuario de prueba. */
const PERFIL: UserProfile = {
  id: 'usr-1',
  nombre: 'Bryan Moya',
  correo: 'bryan@basedebatos.cu',
  roles: [ROLES.ENTRENADOR],
  perfilId: 'ent-1',
}

/** Sesión de prueba con token vigente. */
function crearSesion(accessToken = 'token-1'): AuthSession {
  return {
    accessToken,
    refreshToken: 'refresh-1',
    expiresAt: Date.now() + 3_600_000,
    usuario: PERFIL,
  }
}

/**
 * Doble de prueba del repositorio de autenticación.
 *
 * Se devuelven también los dobles sueltos, y no sólo el objeto que satisface
 * el contrato: las aserciones necesitan referirse a la función de prueba en sí
 * (`expect(refrescar).not.toHaveBeenCalled()`), y accederla a través del objeto
 * se consideraría un método sin enlazar, con un `this` inesperado.
 *
 * @param overrides Métodos a sustituir respecto de la implementación por defecto.
 * @returns Los dobles de prueba y el repositorio que los agrupa.
 */
function crearAuthRepositoryFake(overrides: Partial<AuthRepository> = {}) {
  const dobles = {
    login: vi.fn().mockResolvedValue(crearSesion()),
    refresh: vi.fn().mockResolvedValue(crearSesion('token-renovado')),
    logout: vi.fn().mockResolvedValue(undefined),
    me: vi.fn().mockResolvedValue(PERFIL),
  }

  const repository: AuthRepository = { ...dobles, ...overrides }
  return { repository, dobles }
}

/**
 * Sustituye el repositorio de autenticación del contenedor.
 *
 * @param repository Doble a inyectar.
 */
function inyectarRepositorio(repository: AuthRepository): void {
  vi.spyOn(container, 'auth', 'get').mockReturnValue(repository)
}

describe('fachada de sesión', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('restore', () => {
    it('devuelve null cuando no hay sesión persistida', async () => {
      inyectarRepositorio(crearAuthRepositoryFake().repository)
      const facade = new SessionFacade()

      await expect(facade.restore()).resolves.toBeNull()
    })

    it('recupera el perfil cuando el token sigue vigente', async () => {
      tokenStorage.setTokens({
        accessToken: 'vigente',
        refreshToken: 'refresh-1',
        expiresAt: Date.now() + 3_600_000,
      })

      const { repository, dobles } = crearAuthRepositoryFake()
      inyectarRepositorio(repository)
      const facade = new SessionFacade()

      const session = await facade.restore()

      expect(session?.usuario).toEqual(PERFIL)
      expect(session?.accessToken).toBe('vigente')
      // Con el token vigente no debe gastarse la renovación.
      expect(dobles.refresh).not.toHaveBeenCalled()
    })

    it('renueva la sesión cuando el token ha caducado', async () => {
      tokenStorage.setTokens({
        accessToken: 'caducado',
        refreshToken: 'refresh-1',
        expiresAt: Date.now() - 1_000,
      })

      const { repository, dobles } = crearAuthRepositoryFake()
      inyectarRepositorio(repository)

      const session = await new SessionFacade().restore()

      expect(dobles.refresh).toHaveBeenCalledWith('refresh-1')
      expect(session?.accessToken).toBe('token-renovado')
    })

    it('descarta la sesión si la renovación falla', async () => {
      tokenStorage.setTokens({
        accessToken: 'caducado',
        refreshToken: 'refresh-1',
        expiresAt: Date.now() - 1_000,
      })

      inyectarRepositorio(
        crearAuthRepositoryFake({ refresh: vi.fn().mockRejectedValue(new Error('401')) })
          .repository,
      )

      await expect(new SessionFacade().restore()).resolves.toBeNull()
      expect(tokenStorage.getTokens()).toBeNull()
    })

    it('descarta la sesión caducada que no puede renovarse', async () => {
      tokenStorage.setTokens({ accessToken: 'caducado', refreshToken: null, expiresAt: 1_000 })
      inyectarRepositorio(crearAuthRepositoryFake().repository)

      await expect(new SessionFacade().restore()).resolves.toBeNull()
      expect(tokenStorage.getTokens()).toBeNull()
    })

    it('descarta la sesión si el backend ya no reconoce el token', async () => {
      tokenStorage.setTokens({
        accessToken: 'invalido',
        refreshToken: null,
        expiresAt: Date.now() + 3_600_000,
      })

      inyectarRepositorio(
        crearAuthRepositoryFake({ me: vi.fn().mockRejectedValue(new Error('401')) }).repository,
      )

      await expect(new SessionFacade().restore()).resolves.toBeNull()
      expect(tokenStorage.getTokens()).toBeNull()
    })
  })

  describe('signOut', () => {
    it('cierra la sesión en el backend y borra los tokens locales', async () => {
      tokenStorage.setTokens({ accessToken: 'vigente', refreshToken: null, expiresAt: null })
      const { repository, dobles } = crearAuthRepositoryFake()
      inyectarRepositorio(repository)

      await new SessionFacade().signOut()

      expect(dobles.logout).toHaveBeenCalledWith('vigente')
      expect(tokenStorage.getTokens()).toBeNull()
    })

    it('borra los tokens aunque el backend no responda', async () => {
      tokenStorage.setTokens({ accessToken: 'vigente', refreshToken: null, expiresAt: null })
      inyectarRepositorio(
        crearAuthRepositoryFake({ logout: vi.fn().mockRejectedValue(new Error('sin red')) })
          .repository,
      )

      await expect(new SessionFacade().signOut()).rejects.toThrow('sin red')
      expect(tokenStorage.getTokens()).toBeNull()
    })

    it('no llama al backend cuando no hay token almacenado', async () => {
      const { repository, dobles } = crearAuthRepositoryFake()
      inyectarRepositorio(repository)

      await new SessionFacade().signOut()

      expect(dobles.logout).not.toHaveBeenCalled()
    })
  })

  describe('refresh', () => {
    it('devuelve null cuando no existe token de renovación', async () => {
      inyectarRepositorio(crearAuthRepositoryFake().repository)
      await expect(new SessionFacade().refresh()).resolves.toBeNull()
    })

    it('devuelve null y limpia la sesión si la renovación falla', async () => {
      tokenStorage.setTokens({ accessToken: 'a', refreshToken: 'r', expiresAt: null })
      inyectarRepositorio(
        crearAuthRepositoryFake({ refresh: vi.fn().mockRejectedValue(new Error('x')) }).repository,
      )

      await expect(new SessionFacade().refresh()).resolves.toBeNull()
      expect(tokenStorage.getTokens()).toBeNull()
    })
  })

  describe('autorización', () => {
    it('concede un permiso incluido en los roles del usuario', () => {
      const facade = new SessionFacade()
      expect(facade.hasPermission(PERFIL, PERMISSIONS.ROUTINE_GENERATE)).toBe(true)
    })

    it('deniega un permiso ajeno al rol', () => {
      const facade = new SessionFacade()
      expect(facade.hasPermission(PERFIL, PERMISSIONS.USER_MANAGE)).toBe(false)
    })

    it('deniega cualquier permiso cuando no hay usuario', () => {
      const facade = new SessionFacade()
      expect(facade.hasPermission(null, PERMISSIONS.REPORT_READ)).toBe(false)
    })

    it('detecta la pertenencia a un conjunto de roles', () => {
      const facade = new SessionFacade()
      expect(facade.hasAnyRole(PERFIL, [ROLES.ENTRENADOR, ROLES.ADMIN])).toBe(true)
      expect(facade.hasAnyRole(PERFIL, [ROLES.CLIENTE])).toBe(false)
      expect(facade.hasAnyRole(null, [ROLES.CLIENTE])).toBe(false)
    })
  })

  it('expone las claves de almacenamiento con un espacio de nombres propio', () => {
    expect(STORAGE_KEYS.ACCESS_TOKEN).toBe('bb2:auth:access_token')
  })
})
