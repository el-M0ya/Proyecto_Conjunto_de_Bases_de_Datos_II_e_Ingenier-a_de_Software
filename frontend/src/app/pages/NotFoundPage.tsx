import { Link } from 'react-router-dom'
import { APP_ROUTES } from '@core/config/routes'

/**
 * Pantalla mostrada cuando la ruta solicitada no existe.
 *
 * @returns Mensaje de ruta inexistente.
 */
export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-5xl font-semibold">404</p>
      <p className="text-lg font-medium">Página no encontrada</p>
      <p className="text-muted-foreground max-w-md text-sm">
        La dirección que intentas abrir no corresponde a ninguna sección del sistema. Es posible que
        el enlace esté desactualizado.
      </p>
      <Link
        to={APP_ROUTES.root}
        className="text-primary text-sm font-medium underline-offset-4 hover:underline"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
