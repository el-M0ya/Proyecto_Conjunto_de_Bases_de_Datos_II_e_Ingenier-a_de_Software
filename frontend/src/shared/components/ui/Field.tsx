import type { ComponentProps } from 'react'
import { cn } from '@shared/lib/cn'

/** Campo de formulario: agrupa etiqueta, control y mensaje de validación. */
export function Field({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="field" className={cn('flex flex-col gap-2', className)} {...props} />
}

/** Etiqueta de un campo de formulario. */
export function FieldLabel({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label
      data-slot="field-label"
      className={cn('text-sm leading-none font-medium', className)}
      {...props}
    />
  )
}

/**
 * Campo de texto.
 *
 * Expone los estados de error y de foco mediante variantes de estilo, y aplica
 * el estilo de invalidación cuando el control declara `aria-invalid`.
 *
 * @param props Propiedades nativas del elemento `input`.
 * @returns Elemento de entrada renderizado.
 */
export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        'border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors',
        'placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/30',
        className,
      )}
      {...props}
    />
  )
}

/** Área de texto multilínea. */
export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input bg-background flex min-h-20 w-full rounded-md border px-3 py-2 text-sm shadow-xs transition-colors',
        'placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

/** Mensaje de validación asociado a un campo. */
export function FieldError({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn('text-destructive text-xs font-medium', className)}
      {...props}
    />
  )
}

/** Texto de ayuda o de contexto de un campo. */
export function FieldHint({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-hint"
      className={cn('text-muted-foreground text-xs', className)}
      {...props}
    />
  )
}
