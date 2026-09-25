import { lazy } from 'react'
import type { ComponentType } from 'react'

/**
 * Fábrica de pantallas cargadas de forma diferida.
 *
 * Cuando cada módulo de funcionalidad se implemente, su página se declarará en
 * el enrutador con `lazyPage(() => import('@features/...'))` en lugar de con
 * una importación estática. De ese modo la descarga inicial se limita al
 * esqueleto de la aplicación, el acceso y el panel, mientras que los módulos
 * pesados —en particular los reportes con gráficos y la exportación a PDF— sólo
 * se transfieren cuando el usuario entra en ellos.
 *
 * Se envuelve el componente en un `Suspense` propio para que la espera quede
 * acotada a la pantalla que se está descargando y no a toda la aplicación.
 *
 * @param factory Promesa de importación del módulo de la pantalla.
 * @returns Componente de la pantalla envuelto en su `Suspense`.
 */
export function lazyPage(factory: () => Promise<{ default: ComponentType }>) {
  const Component = lazy(factory)
  return Component
}
