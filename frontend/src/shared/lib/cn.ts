import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases de Tailwind resolviendo los conflictos correctamente.
 *
 * `clsx` acepta condicionales, arreglos y objetos; `twMerge` descarta las
 * clases posteriores que compiten con otras anteriores (por ejemplo, `p-2` y
 * `p-4`), de modo que la última pasada en la cadena prevalece. Es
 * imprescindible para que los componentes con variantes y los que aceptan
 * `className` puedan sobrescribir estilos sin romper el orden de las clases.
 *
 * @param inputs Valores de clase a combinar.
 * @returns Cadena de clases normalizada.
 *
 * @example
 * ```ts
 * cn('px-2 py-1', isActive && 'bg-primary', className)
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
