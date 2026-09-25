import { Outlet } from 'react-router-dom'
import { Brand } from './AppLayout'

/**
 * Esqueleto de las pantallas públicas (inicio de sesión).
 *
 * Mantiene la identidad visual del producto y deja el resto del espacio al
 * contenido de la ruta, sin barra lateral ni cabecera autenticada.
 *
 * @returns Estructura de la pantalla pública renderizada.
 */
export function AuthLayout() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="p-6">
        <Brand />
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <Outlet />
      </main>
    </div>
  )
}
