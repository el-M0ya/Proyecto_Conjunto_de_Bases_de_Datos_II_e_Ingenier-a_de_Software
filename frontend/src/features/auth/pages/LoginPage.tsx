import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { useSession } from '../context/SessionContext'
import { APP_ROUTES } from '@core/config/routes'
import { Button } from '@shared/components/ui/Button'
import { Field, FieldError, FieldLabel, Input } from '@shared/components/ui/Field'
import { toAppError } from '@core/errors/AppError'

/**
 * Esquema de validación del formulario de acceso.
 *
 * Se declara junto a la pantalla porque su forma es una decisión de la propia
 * interfaz, no una regla de negocio del dominio.
 */
const loginSchema = z.object({
  correo: z.string().min(1, 'El correo es obligatorio').email('Introduce un correo válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

/** Valores del formulario de acceso. */
type LoginValues = z.infer<typeof loginSchema>

/**
 * Pantalla de inicio de sesión.
 *
 * Valida la entrada en el cliente antes de enviarla, desactiva el botón
 * mientras la petición está en curso para evitar envíos duplicados y devuelve
 * al usuario a la ruta que intentaba visitar antes de la autenticación.
 *
 * @returns Formulario de acceso renderizado.
 */
export function LoginPage() {
  const { signIn } = useSession()
  const navigate = useNavigate()
  const location = useLocation()

  const [values, setValues] = useState<LoginValues>({ correo: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginValues, string>>>({})

  const mutation = useMutation({
    /**
     * Autentica al usuario con las credenciales ya validadas.
     *
     * @param credenciales Correo y contraseña ya validados por el esquema.
     * @returns Promesa resuelta con la sesión iniciada.
     */
    mutationFn: (credenciales: LoginValues) => signIn(credenciales),
    /**
     * Redirige al destino solicitado tras completar el acceso.
     */
    onSuccess: () => {
      toast.success('Sesión iniciada correctamente')
      const requested = (location.state as { from?: string } | null)?.from
      // `void` marca la navegación como intencionadamente no esperada: en las
      // rutas declaradas con `replace` la promesa nunca se rechaza.
      void navigate(requested ?? APP_ROUTES.dashboard, { replace: true })
    },
  })

  /**
   * Valida el formulario y, si es correcto, inicia la autenticación.
   *
   * @param event Evento de envío del formulario.
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    const result = loginSchema.safeParse(values)
    if (!result.success) {
      const errors: Partial<Record<keyof LoginValues, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginValues | undefined
        if (field && !errors[field]) {
          errors[field] = issue.message
        }
      }
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    mutation.mutate(result.data)
  }

  const errorMessage = mutation.isError ? toAppError(mutation.error).message : null

  return (
    <div className="w-full max-w-sm">
      <div className="bg-card rounded-xl border p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Iniciar sesión</h1>
        <p className="text-muted-foreground mt-1 mb-6 text-sm">
          Accede con las credenciales que te proporcionó el administrador del gimnasio.
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <Field>
            <FieldLabel htmlFor="correo">Correo electrónico</FieldLabel>
            <Input
              id="correo"
              name="correo"
              type="email"
              autoComplete="email"
              required
              value={values.correo}
              aria-invalid={Boolean(fieldErrors.correo)}
              onChange={(event) =>
                setValues((previous) => ({ ...previous, correo: event.target.value }))
              }
            />
            {fieldErrors.correo && <FieldError>{fieldErrors.correo}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={values.password}
              aria-invalid={Boolean(fieldErrors.password)}
              onChange={(event) =>
                setValues((previous) => ({ ...previous, password: event.target.value }))
              }
            />
            {fieldErrors.password && <FieldError>{fieldErrors.password}</FieldError>}
          </Field>

          {errorMessage && <FieldError>{errorMessage}</FieldError>}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Verificando…' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
