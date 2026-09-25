import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isProduction, isTest } from '@core/config/env'
import { AppError, ERROR_CATEGORIES } from '@core/errors/AppError'
import type { ReactNode } from 'react'

/**
 * Construye el gestor de estado del servidor.
 *
 * Los valores por defecto se ajustan a las características del sistema:
 * los catálogos de referencia cambian rara vez, mientras que la rutina activa
 * del cliente se consulta de forma reiterada durante la sesión de
 * entrenamiento y, por tanto, necesita una ventana de frescura muy corta
 * (requisito explícito del enunciado).
 *
 * @returns Instancia de `QueryClient` configurada.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // En producción no se reintentan errores de autorización ni de validación.
        /**
         * Decide si una consulta fallida admite otro intento.
         *
         * @param failureCount Número de intentos ya realizados.
         * @param error Error que produjo el fallo.
         * @returns `true` si conviene reintentar la consulta.
         */
        retry: (failureCount, error) => {
          if (error instanceof AppError) {
            const fatal =
              error.category === ERROR_CATEGORIES.UNAUTHORIZED ||
              error.category === ERROR_CATEGORIES.FORBIDDEN ||
              error.category === ERROR_CATEGORIES.VALIDATION
            if (fatal) {
              return false
            }
          }
          return failureCount < 2
        },
        // Los reintentos se registran en las pruebas para no ralentizarlas.
        retryDelay: isTest ? 0 : (attempt) => Math.min(1000 * 2 ** attempt, 8000),
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: !isProduction,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

/**
 * Cliente de consultas compartido por la aplicación.
 */
export const queryClient = createQueryClient()

/**
 * Proveedor del gestor de estado del servidor (patrón Provider).
 *
 * @param props Configuración y descendientes del proveedor.
 * @param children Árbol de la aplicación.
 * @returns El proveedor de React Query.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
