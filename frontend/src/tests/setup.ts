import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'
import { mockServer } from '@mocks/server'

/**
 * Variables de entorno de la suite de pruebas.
 *
 * Se fijan aquí para que la configuración de la aplicación se valide una sola
 * vez con valores conocidos y deterministas, independientes del entorno de la
 * máquina que ejecuta las pruebas.
 */
vi.stubEnv('VITE_APP_ENV', 'test')
vi.stubEnv('VITE_API_BASE_URL', '/api')
vi.stubEnv('VITE_API_TIMEOUT', '5000')
vi.stubEnv('VITE_API_RETRY_COUNT', '0')
vi.stubEnv('VITE_ENABLE_MOCKS', 'false')

/**
 * Sustituto de `window.matchMedia` para `jsdom`.
 *
 * `jsdom` no implementa esta API y los componentes que consultan la preferencia
 * de tema (por ejemplo, el conmutador claro/oscuro) fallarían sin ella.
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList,
})

beforeAll(() => {
  // `bypass` evita que una petición no cubierta por un manejador rompa la
  // prueba con un error poco descriptivo; cada prueba declara lo que necesita.
  mockServer.listen({ onUnhandledRequest: 'bypass' })
})

afterEach(() => {
  mockServer.resetHandlers()
  cleanup()
  localStorage.clear()
})
