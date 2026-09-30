import { z } from 'zod'

/**
 * Esquema de validación de las variables de entorno.
 *
 * Vite sólo expone al navegador las variables con prefijo `VITE_`. Este esquema
 * actúa como «frontera de confianza»: valida y normaliza la configuración en
 * el arranque de la aplicación, de modo que el resto del código nunca trabaja
 * con cadenas sin validar ni con `undefined` implícito.
 */
const envSchema = z.object({
  /** Modo de ejecución de la aplicación. */
  VITE_APP_ENV: z.enum(['development', 'production', 'test']).default('development'),

  /** Nombre visible de la aplicación (interfaz y encabezados de PDF). */
  VITE_APP_NAME: z.string().min(1).default('Base de Batos'),

  /** Ruta base de la API. Cadena vacía = misma origen (proxy en desarrollo). */
  VITE_API_BASE_URL: z.string().default('/api'),

  /** Destino real del proxy de Vite en desarrollo. */
  VITE_API_PROXY_TARGET: z.string().default('http://localhost:8080'),

  /** Prefijo reenviado por el proxy de Vite. */
  VITE_API_PREFIX: z.string().default('/api'),

  /** Tiempo máximo de espera de una petición, en milisegundos. */
  VITE_API_TIMEOUT: z.coerce.number().int().positive().default(15_000),

  /** Número de reintentos automáticos ante errores transitorios. */
  VITE_API_RETRY_COUNT: z.coerce.number().int().min(0).max(5).default(2),

  /** Configuración regional por defecto. */
  VITE_DEFAULT_LOCALE: z.string().default('es-CU'),

  /** Zona horaria por defecto para el formateo de fechas. */
  VITE_DEFAULT_TIMEZONE: z.string().default('America/Havana'),

  /** Activa los datos simulados (MSW) en lugar de la API real. */
  VITE_ENABLE_MOCKS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
})

/** Configuración de la aplicación ya validada y con tipos correctos. */
export type AppEnv = z.infer<typeof envSchema>

/**
 * Normaliza la ruta base de la API para impedir que se generen URLs inválidas
 * (doble barra inicial o barra final antes de un segmento de ruta).
 *
 * @param baseUrl Ruta base declarada en el entorno.
 * @returns Ruta base sin barra inicial ni final; cadena vacía si no se definió.
 */
function normalizeBaseUrl(baseUrl: string): string {
  if (!baseUrl || baseUrl === '/') {
    return ''
  }
  return baseUrl.replace(/^\/+|\/+$/g, '')
}

/**
 * Construye y valida la configuración a partir de un objeto de entrada.
 *
 * Se exporta por separado para poder reutilizarla en las pruebas unitarias
 * con valores arbitrarios, sin depender del entorno real del proceso.
 *
 * @param source Objeto con las variables de entorno (normalmente `import.meta.env`).
 * @returns Configuración tipada y validada.
 * @throws {z.ZodError} Si alguna variable es inválida.
 */
export function loadEnv(source: Record<string, unknown>): AppEnv {
  const parsed = envSchema.parse(source)
  return {
    ...parsed,
    VITE_API_BASE_URL: normalizeBaseUrl(parsed.VITE_API_BASE_URL),
  }
}

/**
 * Configuración de la aplicación, disponible en todo el código.
 *
 * @example
 * ```ts
 * if (env.isProduction) { ... }
 * ```
 */
export const env: AppEnv = loadEnv(import.meta.env)

/** `true` cuando la aplicación se ejecuta fuera del modo desarrollo. */
export const isProduction = env.VITE_APP_ENV === 'production'

/** `true` cuando la aplicación se ejecuta en modo pruebas. */
export const isTest = env.VITE_APP_ENV === 'test'
