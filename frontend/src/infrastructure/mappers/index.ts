import type { Ejercicio, GrupoMuscular, UserProfile } from '@domain/entities'
import { isRole } from '@core/rbac/roles'
import { EXERCISE_TYPES, INTENSITY_LEVELS } from '@domain/entities'

/**
 * Mapeo de DTOs a entidades de dominio.
 *
 * El backend puede entregar los campos en `snake_case` (convención habitual
 * en Java y PostgreSQL) o en `camelCase` (si se serializa en el framework).
 * Estos mappers centralizan esa diferencia de formato para que las entidades
 * de dominio sean siempre coherentes, con la nomenclatura y los tipos que
 * espera la interfaz.
 */

/** DTO crudo de grupo muscular. */
export interface GrupoMuscularDto {
  id: string | number
  nombre: string
  descripcion?: string | null
}

/** DTO crudo de ejercicio. */
export interface EjercicioDto {
  id: string | number
  nombre: string
  descripcion?: string | null
  tipo: string
  intensidad: string
  grupos_musculares?: GrupoMuscularDto[]
  gruposMusculares?: GrupoMuscularDto[]
  autor_id?: string | number
  autorId?: string | number
  creado_en?: string
  creadoEn?: string
}

/** DTO crudo de usuario autenticado. */
export interface UserProfileDto {
  id: string | number
  nombre: string
  correo: string
  roles?: string[]
  perfil_id?: string | number | null
  perfilId?: string | number | null
}

/**
 * Convierte un identificador numérico o textual a cadena.
 *
 * @param value Identificador recibido del backend.
 * @returns El mismo valor representado como cadena.
 */
function toId(value: string | number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value)
}

/**
 * Convierte un DTO de grupo muscular a su entidad de dominio.
 *
 * @param dto DTO recibido del backend.
 * @returns Entidad de dominio normalizada.
 */
export function toGrupoMuscular(dto: GrupoMuscularDto): GrupoMuscular {
  return {
    id: toId(dto.id),
    nombre: dto.nombre,
    descripcion: dto.descripcion ?? null,
  }
}

/**
 * Convierte un DTO de ejercicio a su entidad de dominio.
 *
 * Descarta los valores de enumeración desconocidos (por ejemplo, un tipo
 * añadido por el backend que esta versión del frontend todavía no conoce), en
 * lugar de propagar un valor inválido hasta la interfaz.
 *
 * @param dto DTO recibido del backend.
 * @returns Entidad de dominio normalizada.
 */
export function toEjercicio(dto: EjercicioDto): Ejercicio {
  const tipo = EXERCISE_TYPES.find((valor) => valor === dto.tipo)
  const intensidad = INTENSITY_LEVELS.find((valor) => valor === dto.intensidad)

  return {
    id: toId(dto.id),
    nombre: dto.nombre,
    descripcion: dto.descripcion ?? null,
    tipo: tipo ?? 'fuerza',
    intensidad: intensidad ?? 'media',
    gruposMusculares: (dto.grupos_musculares ?? dto.gruposMusculares ?? []).map(toGrupoMuscular),
    autorId: toId(dto.autor_id ?? dto.autorId),
    creadoEn: dto.creado_en ?? dto.creadoEn ?? new Date(0).toISOString(),
  }
}

/**
 * Convierte un DTO de usuario a su entidad de dominio.
 *
 * Filtra los roles que no estén declarados en {@link isRole}, de modo que un
 * rol desconocido no conceda permisos por accidente.
 *
 * @param dto DTO recibido del backend.
 * @returns Perfil de usuario normalizado.
 */
export function toUserProfile(dto: UserProfileDto): UserProfile {
  const perfilId = dto.perfil_id ?? dto.perfilId ?? null

  return {
    id: toId(dto.id),
    nombre: dto.nombre,
    correo: dto.correo,
    roles: (dto.roles ?? []).filter(isRole),
    perfilId: perfilId === null ? null : toId(perfilId),
  }
}
