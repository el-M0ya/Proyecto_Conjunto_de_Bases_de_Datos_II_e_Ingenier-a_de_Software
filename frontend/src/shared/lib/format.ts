import { env } from '@core/config/env'

/**
 * Utilidades de formateo para la interfaz.
 *
 * Todas las fechas y cantidades se presentan con la configuración regional
 * `es-CU` y la zona horaria del proyecto, de modo que la interfaz sea
 * consistente para todos los usuarios, independientemente de la configuración
 * de su dispositivo.
 */

/** Opciones comunes de formateo de números. */
const NUMBER_FORMAT = new Intl.NumberFormat(env.VITE_DEFAULT_LOCALE, {
  maximumFractionDigits: 2,
})

/** Formateador de porcentajes con un solo decimal. */
const PERCENT_FORMAT = new Intl.NumberFormat(env.VITE_DEFAULT_LOCALE, {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

/** Formateador de fechas en formato largo. */
const DATE_FORMAT = new Intl.DateTimeFormat(env.VITE_DEFAULT_LOCALE, {
  dateStyle: 'long',
  timeZone: env.VITE_DEFAULT_TIMEZONE,
})

/** Formateador de fecha y hora. */
const DATE_TIME_FORMAT = new Intl.DateTimeFormat(env.VITE_DEFAULT_LOCALE, {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: env.VITE_DEFAULT_TIMEZONE,
})

/** Formateador de horas y minutos. */
const TIME_FORMAT = new Intl.DateTimeFormat(env.VITE_DEFAULT_LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: env.VITE_DEFAULT_TIMEZONE,
})

/**
 * Formatea una fecha en formato largo.
 *
 * @param value Fecha a formatear.
 * @returns Fecha expresada como `22 de septiembre de 2026`.
 */
export function formatDate(value: string | Date): string {
  return DATE_FORMAT.format(new Date(value))
}

/**
 * Formatea una fecha con su hora.
 *
 * @param value Fecha a formatear.
 * @returns Fecha y hora legibles.
 */
export function formatDateTime(value: string | Date): string {
  return DATE_TIME_FORMAT.format(new Date(value))
}

/**
 * Formatea únicamente la hora de una fecha.
 *
 * @param value Fecha a formatear.
 * @returns Hora en formato de 24 horas.
 */
export function formatTime(value: string | Date): string {
  return TIME_FORMAT.format(new Date(value))
}

/**
 * Formatea un número con separadores de miles.
 *
 * @param value Número a formatear.
 * @returns Número con formato local.
 */
export function formatNumber(value: number): string {
  return NUMBER_FORMAT.format(value)
}

/**
 * Convierte una tasa (0 a 1) en porcentaje legible.
 *
 * @param value Tasa expresada entre 0 y 1.
 * @returns Porcentaje con un decimal, por ejemplo `82 %`.
 */
export function formatPercent(value: number): string {
  return PERCENT_FORMAT.format(value)
}

/**
 * Convierte una duración en segundos a un texto de minutos y segundos.
 *
 * @param seconds Duración en segundos.
 * @returns Texto como `1 min 30 s`.
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  if (minutes === 0) {
    return `${rest} s`
  }
  return rest === 0 ? `${minutes} min` : `${minutes} min ${rest} s`
}

/**
 * Extrae las iniciales de un nombre completo, para el avatar del usuario.
 *
 * @param nombre Nombre completo del usuario.
 * @returns Iniciales en mayúsculas, como un máximo de dos letras.
 */
export function initialsOf(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}
