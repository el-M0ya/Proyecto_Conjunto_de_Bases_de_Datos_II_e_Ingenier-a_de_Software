import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ProtectedRoute } from '@app/guards/RouteGuards'
import { SessionProvider } from '@features/auth/context/SessionContext'
import type { ReactNode } from 'react'

/**
 * Envoltorio mínimo con los proveedores que necesitan las rutas.
 *
 * Se crea un `QueryClient` nuevo en cada render para que el estado de una
 * prueba no se filtre a la siguiente.
 *
 * @param props Entrada inicial del enrutador y árbol a renderizar.
 * @param initialEntries Rutas desde las que parte el enrutador.
 * @param children Árbol a renderizar.
 * @returns Elementos envueltos en los proveedores.
 */
function Wrapper({ initialEntries, children }: { initialEntries: string[]; children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

/**
 * Árbol de rutas de la prueba.
 *
 * @returns Definición de rutas con una privada protegida y su destino público.
 */
function TestRoutes() {
  return (
    <SessionProvider>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/privada" element={<p>Contenido privado</p>} />
        </Route>
        <Route path="/login" element={<p>Pantalla de acceso</p>} />
      </Routes>
    </SessionProvider>
  )
}

describe('guardia de rutas privadas', () => {
  it('redirige al inicio de sesión cuando no hay sesión', async () => {
    render(
      <Wrapper initialEntries={['/privada']}>
        <TestRoutes />
      </Wrapper>,
    )

    expect(await screen.findByText('Pantalla de acceso')).toBeInTheDocument()
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()
  })
})
