import { APP_ROUTES, type RouteDefinition } from '@core/config/routes'
import { Button } from '@shared/components/ui/Button'
import { EmptyState } from '@shared/components/feedback/States'
import { useNavigate } from 'react-router-dom'

/**
 * Pantalla genérica para las funcionalidades aún no desarrolladas.
 *
 * No es un marcador de posición descartable, sino un andamiaje explícito: cada
 * funcionalidad nueva se crea siguiendo esta misma estructura
 * (`pages`, `components`, `hooks`), de modo que la arquitectura sea homogénea
 * desde el primer día.
 *
 * @param props Definición de la ruta que se está mostrando.
 * @param route Ruta asociada a la pantalla.
 * @returns Pantalla renderizada.
 */
export function PlaceholderPage({ route }: { route: RouteDefinition }) {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-xl font-semibold">{route.label}</h1>
        <p className="text-muted-foreground text-sm">
          Funcionalidad <code className="font-mono text-xs">{route.feature}</code>
        </p>
      </header>

      <EmptyState
        title="Módulo en construcción"
        description="Esta pantalla forma parte de la arquitectura base y se implementará en la siguiente iteración."
        action={
          <Button variant="outline" onClick={() => void navigate(APP_ROUTES.dashboard)}>
            Volver al panel
          </Button>
        }
      />
    </div>
  )
}
