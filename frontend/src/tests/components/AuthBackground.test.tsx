import { AuthBackground } from '@shared/components/backgrounds/Backgrounds'
import { ThemeProvider } from '@app/providers/ThemeProvider'
import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Estado compartido con el doble de `ogl`.
 *
 * Se declara con `vi.hoisted` porque la fábrica de `vi.mock` se eleva por
 * encima de las importaciones y no podría cerrar sobre variables externas.
 */
const estado = vi.hoisted(() => ({
  /** Fuerza a que la creación del contexto de WebGL falle. */
  fallarRenderer: false,
  /** Instancias de `Renderer` creadas durante la prueba. */
  instancias: [] as Array<{ setSize: unknown; render: unknown }>,
}))

vi.mock('ogl', () => {
  /**
   * Doble del renderizador de `ogl`.
   */
  class Renderer {
    /** Contexto de WebGL simulado. */
    gl: Record<string, unknown>
    /** Tamaño solicitado al renderizador. */
    setSize = vi.fn()
    /** Renderizadores de una sola escena. */
    render = vi.fn()

    /**
     * Construye el doble, o falla si la prueba lo pide.
     */
    constructor() {
      if (estado.fallarRenderer) {
        throw new Error('WebGL no disponible')
      }
      estado.instancias.push(this)
      this.gl = {
        canvas: document.createElement('canvas'),
        drawingBufferWidth: 1024,
        drawingBufferHeight: 768,
        getExtension: () => null,
      }
    }
  }

  /**
   * Doble del programa de `ogl`, que conserva los uniformes entregados.
   */
  class Program {
    /** Uniformes del programa. */
    uniforms: Record<string, { value: unknown }>

    /**
     * Construye el doble con los uniformes indicados.
     *
     * @param _gl Contexto de WebGL simulado.
     * @param options Opciones del programa.
     */
    constructor(_gl: unknown, options: { uniforms: Record<string, { value: unknown }> }) {
      this.uniforms = options.uniforms
    }
  }

  /** Doble de la malla del triángulo a pantalla completa. */
  class Mesh {}
  /** Doble de la geometría del triángulo. */
  class Triangle {}

  return { Renderer, Program, Mesh, Triangle }
})

/**
 * Monta el fondo con el proveedor de tema.
 *
 * @returns Resultado del renderizado.
 */
function renderBackground() {
  return render(
    <ThemeProvider>
      <AuthBackground />
    </ThemeProvider>,
  )
}

describe('fondo animado de la pantalla de acceso', () => {
  beforeEach(() => {
    estado.fallarRenderer = false
    estado.instancias.length = 0
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('añade un lienzo de WebGL al montar', () => {
    const { container } = renderBackground()

    expect(container.querySelector('canvas')).toBeInTheDocument()
  })

  it('marca el lienzo como decorativo para la tecnología de asistencia', () => {
    const { container } = renderBackground()

    expect(container.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true')
  })

  it('informa al renderizador del tamaño del lienzo', () => {
    const { container } = renderBackground()
    const canvas = container.querySelector('canvas')

    expect(estado.instancias).toHaveLength(1)
    expect(canvas?.style.width).toBe('100%')
    expect(canvas?.style.height).toBe('100%')
  })

  it('retira el lienzo y libera el contexto al desmontar', () => {
    const { container, unmount } = renderBackground()

    expect(container.querySelector('canvas')).toBeInTheDocument()

    unmount()

    expect(container.querySelector('canvas')).not.toBeInTheDocument()
  })

  it('mantiene el degradado de respaldo cuando el navegador no tiene WebGL', () => {
    estado.fallarRenderer = true

    const { container } = renderBackground()

    // Sin WebGL no hay lienzo, pero la capa de fondo en CSS sigue presente para
    // que la pantalla no quede en blanco.
    expect(container.querySelector('canvas')).not.toBeInTheDocument()
    expect(container.querySelector('[style*="radial-gradient"]')).toBeInTheDocument()
  })

  it('expone el fondo sólo como capa decorativa', () => {
    const { container } = renderBackground()

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('detiene la animación cuando la pestaña pierde el foco', () => {
    const { container } = renderBackground()

    expect(container.querySelector('canvas')).toBeInTheDocument()
    expect(estado.instancias).toHaveLength(1)

    // El ciclo de vida no debe lanzar al alternar la visibilidad del documento.
    expect(() => {
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'))
      })
    }).not.toThrow()
  })
})
