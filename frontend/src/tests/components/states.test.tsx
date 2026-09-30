import {
  EmptyState,
  ErrorMessage,
  ErrorState,
  LoadingState,
} from '@shared/components/feedback/States'
import { Button } from '@shared/components/ui/Button'
import { Field, FieldError, FieldHint, FieldLabel, Textarea } from '@shared/components/ui/Field'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

describe('estados de retroalimentación', () => {
  describe('LoadingState', () => {
    it('anuncia la carga a la tecnología de asistencia', () => {
      render(<LoadingState />)

      expect(screen.getByRole('status')).toHaveTextContent('Cargando')
    })
  })

  describe('ErrorMessage', () => {
    it('muestra el mensaje recibido', () => {
      render(<ErrorMessage message="No se pudo conectar con el servidor" />)

      expect(screen.getByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor')
    })

    it('ofrece reintentar sólo cuando se aporta la acción', async () => {
      const reintentar = vi.fn()
      const usuario = userEvent.setup()

      render(<ErrorMessage message="Fallo de red" onRetry={reintentar} />)

      await usuario.click(screen.getByRole('button', { name: 'Reintentar' }))

      expect(reintentar).toHaveBeenCalledOnce()
    })

    it('omite el botón cuando no hay acción de recuperación', () => {
      render(<ErrorMessage message="Recurso inexistente" />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('ErrorState', () => {
    it('se anuncia como alerta', () => {
      render(
        <ErrorState>
          <p>Detalle técnico</p>
        </ErrorState>,
      )

      expect(screen.getByRole('alert')).toHaveTextContent('Detalle técnico')
    })
  })

  describe('EmptyState', () => {
    it('explica que no hay resultados', () => {
      render(<EmptyState title="Sin ejercicios" description="Aún no has registrado ejercicios." />)

      expect(screen.getByText('Sin ejercicios')).toBeInTheDocument()
      expect(screen.getByText('Aún no has registrado ejercicios.')).toBeInTheDocument()
    })

    it('muestra la acción que se le pasa', () => {
      render(<EmptyState action={<Button variant="outline">Crear ejercicio</Button>} />)

      expect(screen.getByRole('button', { name: 'Crear ejercicio' })).toBeInTheDocument()
    })

    it('usa textos por defecto cuando no se personaliza', () => {
      render(<EmptyState />)

      expect(screen.getByText('Sin resultados')).toBeInTheDocument()
    })
  })
})

describe('campos de formulario', () => {
  it('asocia la etiqueta al control mediante `htmlFor`', () => {
    render(
      <Field>
        <FieldLabel htmlFor="correo">Correo</FieldLabel>
        <textarea id="correo" />
      </Field>,
    )

    expect(screen.getByLabelText('Correo')).toBeInTheDocument()
  })

  it('anuncia el mensaje de error como alerta', () => {
    render(<FieldError>El correo es obligatorio</FieldError>)

    expect(screen.getByRole('alert')).toHaveTextContent('El correo es obligatorio')
  })

  it('muestra el texto de ayuda del campo', () => {
    render(<FieldHint>Mínimo 8 caracteres</FieldHint>)

    expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument()
  })

  it('permite escribir en el área de texto', async () => {
    const usuario = userEvent.setup()

    render(<Textarea aria-label="Observaciones" />)
    const campo = screen.getByLabelText('Observaciones')

    await usuario.type(campo, 'Carga adecuada')

    expect(campo).toHaveValue('Carga adecuada')
  })
})
