import { Toaster } from 'sonner'
import type { ReactNode } from 'react'

/**
 * Proveedor de notificaciones temporales (patrón Provider).
 *
 * Envuelve al componente `Toaster` de Sonner y fija los parámetros de
 * presentación comunes a toda la aplicación, de modo que cada vista no tenga
 * que re-declararlos.
 *
 * @param props Componentes hijos que pueden emitir notificaciones.
 * @param children Árbol de la aplicación.
 * @returns El proveedor junto con el contenedor de notificaciones.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4500}
        toastOptions={{
          classNames: {
            toast: 'font-sans',
          },
        }}
      />
    </>
  )
}
