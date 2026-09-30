import { ThemeProvider, useTheme } from '@app/providers/ThemeProvider'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEYS } from '@core/storage/storeFactory'

/**
 * Componente auxiliar que expone el estado del tema en pantalla.
 *
 * @returns Botones y lectura del tema actual.
 */
function Inspector() {
  const { theme, preference, toggle, setPreference } = useTheme()

  return (
    <div>
      <span data-testid="tema">{theme}</span>
      <span data-testid="preferencia">{preference}</span>
      <button onClick={toggle}>Alternar</button>
      <button onClick={() => setPreference('light')}>Forzar claro</button>
    </div>
  )
}

/** Listeners suscritos al cambio de preferencia del sistema. */
let listeners: Array<() => void> = []

/** Valor que devuelve `matchMedia` en la siguiente consulta. */
let prefiereOscuro = false

/**
 * Sustituye `matchMedia` por una implementación controlable.
 *
 * `jsdom` no implementa esta API, pero el proveedor de tema la usa tanto para
 * resolver la preferencia inicial como para suscribirse a sus cambios. El doble
 * registra los listeners para que la prueba pueda dispararlos a voluntad.
 */
function instalarMatchMedia(): void {
  listeners = []

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        get matches() {
          return query.includes('dark') ? prefiereOscuro : false
        },
        media: query,
        onchange: null,
        addEventListener: (_type: string, listener: () => void) => {
          listeners.push(listener)
        },
        removeEventListener: (_type: string, listener: () => void) => {
          listeners = listeners.filter((registrado) => registrado !== listener)
        },
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  })
}

describe('proveedor de tema', () => {
  beforeEach(() => {
    localStorage.clear()
    prefiereOscuro = false
    instalarMatchMedia()
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sigue la preferencia del sistema por defecto', () => {
    render(
      <ThemeProvider>
        <Inspector />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('preferencia')).toHaveTextContent('system')
    expect(screen.getByTestId('tema')).toHaveTextContent('light')
  })

  it('aplica el tema oscuro cuando el sistema lo prefiere', () => {
    prefiereOscuro = true

    render(
      <ThemeProvider>
        <Inspector />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('tema')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('alterna entre tema claro y oscuro', async () => {
    const usuario = userEvent.setup()

    render(
      <ThemeProvider>
        <Inspector />
      </ThemeProvider>,
    )

    await usuario.click(screen.getByRole('button', { name: 'Alternar' }))

    expect(screen.getByTestId('tema')).toHaveTextContent('dark')
  })

  it('persiste la preferencia seleccionada', async () => {
    const usuario = userEvent.setup()

    render(
      <ThemeProvider>
        <Inspector />
      </ThemeProvider>,
    )

    await usuario.click(screen.getByRole('button', { name: 'Forzar claro' }))

    expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('light')
  })

  it('restaura la preferencia guardada en una carga posterior', () => {
    localStorage.setItem(STORAGE_KEYS.THEME, 'dark')

    render(
      <ThemeProvider>
        <Inspector />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('tema')).toHaveTextContent('dark')
  })

  it('reacciona al cambio de preferencia del sistema operativo', () => {
    render(
      <ThemeProvider>
        <Inspector />
      </ThemeProvider>,
    )

    expect(listeners.length).toBeGreaterThan(0)

    prefiereOscuro = true
    act(() => {
      for (const listener of listeners) {
        listener()
      }
    })

    expect(screen.getByTestId('tema')).toHaveTextContent('dark')
  })

  it('falla de forma explícita si se consume fuera del proveedor', () => {
    // Se silencia el error de React para que la aserción no se mezcle con él.
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(() => render(<Inspector />)).toThrow(/useTheme/)

    error.mockRestore()
  })
})
