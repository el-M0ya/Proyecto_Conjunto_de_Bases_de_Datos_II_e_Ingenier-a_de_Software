import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/**
 * Service worker de MSW para el navegador.
 *
 * Intercepta las peticiones a la API en desarrollo y devuelve respuestas
 * simuladas, permitiendo trabajar sobre la interfaz sin levantar el backend.
 */
export const worker = setupWorker(...handlers)

/**
 * Registra el service worker de MSW.
 *
 * @returns Promesa resuelta cuando el worker está activo.
 */
export async function startMockServiceWorker(): Promise<void> {
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  })
}
