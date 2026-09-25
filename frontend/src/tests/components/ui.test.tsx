import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'
import { Card, CardContent, CardTitle } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Field'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { cn } from '@shared/lib/cn'

describe('primitivos del sistema de diseño', () => {
  describe('cn', () => {
    it('combina clases condicionales', () => {
      const activo = false
      expect(cn('base', activo && 'oculta', 'extra')).toBe('base extra')
    })

    it('resuelve los conflictos de utilidad conservando la última', () => {
      expect(cn('p-2', 'p-4')).toBe('p-4')
    })

    it('admite arreglos y objetos de clases', () => {
      expect(cn(['a', 'b'], { c: true, d: false })).toBe('a b c')
    })
  })

  describe('Button', () => {
    it('aplica las clases de la variante por defecto', () => {
      render(<Button>Guardar</Button>)

      const boton = screen.getByRole('button', { name: 'Guardar' })
      expect(boton.className).toContain('bg-primary')
    })

    it('cambia de estilo según la variante', () => {
      render(<Button variant="destructive">Eliminar</Button>)

      expect(screen.getByRole('button', { name: 'Eliminar' }).className).toContain('bg-destructive')
    })

    it('permite que el llamador sobrescriba el tamaño', () => {
      render(
        <Button size="lg" className="ancho-propio">
          Continuar
        </Button>,
      )

      const boton = screen.getByRole('button', { name: 'Continuar' })
      expect(boton.className).toContain('h-11')
      expect(boton.className).toContain('ancho-propio')
    })

    it('delega el estilo al hijo cuando se usa `asChild`', () => {
      render(
        <Button asChild>
          <a href="/panel">Ir al panel</a>
        </Button>,
      )

      const enlace = screen.getByRole('link', { name: 'Ir al panel' })
      expect(enlace.tagName).toBe('A')
      expect(enlace.className).toContain('bg-primary')
    })

    it('no interactúa cuando está deshabilitado', () => {
      render(<Button disabled>Procesando</Button>)

      expect(screen.getByRole('button', { name: 'Procesando' })).toBeDisabled()
    })
  })

  describe('Badge', () => {
    it('muestra el texto de la etiqueta', () => {
      render(<Badge>Alta</Badge>)
      expect(screen.getByText('Alta')).toBeInTheDocument()
    })

    it('distingue los niveles de intensidad por estilo', () => {
      const { container } = render(<Badge variant="warning">Media</Badge>)

      expect(container.firstElementChild?.className).toContain('text-warning')
    })
  })

  describe('Card', () => {
    it('compone título y contenido', () => {
      render(
        <Card>
          <CardTitle>Banco de ejercicios</CardTitle>
          <CardContent>120 ejercicios registrados</CardContent>
        </Card>,
      )

      expect(screen.getByRole('heading', { name: 'Banco de ejercicios' })).toBeInTheDocument()
      expect(screen.getByText('120 ejercicios registrados')).toBeInTheDocument()
    })
  })

  describe('Input', () => {
    it('expone el estado de error a la tecnología de asistencia', () => {
      render(<Input aria-invalid />)

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })

    it('respeta el tipo indicado', () => {
      render(<Input type="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    })
  })
})
