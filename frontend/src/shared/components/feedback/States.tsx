import { AlertTriangle, Inbox, LoaderCircle } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@shared/lib/cn'
import { Button } from '@shared/components/ui/Button'

/**
 * Indicador de carga con texto explicativo.
 *
 * @param props Descripción del proceso en curso.
 * @param className Clases adicionales del contenedor.
 * @returns Elemento de espera renderizado.
 */
export function LoadingState({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}
      {...props}
    >
      <LoaderCircle className="text-primary size-6 animate-spin" aria-hidden="true" />
      <p className="text-muted-foreground text-sm">Cargando…</p>
    </div>
  )
}

/** Contenedor de un error con su mensaje y la acción de reintento. */
export function ErrorState({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      role="alert"
      className={cn(
        'border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-3 rounded-lg border p-8 text-center',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Mensaje de error con acción de reintento.
 *
 * @param props Descripción del error y acción de recuperación.
 * @param title Título del error.
 * @param message Detalle del error mostrado al usuario.
 * @param onRetry Acción a ejecutar al pulsar «Reintentar».
 * @returns Bloque de error renderizado.
 */
export function ErrorMessage({
  title = 'No se pudo cargar la información',
  message,
  onRetry,
  className,
}: {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <ErrorState className={className}>
      <AlertTriangle className="text-destructive size-6" aria-hidden="true" />
      <div>
        <p className="text-destructive font-medium">{title}</p>
        <p className="text-muted-foreground mt-1 text-sm">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </ErrorState>
  )
}

/**
 * Estado sin resultados.
 *
 * @param props Contenido y acción opcional del estado vacío.
 * @param title Título del estado vacío.
 * @param description Explicación de por qué no hay resultados.
 * @param action Acción a ofrecer (por ejemplo, «Crear ejercicio»).
 * @returns Bloque de estado vacío renderizado.
 */
export function EmptyState({
  title = 'Sin resultados',
  description = 'No hay información que coincida con los criterios seleccionados.',
  action,
  icon,
  className,
}: {
  title?: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center',
        className,
      )}
    >
      {icon ?? <Inbox className="text-muted-foreground size-6" aria-hidden="true" />}
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      {action}
    </div>
  )
}
