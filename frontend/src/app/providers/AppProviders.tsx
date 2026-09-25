import { QueryProvider } from './QueryProvider'
import { SessionProvider } from '@features/auth/context/SessionContext'
import { ThemeProvider } from './ThemeProvider'
import { ToastProvider } from './ToastProvider'
import type { ReactNode } from 'react'

/**
 * Raíz de proveedores de la aplicación (composition root del frontend).
 *
 * El orden de anidamiento importa y está documentado:
 *
 * 1. `ThemeProvider` va primero porque la interfaz debe tener el tema aplicado
 *    desde el primer renderizado, para evitar destellos de estilo.
 * 2. `QueryProvider` envuelve al proveedor de sesión porque la restauración
 *    de la sesión se apoya en el gestor de estado del servidor.
 * 3. `SessionProvider` expose la autenticación al resto del árbol.
 * 4. `ToastProvider` es el más interno: cualquier capa puede notificar.
 *
 * @param props Componentes hijos de la aplicación.
 * @param children Árbol de la aplicación.
 * @returns Todos los proveedores anidados en el orden correcto.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
