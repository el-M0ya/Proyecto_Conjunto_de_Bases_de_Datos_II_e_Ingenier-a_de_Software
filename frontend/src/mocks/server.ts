import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * Servidor de MSW para el entorno Node.
 *
 * Intercepta `fetch` a nivel de proceso, de modo que las pruebas de integración
 * ejerciten los repositorios HTTP reales —con sus rutas, cabeceras y
 * transformaciones— sin abrir puertos ni acceder a la red.
 *
 * Se exporta desde un módulo propio para que tanto la configuración de la
 * suite como las pruebas puedan añadir manejadores con `mockServer.use(...)`.
 */
export const mockServer = setupServer(...handlers)
