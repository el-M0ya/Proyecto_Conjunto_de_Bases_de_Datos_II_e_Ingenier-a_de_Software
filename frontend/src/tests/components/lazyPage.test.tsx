import { lazyPage } from '@app/lazyPage'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Suspense } from 'react'
import type { ReactElement } from 'react'

/**
 * Pantalla de prueba que se carga bajo demanda.
 *
 * @returns Elemento identificable.
 */
function PantallaDiferida() {
  return <p>Contenido diferido</p>
}

/** Módulo exportado por una pantalla diferida. */
type ModuloPantalla = { default: () => ReactElement }

/**
 * Simula la importación dinámica de un módulo de pantalla.
 *
 * @param modulo Módulo exportado por la pantalla diferida.
 * @returns Promesa equivalente a la que devuelve `import()`.
 */
function importar(modulo: ModuloPantalla): Promise<ModuloPantalla> {
  return Promise.resolve(modulo)
}

describe('fábrica de pantallas diferidas', () => {
  it('devuelve un componente que resuelve su módulo al montarse', async () => {
    const Pantalla = lazyPage(() => importar({ default: PantallaDiferida }))

    render(
      <Suspense fallback={<p>Cargando…</p>}>
        <Pantalla />
      </Suspense>,
    )

    expect(await screen.findByText('Contenido diferido')).toBeInTheDocument()
  })

  it('permite crear varias pantallas a partir de fábricas distintas', () => {
    const Primera = lazyPage(() => importar({ default: () => <p>Primera pantalla</p> }))
    const Segunda = lazyPage(() => importar({ default: () => <p>Segunda pantalla</p> }))

    expect(Primera).not.toBe(Segunda)
  })
})
