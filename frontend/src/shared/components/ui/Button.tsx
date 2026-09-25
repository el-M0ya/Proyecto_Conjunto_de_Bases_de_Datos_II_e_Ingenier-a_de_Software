import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@shared/lib/cn'

/**
 * Variantes visuales del botón.
 *
 * Se declara con `cva` (Class Variance Authority): permite describir todas las
 * combinaciones válidas en un único lugar y obtener un tipo de `variant` y
 * `size` cerrado, de modo que un error de estilo se detecte al compilar y no
 * en la revisión visual.
 */
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md',
    'text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-8',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

/** Propiedades del componente `Button`. */
export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /**
     * Delega el estilo al único hijo del componente en lugar de renderizar un
     * `<button>`. Se usa para que un enlace de React Router o un `<a>` hereden
     * el aspecto del botón sin duplicar clases.
     */
    asChild?: boolean
  }

/**
 * Botón reutilizable del sistema de diseño.
 *
 * Cuando se pasa `asChild`, el componente delega el estilo a su único hijo
 * (típicamente un enlace de React Router) mediante el primitive `Slot`, de
 * modo que un mismo diseño sirve para botones y para enlaces navegables sin
 * duplicar clases.
 *
 * @param props Propiedades del botón, incluidas las variantes.
 * @returns Elemento de botón renderizado.
 */
export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot : 'button'

  return (
    <Component
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
