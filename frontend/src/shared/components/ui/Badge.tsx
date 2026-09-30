import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@shared/lib/cn'

/**
 * Variantes visuales de la etiqueta de estado.
 *
 * Se utilizan para distinguir la intensidad de un ejercicio y el estado de una
 * rutina o de una sesión, de un vistazo y sin depender sólo del color.
 */
export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/15 text-primary',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive/15 text-destructive',
        success: 'border-transparent bg-success/15 text-success',
        warning: 'border-transparent bg-warning/20 text-warning',
        info: 'border-transparent bg-info/15 text-info',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

/** Propiedades del componente `Badge`. */
export type BadgeProps = ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    /** Delega el estilo al único hijo en lugar de renderizar un `<span>`. */
    asChild?: boolean
  }

/**
 * Etiqueta compacta para estados y clasificaciones.
 *
 * @param props Propiedades de la etiqueta, incluidas las variantes.
 * @returns Elemento de etiqueta renderizado.
 */
export function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Component = asChild ? Slot : 'span'

  return (
    <Component data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
