import { useTheme } from '@app/providers/ThemeProvider'
import GhostFibers from './GhostFibers'

/**
 * Fondos animados del proyecto.
 *
 * Este módulo concentra las decisiones de diseño de los fondos WebGL: qué se
 * usa en cada pantalla, con qué colores de marca y cómo se relaciona con el
 * tema activo. El componente de React Bits se limita a ejecutar fielmente lo
 * que se le pide, de modo que cambiar el aspecto de un fondo no obliga a
 * tocar código de terceros.
 */

/** Verdes de la marca, derivados de las variables OKLCH del sistema de diseño. */
const BRAND = {
  /** Verde del logotipo en tema claro (`--primary` = `oklch(0.55 0.16 155)`). */
  lightPrimary: '#008b45',
  /** Verde del logotipo en tema oscuro (`--primary` = `oklch(0.7 0.16 155)`). */
  darkPrimary: '#2bbb71',
  /** Verde casi negro de las fibras, equivalente al papel que ocupa el morado oscuro del original. */
  deepGreen: '#082014',
  /** Verde medio de las fibras. */
  forest: '#0f3a26',
} as const

/**
 * Fondo animado de la pantalla de acceso.
 *
 * Se sitúa detrás del formulario y del logotipo. Por debajo se dibuja siempre
 * un degradado CSS: si el navegador no tiene WebGL, o si el usuario ha pedido
 * reducir el movimiento, la pantalla sigue teniendo un fondo coherente con la
 * marca en lugar de quedar en blanco.
 *
 * El parámetro `lightMode` del componente se vincula al tema activo para que el
 * fondo se mantenga legible en ambos casos: en tema claro se usa la variante
 * clara del efecto (fibras oscuras sobre fondo claro) y en tema oscuro, la
 * variante oscura (fibras luminosas sobre fondo casi negro).
 *
 * @returns Capa de fondo con la animación de fibras.
 */
export function AuthBackground() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="bg-background absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Capa base en CSS: garantiza un fondo utilizable sin WebGL. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: isDark
            ? `radial-gradient(120% 90% at 50% 0%, ${BRAND.darkPrimary}2e 0%, transparent 60%), radial-gradient(90% 70% at 20% 100%, ${BRAND.forest} 0%, transparent 55%)`
            : `radial-gradient(120% 90% at 50% 0%, ${BRAND.lightPrimary}26 0%, transparent 60%), radial-gradient(90% 70% at 20% 100%, ${BRAND.forest}1f 0%, transparent 55%)`,
        }}
      />

      <GhostFibers
        lineColor={isDark ? BRAND.deepGreen : BRAND.forest}
        glowColor={isDark ? BRAND.darkPrimary : BRAND.lightPrimary}
        lightMode={!isDark}
      />
    </div>
  )
}
