import { AuthBackground } from '@shared/components/backgrounds/Backgrounds'
import { Outlet } from 'react-router-dom'
import { Brand } from './AppLayout'

/**
 * Esqueleto de las pantallas públicas (inicio de sesión).
 *
 * Mantiene la identidad visual del producto y deja el resto del espacio al
 * contenido de la ruta, sin barra lateral ni cabecera autenticada.
 *
 * El contenedor es `relative` para que la capa de fondo animada, posicionada de
 * forma absoluta, quede por detrás del contenido sin alterar el flujo del
 * documento.
 *
 * @returns Estructura de la pantalla pública renderizada.
 */
export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <AuthBackground />

      <header className="relative z-10 p-6">
        <Brand />
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center p-6">
        <Outlet />
      </main>
    </div>
  )
}
