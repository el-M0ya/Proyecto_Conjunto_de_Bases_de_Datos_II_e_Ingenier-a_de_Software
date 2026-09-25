import { AppProviders } from '@app/providers/AppProviders'
import { StrictMode } from 'react'
import { RouterProvider } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { router } from '@app/router'
import { env } from '@core/config/env'
import './index.css'

/**
 * Elemento del documento donde se monta la aplicación.
 */
const rootElement = document.getElementById('root')

/**
 * Registra el service worker de MSW, si los datos simulados están activos.
 *
 * El módulo se carga con `import()` dinámico y no de forma estática a
 * propósito: MSW es una dependencia exclusiva de desarrollo y arrastra
 * interceptores de red, analizador de URL y almacén de cookies. Con un import
 * estático acabaría dentro del bundle de producción, aumentando el peso de la
 * descarga inicial para todos los usuarios.
 *
 * @returns Promesa resuelta cuando el worker está activo.
 */
async function registerMocks(): Promise<void> {
  if (!env.VITE_ENABLE_MOCKS) {
    return
  }
  const { startMockServiceWorker } = await import('@mocks/browser')
  await startMockServiceWorker()
}

/**
 * Arranca la aplicación.
 *
 * El registro de los mocks ocurre **antes** del primer renderizado: de lo
 * contrario, las consultas inicializadas en ese momento saldrían a la red real
 * antes de que las rutas simuladas estén interceptadas.
 *
 * @param container Elemento del documento donde montar la aplicación.
 */
async function bootstrap(container: HTMLElement): Promise<void> {
  await registerMocks()

  createRoot(container).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  )
}

if (!rootElement) {
  throw new Error('No se encontró el elemento #root en el documento HTML')
}

void bootstrap(rootElement)
