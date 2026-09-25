import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'
import { Button } from '@shared/components/ui/Button'

/**
 * Pantalla de error de la aplicación.
 *
 * React Router entrega aquí cualquier fallo de renderizado o de carga de datos
 * de una ruta. Se distingue entre un error de navegación con código HTTP y un
 * fallo inesperado, porque la mensaje que espera el usuario no es el mismo.
 *
 * @returns Pantalla de error renderizada.
 */
export function ErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()

  const isNotFound = isRouteErrorResponse(error) && error.status === 404
  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : 'Ocurrió un error inesperado al cargar esta sección.'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-4xl font-semibold">{isNotFound ? '404' : '¡Ups!'}</p>
      <p className="text-muted-foreground">{message}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => void navigate(-1)}>
          Volver atrás
        </Button>
        <Button onClick={() => void navigate('/')}>Ir al inicio</Button>
      </div>
    </div>
  )
}
