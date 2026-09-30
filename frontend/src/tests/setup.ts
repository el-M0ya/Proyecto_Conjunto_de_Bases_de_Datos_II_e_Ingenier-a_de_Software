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

/**
 * `jsdom` no implementa los observadores que usan los fondos animados en
 * WebGL, de modo que sin estos dobles el componente fallaría al montarse en las
 * pruebas. Se registran de forma global porque la carencia es del entorno de
 * pruebas, no de un componente concreto.
 */
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    /** @returns Nada; el doble no observa nada. */
    observe(): void {}
    /** @returns Nada; el doble no observa nada. */
    unobserve(): void {}
    /** @returns Nada; el doble no observa nada. */
    disconnect(): void {}
  }
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class {
    /** Elemento raíz observado; el doble no observa nada. */
    root = null
    /** Margen de la raíz; el doble no lo usa. */
    rootMargin = '0px'
    /** Margen de desplazamiento; el doble no lo usa. */
    scrollMargin = '0px'
    /** Umbrales de visibilidad; el doble no dispara nada. */
    thresholds: ReadonlyArray<number> = [0]
    /** @returns Nada; el doble no observa nada. */
    observe(): void {}
    /** @returns Nada; el doble no observa nada. */
    unobserve(): void {}
    /** @returns Nada; el doble no observa nada. */
    disconnect(): void {}
    /** @returns Lista vacía; el doble no registra entradas. */
    takeRecords(): [] {
      return []
    }
  }
}

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
