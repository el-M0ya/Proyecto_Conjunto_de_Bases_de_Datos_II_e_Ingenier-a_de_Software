import { SessionProvider, useSession } from '@features/auth/context/SessionContext'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { container } from '@core/di/container'
import { PERMISSIONS } from '@core/rbac/permissions'
import { ROLES } from '@core/rbac/roles'
import { tokenStorage } from '@core/auth/tokenStorage'
import type { AuthRepository } from '@domain/repositories'
import type { UserProfile } from '@domain/entities'

/** Perfil de entrenador usado en las pruebas. */
const PERFIL: UserProfile = {
  id: 'usr-1',
  nombre: 'Bryan Moya Aquino',
  correo: 'bryan@basedebatos.cu',
  roles: [ROLES.ENTRENADOR],
  perfilId: 'ent-1',
}

/**
 * Sustituye el repositorio de autenticación del contenedor por un doble.
 *
 * @param overrides Métodos concretos a definir en el doble.
 * @returns El doble inyectado.
 */
function inyectarAuth(overrides: Partial<AuthRepository> = {}): AuthRepository {
  const repository: AuthRepository = {
    login: vi.fn().mockResolvedValue({
      accessToken: 'token-1',
      refreshToken: null,
      expiresAt: null,
      usuario: PERFIL,
    }),
    refresh: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    me: vi.fn().mockResolvedValue(PERFIL),
    ...overrides,
  }

  vi.spyOn(container, 'auth', 'get').mockReturnValue(repository)
  return repository
}

/**
 * Componente auxiliar que expone las acciones del contexto de sesión.
 *
 * Los rechazos se absorben aquí a propósito: la pantalla real de acceso los
 * presenta con `useMutation`, y aquí sólo interesa observar el estado que
 * publica el proveedor.
 *
 * @returns Botones de acceso y lectura de permisos.
 */
function Panel() {
  const { user, isAuthenticated, signIn, signOut, hasPermission, hasAnyRole } = useSession()

  return (
    <div>
      <span data-testid="estado">{isAuthenticated ? 'autenticado' : 'anónimo'}</span>
      <span data-testid="nombre">{user?.nombre ?? 'sin sesión'}</span>
      <span data-testid="permiso-generar">
        {hasPermission(PERMISSIONS.ROUTINE_GENERATE) ? 'sí' : 'no'}
      </span>
      <span data-testid="permiso-usuarios">
        {hasPermission(PERMISSIONS.USER_MANAGE) ? 'sí' : 'no'}
      </span>
      <span data-testid="rol-cliente">{hasAnyRole([ROLES.CLIENTE]) ? 'sí' : 'no'}</span>
      <button
        onClick={() => {
          void signIn({ correo: 'a@b.cu', password: 'secreto' }).catch(() => undefined)
        }}
      >
        Entrar
      </button>
      <button
        onClick={() => {
          void signOut().catch(() => undefined)
        }}
      >
        Salir
      </button>
    </div>
  )
}

/**
 * Envoltorio con el proveedor de sesión.
 *
 * @returns El proveedor con el panel de prueba.
 */
function renderPanel() {
  return render(
    <SessionProvider>
      <Panel />
    </SessionProvider>,
  )
}

describe('proveedor de sesión', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('arranca sin sesión cuando no hay tokens almacenados', async () => {
    inyectarAuth({ me: vi.fn().mockRejectedValue(new Error('sin sesión')) })

    renderPanel()

    expect(await screen.findByTestId('estado')).toHaveTextContent('anónimo')
    expect(screen.getByTestId('nombre')).toHaveTextContent('sin sesión')
  })

  it('restaura la sesión persistida al montar', async () => {
    tokenStorage.setTokens({ accessToken: 'token-1', refreshToken: null, expiresAt: null })
    inyectarAuth()

    renderPanel()

    expect(await screen.findByTestId('estado')).toHaveTextContent('autenticado')
    expect(screen.getByTestId('nombre')).toHaveTextContent('Bryan Moya Aquino')
  })

  it('autentica al usuario y expone su perfil', async () => {
    inyectarAuth()

    const usuario = userEvent.setup()
    renderPanel()

    await screen.findByTestId('estado')
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByTestId('estado')).toHaveTextContent('autenticado')
  })

  it('conserva el estado anónimo si el acceso es rechazado', async () => {
    inyectarAuth({ login: vi.fn().mockRejectedValue(new Error('credenciales incorrectas')) })

    const usuario = userEvent.setup()
    renderPanel()

    await screen.findByTestId('estado')
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(screen.getByTestId('estado')).toHaveTextContent('anónimo')
  })

  it('cierra la sesión y limpia el estado', async () => {
    tokenStorage.setTokens({ accessToken: 'token-1', refreshToken: null, expiresAt: null })
    inyectarAuth()

    const usuario = userEvent.setup()
    renderPanel()

    await screen.findByTestId('estado')
    await usuario.click(screen.getByRole('button', { name: 'Salir' }))

    expect(await screen.findByTestId('estado')).toHaveTextContent('anónimo')
    expect(tokenStorage.getTokens()).toBeNull()
  })

  it('resuelve los permisos a partir de los roles del usuario', async () => {
    tokenStorage.setTokens({ accessToken: 'token-1', refreshToken: null, expiresAt: null })
    inyectarAuth()

    renderPanel()

    await screen.findByTestId('estado')

    // El entrenador genera rutinas, pero no gestiona usuarios.
    expect(screen.getByTestId('permiso-generar')).toHaveTextContent('sí')
    expect(screen.getByTestId('permiso-usuarios')).toHaveTextContent('no')
    expect(screen.getByTestId('rol-cliente')).toHaveTextContent('no')
  })

  it('deniega todos los permisos cuando no hay sesión', async () => {
    inyectarAuth({ me: vi.fn().mockRejectedValue(new Error('sin sesión')) })

    renderPanel()

    await screen.findByTestId('estado')

    expect(screen.getByTestId('permiso-generar')).toHaveTextContent('no')
    expect(screen.getByTestId('rol-cliente')).toHaveTextContent('no')
  })

  it('falla de forma explícita si se consume fuera del proveedor', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(() => render(<Panel />)).toThrow(/useSession/)

    error.mockRestore()
  })

  it('no escribe el estado si se desmonta durante la restauración', async () => {
    tokenStorage.setTokens({ accessToken: 'token-1', refreshToken: null, expiresAt: null })
    inyectarAuth()

    // React avisa por consola cuando un componente desmontado intenta
    // actualizar su estado; el proveedor se desmonta aquí de forma intencionada
    // mientras la petición de perfil sigue en curso.
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const { unmount } = renderPanel()
    unmount()

    await act(async () => {
      await Promise.resolve()
    })

    const avisos = error.mock.calls.flat().join(' ')
    expect(avisos).not.toMatch(/unmounted component/i)

    error.mockRestore()
  })
})
