import { DashboardPage } from '@features/dashboard/pages/DashboardPage'
import { MemoryRouter } from 'react-router-dom'
import { SessionProvider } from '@features/auth/context/SessionContext'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { container } from '@core/di/container'
import { ROLES } from '@core/rbac/roles'
import { tokenStorage } from '@core/auth/tokenStorage'
import type { AuthRepository } from '@domain/repositories'
import type { Role } from '@core/rbac/roles'
import type { UserProfile } from '@domain/entities'

/**
 * Publica un perfil con los roles indicados para la prueba en curso.
 *
 * @param roles Roles que tendrá el usuario de prueba.
 */
function publicarSesion(roles: Role[]): void {
  const perfil: UserProfile = {
    id: 'usr-1',
    nombre: 'Bryan Moya Aquino',
    correo: 'bryan@basedebatos.cu',
    roles,
    perfilId: 'per-1',
  }

  tokenStorage.setTokens({ accessToken: 'token-1', refreshToken: null, expiresAt: null })

  const repository: AuthRepository = {
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    me: vi.fn().mockResolvedValue(perfil),
  }

  vi.spyOn(container, 'auth', 'get').mockReturnValue(repository)
}

/**
 * Monta el panel principal con la sesión publicada.
 *
 * @returns Resultado del renderizado.
 */
function renderDashboard() {
  return render(
    <MemoryRouter>
      <SessionProvider>
        <DashboardPage />
      </SessionProvider>
    </MemoryRouter>,
  )
}

describe('panel principal', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('saluda al usuario por su primer nombre', async () => {
    publicarSesion([ROLES.ENTRENADOR])
    renderDashboard()

    expect(await screen.findByText('Hola, Bryan')).toBeInTheDocument()
  })

  it('ofrece al entrenador sus accesos de generación y a los ejercicios', async () => {
    publicarSesion([ROLES.ENTRENADOR])
    renderDashboard()

    expect(await screen.findByText('Generar rutina')).toBeInTheDocument()
    expect(screen.getByText('Banco de ejercicios')).toBeInTheDocument()
  })

  it('no ofrece al entrenador la validación de rutinas ni la administración', async () => {
    publicarSesion([ROLES.ENTRENADOR])
    renderDashboard()

    await screen.findByText('Generar rutina')

    expect(screen.queryByText('Validar rutinas')).not.toBeInTheDocument()
    expect(screen.queryByText('Administración')).not.toBeInTheDocument()
  })

  it('ofrece al jefe de sala la validación de rutinas', async () => {
    publicarSesion([ROLES.JEFE_SALA])
    renderDashboard()

    expect(await screen.findByText('Validar rutinas')).toBeInTheDocument()
    expect(screen.queryByText('Generar rutina')).not.toBeInTheDocument()
  })

  it('ofrece al administrador la sección de administración', async () => {
    publicarSesion([ROLES.ADMIN])
    renderDashboard()

    expect(await screen.findByText('Administración')).toBeInTheDocument()
  })

  it('ofrece al cliente únicamente sus rutinas y los reportes', async () => {
    publicarSesion([ROLES.CLIENTE])
    renderDashboard()

    expect(await screen.findByText('Mis rutinas')).toBeInTheDocument()
    expect(screen.getByText('Reportes')).toBeInTheDocument()
    expect(screen.queryByText('Generar rutina')).not.toBeInTheDocument()
    expect(screen.queryByText('Banco de ejercicios')).not.toBeInTheDocument()
  })
})
