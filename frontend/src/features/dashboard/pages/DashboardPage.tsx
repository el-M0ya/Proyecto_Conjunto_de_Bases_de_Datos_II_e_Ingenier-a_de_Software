import { Link } from 'react-router-dom'
import { useSession } from '@features/auth/context/SessionContext'
import { PERMISSIONS } from '@core/rbac/permissions'
import { hasPermission } from '@core/rbac/permissions'
import { Card, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/Card'
import { ROLE_LABELS } from '@core/rbac/roles'

/**
 * Tarjeta de acceso rápido del panel.
 *
 * @param props Contenido y destino del acceso rápido.
 * @param title Título de la tarjeta.
 * @param description Explicación breve de la acción.
 * @param to Ruta de destino.
 * @param visible Si el acceso debe mostrarse al usuario actual.
 * @returns Tarjeta renderizada, o `null` si el usuario no tiene acceso.
 */
function ShortcutCard({
  title,
  description,
  to,
  visible,
}: {
  title: string
  description: string
  to: string
  visible: boolean
}) {
  if (!visible) {
    return null
  }

  return (
    <Link to={to}>
      <Card className="hover:border-primary/50 h-full transition-colors">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}

/**
 * Panel principal, adaptado al rol del usuario autenticado.
 *
 * Los accesos se filtran por permisos, de modo que cada perfil ve
 * únicamente las tareas que le corresponden según el enunciado.
 *
 * @returns Panel principal renderizado.
 */
export function DashboardPage() {
  const { user } = useSession()
  const roles = user?.roles ?? []
  /**
   * Comprueba un permiso sobre los roles del usuario autenticado.
   *
   * @param permission Permiso a comprobar.
   * @returns `true` si el usuario lo posee a través de alguno de sus roles.
   */
  const can = (permission: (typeof PERMISSIONS)[keyof typeof PERMISSIONS]): boolean =>
    hasPermission(roles, permission)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <h1 className="text-xl font-semibold">
          Hola, {user?.nombre.split(' ')[0] ?? 'bienvenido'}
        </h1>
        <p className="text-muted-foreground text-sm">
          Perfil: {user?.roles.map((rol) => ROLE_LABELS[rol]).join(' · ')}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ShortcutCard
          title="Banco de ejercicios"
          description="Consulta, clasifica e incorpora ejercicios al banco."
          to="/panel/ejercicios"
          visible={can(PERMISSIONS.EXERCISE_READ)}
        />
        <ShortcutCard
          title="Generar rutina"
          description="Crea una rutina automáticamente a partir de los criterios del programa."
          to="/panel/rutinas/generar"
          visible={can(PERMISSIONS.ROUTINE_GENERATE)}
        />
        <ShortcutCard
          title="Validar rutinas"
          description="Revisa y aprueba las rutinas pendientes de los entrenadores."
          to="/panel/rutinas/validacion"
          visible={can(PERMISSIONS.ROUTINE_VALIDATE)}
        />
        <ShortcutCard
          title="Mis rutinas"
          description="Consulta tus rutinas asignadas y registra cada sesión ejecutada."
          to="/panel/rutinas"
          visible={can(PERMISSIONS.ROUTINE_EXECUTE)}
        />
        <ShortcutCard
          title="Reportes"
          description="Analiza el progreso de los clientes y la distribución de ejercicios."
          to="/panel/reportes"
          visible={can(PERMISSIONS.REPORT_READ)}
        />
        <ShortcutCard
          title="Administración"
          description="Gestiona usuarios, roles y el control de duplicados del banco."
          to="/panel/administracion"
          visible={can(PERMISSIONS.USER_MANAGE)}
        />
      </div>
    </div>
  )
}
