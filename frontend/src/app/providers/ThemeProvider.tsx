import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { persistentStore, STORAGE_KEYS } from '@core/storage/storeFactory'

/** Temas disponibles en la aplicación. */
export const THEMES = ['light', 'dark', 'system'] as const

/** Tema seleccionado por el usuario. */
export type Theme = (typeof THEMES)[number]

/** Tema efectivamente aplicado al documento. */
export type ResolvedTheme = 'light' | 'dark'

/**
 * Comprueba si el sistema operativo prefiere el tema oscuro.
 *
 * @returns `true` si la preferencia del sistema es el tema oscuro.
 */
function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Resuelve la preferencia del usuario a un tema concreto.
 *
 * @param preference Preferencia seleccionada por el usuario.
 * @returns Tema efectivo, nunca `system`.
 */
function resolveTheme(preference: Theme): ResolvedTheme {
  return preference === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : preference
}

/**
 * Aplica el tema al elemento raíz del documento.
 *
 * @param resolved Tema efectivo a aplicar.
 */
function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}

/**
 * Valor que expone el proveedor de tema.
 */
export interface ThemeContextValue {
  /** Tema efectivo aplicado al documento. */
  theme: ResolvedTheme
  /** Preferencia seleccionada por el usuario. */
  preference: Theme
  /** Cambia la preferencia de tema. */
  setPreference: (theme: Theme) => void
  /** Alterna entre tema claro y oscuro. */
  toggle: () => void
}

/**
 * Contexto de tema de la interfaz.
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * Proveedor de tema (patrón Provider).
 *
 * Persiste la preferencia del usuario y la aplica a la clase `dark` del
 * elemento raíz, que es la que activa las variables CSS del tema oscuro.
 *
 * Cuando la preferencia es `system`, el tema efectivo se deriva directamente
 * del estado del sistema durante el renderizado —en lugar de copiarlo a un
 * estado con un efecto— y un único `useEffect` se limita a sincronizar el DOM
 * y a suscribirse a los cambios del sistema operativo.
 *
 * @param props Componentes hijos que heredan el tema.
 * @param children Árbol de la aplicación.
 * @returns El proveedor con su valor de contexto.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<Theme>(() => {
    const stored = persistentStore.get(STORAGE_KEYS.THEME)
    return THEMES.includes(stored as Theme) ? (stored as Theme) : 'system'
  })

  // Se usa un contador como disparador para volver a leer la preferencia del
  // sistema sin duplicar ese valor en un estado propio.
  const [systemRevision, setSystemRevision] = useState(0)

  const theme: ResolvedTheme = resolveTheme(preference)

  /**
   * Persiste y aplica un cambio de preferencia de tema.
   *
   * @param nextTheme Nueva preferencia.
   */
  const setPreference = useCallback((nextTheme: Theme) => {
    setPreferenceState(nextTheme)
    persistentStore.set(STORAGE_KEYS.THEME, nextTheme)
  }, [])

  /**
   * Alterna entre tema claro y oscuro conservando la preferencia actual.
   */
  const toggle = useCallback(() => {
    setPreference(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setPreference])

  // Sincroniza el DOM y sigue los cambios del tema del sistema operativo.
  useEffect(() => {
    applyTheme(theme)

    if (preference !== 'system' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    /**
     * Fuerza un nuevo renderizado al cambiar la preferencia del sistema.
     */
    const onChange = (): void => {
      setSystemRevision((revision) => revision + 1)
    }

    mediaQuery.addEventListener('change', onChange)
    return () => {
      mediaQuery.removeEventListener('change', onChange)
    }
  }, [theme, preference, systemRevision])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, preference, setPreference, toggle }),
    [theme, preference, setPreference, toggle],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}

/**
 * Consume el estado del tema.
 *
 * @returns El valor del contexto de tema.
 * @throws {Error} Si el hook se invoca fuera de {@link ThemeProvider}.
 */
export function useTheme(): ThemeContextValue {
  const context = use(ThemeContext)
  if (context === null) {
    throw new Error('useTheme debe usarse dentro de un <ThemeProvider>')
  }
  return context
}
