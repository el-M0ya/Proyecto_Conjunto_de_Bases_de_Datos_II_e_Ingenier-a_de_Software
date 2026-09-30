import { Mesh, Program, Renderer, Triangle } from 'ogl'
import { useEffect, useRef, type FC } from 'react'

/*
 * Componente «Ghost Fibers» de React Bits (https://reactbits.dev).
 *
 * Adapted al proyecto «Base de Batos»:
 *
 * - Los sombreadores de vértices y fragmento, y la estructura del bucle de
 *   animación, se conservan **sin modificar** respecto del original.
 * - Todos los parámetros mantienen sus valores por defecto, salvo los colores,
 *   que se cambian a los verdes de la marca.
 * - Se añade una comprobación de disponibilidad de WebGL: el original asume
 *   que el contexto se puede crear y, si falla, la pantalla de acceso quedaría
 *   en blanco. Aquí el fallo se captura y el contenedor queda vacío, de modo que
 *   la capa de fondoCSS de quien lo utiliza siga siendo visible.
 */

/**
 * Convierte un color hexadecimal a componentes normalizados de RGB.
 *
 * @param hex Color en formato `#rgb` o `#rrggbb`.
 * @returns Componentes rojo, verde y azul en el intervalo `[0, 1]`.
 */
const hexToRgb = (hex: string): [number, number, number] => {
  const value = hex.trim().replace(/^#/, '')
  const normalized = value.length === 3 ? value.replace(/./g, (ch) => ch + ch) : value
  const match = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
  if (!match) return [1, 1, 1]

  // La expresión regular garantiza tres grupos; los valores por defecto sólo
  // satisfacen la comprobación de índice del compilador con `noUncheckedIndexedAccess`.
  const [, red = 'ff', green = 'ff', blue = 'ff'] = match

  return [
    Number.parseInt(red, 16) / 255,
    Number.parseInt(green, 16) / 255,
    Number.parseInt(blue, 16) / 255,
  ]
}

/** Uniform que transporta un escalar de precisión simple. */
type NumberUniform = { value: number }

/** Uniform que transporta un color como vector de tres componentes. */
type ColorUniform = { value: Float32Array }

/**
 * Uniforms del sombreador, tipados según su declaración en GLSL.
 *
 * Declarar la interfaz a mano tiene dos beneficios: el compilador detecta
 * cualquier cambio en el sombreador que no se propague a estas definiciones, y
 * el acceso deja de ser `any`, lo que permite activar las reglas de seguridad
 * de tipos del proyecto.
 */
interface GhostFibersUniforms {
  uResolution: ColorUniform
  uTime: NumberUniform
  uSpeed: NumberUniform
  uScale: NumberUniform
  uRotation: NumberUniform
  uRotationSpeed: NumberUniform
  uLayers: NumberUniform
  uWaveAmplitude: NumberUniform
  uWaveFrequency: NumberUniform
  uWaveSpeed: NumberUniform
  uLayerSpeed: NumberUniform
  uTwist: NumberUniform
  uTwistFrequency: NumberUniform
  uTwistSpeed: NumberUniform
  uLineFrequency: NumberUniform
  uLineSpacing: NumberUniform
  uLineSharpness: NumberUniform
  uGlowFalloff: NumberUniform
  uGlowIntensity: NumberUniform
  uBrightness: NumberUniform
  uBlueBoost: NumberUniform
  uVignette: NumberUniform
  uGrain: NumberUniform
  uLightMode: NumberUniform
  uLineColor: ColorUniform
  uGlowColor: ColorUniform
}

/**
 * Obtiene los uniformes del programa con su tipo real.
 *
 * `ogl` declara el diccionario de uniformes como `Record<string, any>`, por lo
 * que cualquier acceso directo sería inseguro y obligaría a desactivar las
 * reglas de seguridad de tipos. La conversión se concentra aquí, en un único
 * punto justificado; a partir de él, el resto del componente trabaja con tipos
 * concretos y verificables.
 *
 * @param program Programa de WebGL ya compilado.
 * @returns Los uniformes del programa con su interfaz declarada.
 */
function typedUniforms(program: InstanceType<typeof Program>): GhostFibersUniforms {
  return program.uniforms as unknown as GhostFibersUniforms
}

/**
 * Escribe un color hexadecimal en el uniform correspondiente.
 *
 * @param uniform Uniform de destino.
 * @param hex Color a escribir.
 */
const setColor = (uniform: ColorUniform, hex: string): void => {
  const color = hexToRgb(hex)
  uniform.value[0] = color[0]
  uniform.value[1] = color[1]
  uniform.value[2] = color[2]
}

const vertex = `#version 300 es
in vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uLayers;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;
uniform float uWaveSpeed;
uniform float uLayerSpeed;
uniform float uTwist;
uniform float uTwistFrequency;
uniform float uTwistSpeed;
uniform float uLineFrequency;
uniform float uLineSpacing;
uniform float uLineSharpness;
uniform float uGlowFalloff;
uniform float uGlowIntensity;
uniform float uBrightness;
uniform float uBlueBoost;
uniform float uVignette;
uniform float uGrain;
uniform float uRotationSpeed;
uniform float uLightMode;
uniform vec3 uLineColor;
uniform vec3 uGlowColor;

out vec4 fragColor;

#define MAX_LAYERS 10

mat2 rotate2d(float angle) {
  float sine = sin(angle);
  float cosine = cos(angle);
  return mat2(cosine, -sine, sine, cosine);
}

float grainHash(vec2 point) {
  point = floor(point);
  float hash = 52.9829189 * fract(dot(point, vec2(0.065, 0.005)));
  return fract(hash);
}

float layeredGrain(vec2 fragmentPixel) {
  vec2 point = mod(fragmentPixel + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
  vec2 rotated = mat2(0.8, -0.5, 0.5, 0.8) * point;
  float grain = 0.0;
  grain += 0.40 * grainHash(rotated);
  grain += 0.25 * grainHash(rotated * 2.0 + 17.0);
  grain += 0.20 * grainHash(rotated * 4.0 + 47.0);
  grain += 0.10 * grainHash(rotated * 8.0 + 113.0);
  grain += 0.05 * grainHash(rotated * 16.0 + 191.0);
  return grain;
}

void main() {
  vec2 resolution = max(uResolution, vec2(1.0));
  vec2 uv = (2.0 * gl_FragCoord.xy - resolution) / resolution.y;
  float time = uTime * uSpeed;
  vec3 backdrop = mix(vec3(0.070588, 0.058824, 0.090196), vec3(1.0), step(0.5, uLightMode));
  vec3 centerTone = max(uLineColor * 0.85567 - uGlowColor * 0.06186, vec3(0.0));
  vec3 cloudTone = uLineColor * 0.19588 + uGlowColor * 0.2268;
  vec2 p = uv;
  p /= max(uScale, 0.05);
  p = rotate2d(radians(uRotation) + time * uRotationSpeed) * p;
  vec3 color = vec3(0.0);
  float fiberField = 0.0;

  for (int index = 0; index < MAX_LAYERS; index++) {
    float fi = float(index) + 1.0;
    if (fi > uLayers) break;

    p += uWaveAmplitude * sin(p.yx * fi * uWaveFrequency + time * (uWaveSpeed + fi * uLayerSpeed));

    float radius = length(p);
    float polarAngle = atan(p.y, p.x);
    polarAngle += sin(radius * uTwistFrequency - time * uTwistSpeed + fi) * uTwist;
    p = vec2(cos(polarAngle), sin(polarAngle)) * radius;

    float lines = abs(sin(p.x * (uLineFrequency + fi * uLineSpacing) + sin(p.y * 3.0 + time)));
    lines = pow(max(0.0, 1.0 - lines), uLineSharpness);
    fiberField += lines / fi;
    color += uLineColor * lines / fi;

    float glow = exp(-uGlowFalloff * abs(sin(p.x * 3.0 + time + fi)));
    color += uGlowColor * glow * uGlowIntensity / (fi * 2.0);
  }

  float center = exp(-2.2 * dot(uv, uv));
  color += centerTone * center;

  float cloud = exp(-1.5 * length(uv + vec2(sin(time * 0.3) * 0.25, cos(time * 0.25) * 0.18)));
  color += cloudTone * cloud;

  float vignette = 1.0 - smoothstep(0.35, 1.45, length(uv));
  color *= mix(1.0 - uVignette, 1.0, vignette);
  color = 1.0 - exp(-color * uBrightness);
  color.b *= uBlueBoost;

  vec3 outputColor;
  if (uLightMode > 0.5) {
    float edgeFade = mix(1.0 - uVignette, 1.0, vignette);
    float fibers = pow(smoothstep(0.12, 1.05, fiberField) * edgeFade, 1.5);
    float atmosphere = (center * 0.025 + cloud * 0.015) * edgeFade;
    vec3 fiberInk = mix(backdrop, uLineColor, 0.52);
    vec3 airColor = mix(backdrop, uGlowColor, 0.16);

    outputColor = mix(backdrop, airColor, atmosphere);
    outputColor = mix(outputColor, fiberInk, fibers * 0.3);
  } else {
    outputColor = backdrop + color;
  }

  float noise = (layeredGrain(gl_FragCoord.xy) - 0.5) * uGrain;
  outputColor = clamp(outputColor + noise, 0.0, 1.0);
  fragColor = vec4(outputColor, 1.0);
}
`

/**
 * Recursos de WebGL de una instancia del fondo.
 *
 * Se guardan en un `WeakMap` porque el componente separa la creación del
 * contexto del primer efecto y la actualización de los uniform del segundo:
 * sin este registro, el segundo efecto no podría alcanzar el programa ya
 * compilado.
 */
type GhostFibersContext = {
  renderer: InstanceType<typeof Renderer>
  program: InstanceType<typeof Program>
  mesh: InstanceType<typeof Mesh>
  render: () => void
  setPaused: (value: boolean) => void
  setFps: (value: number) => void
}

/** Contextos de WebGL viva, indexados por su contenedor en el DOM. */
const contexts = new WeakMap<HTMLDivElement, GhostFibersContext>()

/** Propiedades del fondo «Ghost Fibers». */
export interface GhostFibersProps {
  /** Color de las fibras. */
  lineColor?: string
  /** Color del resplandor alrededor de las fibras. */
  glowColor?: string
  /** Velocidad global de la animación. */
  speed?: number
  /** Escala del patrón. */
  scale?: number
  /** Rotación inicial, en grados. */
  rotation?: number
  /** Velocidad de rotación continua. */
  rotationSpeed?: number
  /** Número de capas de fibras (entre 1 y 10). */
  layers?: number
  /** Amplitud de la deformación ondulada. */
  waveAmplitude?: number
  /** Frecuencia de la deformación ondulada. */
  waveFrequency?: number
  /** Velocidad de la deformación ondulada. */
  waveSpeed?: number
  /** Velocidad adicional por capa. */
  layerSpeed?: number
  /** Intensidad del retorcimiento. */
  twist?: number
  /** Frecuencia del retorcimiento. */
  twistFrequency?: number
  /** Velocidad del retorcimiento. */
  twistSpeed?: number
  /** Frecuencia de las líneas. */
  lineFrequency?: number
  /** Separación entre capas de líneas. */
  lineSpacing?: number
  /** Nitidez de las líneas. */
  lineSharpness?: number
  /** Caída del resplandor. */
  glowFalloff?: number
  /** Intensidad del resplandor. */
  glowIntensity?: number
  /** Brillo global. */
  brightness?: number
  /** Realce del canal azul. */
  blueBoost?: number
  /** Intensidad del viñeteado. */
  vignette?: number
  /** Grano de película. */
  grain?: number
  /** Activa la variante sobre fondo claro. */
  lightMode?: boolean
  /** Densidad de píxeles del render. */
  dpr?: number
  /** Fotogramas por segundo objetivo. */
  fps?: number
  /** Detiene la animación manteniendo el último fotograma. */
  paused?: boolean
  /** Clases CSS adicionales del contenedor. */
  className?: string
}

/**
 * Fondo animado de fibras espectrales, renderizado con WebGL.
 *
 * Todos los parámetros conservan los valores por defecto de React Bits, salvo
 * `lineColor` y `glowColor`, que se han adaptado a los verdes de la marca.
 *
 * El componente se ocupa por sí solo de los aspectos que suelen olvidarse en
 * una animación de este tipo: limita la resolución de píxeles, frena el bucle
 * cuando la pestaña pierde el foco o el elemento sale de la pantalla, y respeta
 * la preferencia del sistema de reducir el movimiento.
 *
 * @param props Parámetros del efecto; véase {@link GhostFibersProps}.
 * @returns Contenedor con el lienzo de WebGL.
 */
const GhostFibers: FC<GhostFibersProps> = ({
  lineColor = '#082014',
  glowColor = '#2bbb71',
  speed = 0.2,
  scale = 2,
  rotation = 0,
  rotationSpeed = 0.25,
  layers = 4,
  waveAmplitude = 0.015,
  waveFrequency = 3,
  waveSpeed = 0.15,
  layerSpeed = 0.08,
  twist = 0.1,
  twistFrequency = 5,
  twistSpeed = 1.2,
  lineFrequency = 5,
  lineSpacing = 2,
  lineSharpness = 16,
  glowFalloff = 10,
  glowIntensity = 1.6,
  brightness = 2,
  blueBoost = 1.25,
  vignette = 0.8,
  grain = 0.05,
  lightMode = false,
  dpr = 1,
  fps = 60,
  paused = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer: InstanceType<typeof Renderer>
    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: false,
        antialias: false,
        dpr: Math.min(Math.max(dpr, 0.5), 2),
      })
    } catch {
      // Sin WebGL no hay nada que dibujar: se deja el contenedor vacío para que
      // la capa de fondo CSS de quien lo utiliza siga siendo visible.
      return
    }

    const gl = renderer.gl
    const canvas = gl.canvas
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    canvas.setAttribute('aria-hidden', 'true')
    container.appendChild(canvas)

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uResolution: { value: new Float32Array([1, 1]) },
        uTime: { value: 0 },
        uSpeed: { value: 0.2 },
        uScale: { value: 2 },
        uRotation: { value: 0 },
        uRotationSpeed: { value: 0.25 },
        uLayers: { value: 4 },
        uWaveAmplitude: { value: 0.015 },
        uWaveFrequency: { value: 3 },
        uWaveSpeed: { value: 0.15 },
        uLayerSpeed: { value: 0.08 },
        uTwist: { value: 0.1 },
        uTwistFrequency: { value: 5 },
        uTwistSpeed: { value: 1.2 },
        uLineFrequency: { value: 5 },
        uLineSpacing: { value: 2 },
        uLineSharpness: { value: 16 },
        uGlowFalloff: { value: 10 },
        uGlowIntensity: { value: 1.6 },
        uBrightness: { value: 2 },
        uBlueBoost: { value: 1.25 },
        uVignette: { value: 0.8 },
        uGrain: { value: 0.05 },
        uLightMode: { value: 0 },
        uLineColor: { value: new Float32Array(hexToRgb('#082014')) },
        uGlowColor: { value: new Float32Array(hexToRgb('#2bbb71')) },
      },
    })
    const mesh = new Mesh(gl, { geometry, program })

    let frameId = 0
    let elapsed = 0
    let previousTime = performance.now()
    let lastRenderTime = 0
    let frameRate = 60
    let isPaused = false
    let isVisible = true
    let isPageVisible = !document.hidden
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    /**
     * Dibuja un fotograma de la escena.
     */
    const render = (): void => renderer.render({ scene: mesh })

    const uniforms = typedUniforms(program)

    /**
     * Detiene el bucle de animación, dejando el último fotograma en pantalla.
     */
    const stop = (): void => {
      if (frameId !== 0) cancelAnimationFrame(frameId)
      frameId = 0
    }

    /**
     * Indica si la animación debe avanzar en este momento.
     *
     * Se frena cuando el elemento no está a la vista, la pestaña pierde el
     * foco, se pide explícitamente o el usuario prefiere menos movimiento.
     *
     * @returns `true` si el bucle puede continuar.
     */
    const canAnimate = (): boolean =>
      isVisible && isPageVisible && !isPaused && !reducedMotion.matches

    /**
     * Avanza la animación un fotograma.
     *
     * @param now Marca de tiempo entregada por `requestAnimationFrame`.
     */
    const loop = (now: number): void => {
      frameId = 0
      if (!canAnimate()) return

      // El delta se acota para que una pausa larga no produzca un salto brusco.
      const delta = Math.min((now - previousTime) / 1000, 0.1)
      previousTime = now
      elapsed += delta

      if (now - lastRenderTime >= 1000 / frameRate - 0.5) {
        uniforms.uTime.value = elapsed
        render()
        lastRenderTime = now
      }

      frameId = requestAnimationFrame(loop)
    }

    /**
     * Arranca el bucle de animación si procede y no está ya en marcha.
     */
    const start = (): void => {
      if (!canAnimate() || frameId !== 0) return
      previousTime = performance.now()
      frameId = requestAnimationFrame(loop)
    }

    /**
     * Ajusta el tamaño del lienzo al de su contenedor.
     *
     * `drawingBufferWidth` y `drawingBufferHeight` son los que necesita el
     * sombreador: con `dpr` mayor que 1, el búfer real es mayor que el tamaño
     * CSS del lienzo.
     */
    const setSize = (): void => {
      const rect = container.getBoundingClientRect()
      renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)))
      uniforms.uResolution.value[0] = gl.drawingBufferWidth
      uniforms.uResolution.value[1] = gl.drawingBufferHeight
      render()
    }

    /**
     * Reacciona a que la pestaña gane o pierda el foco.
     */
    const handleVisibility = (): void => {
      isPageVisible = !document.hidden
      if (canAnimate()) start()
      else stop()
    }

    /**
     * Reacciona a un cambio en la preferencia de reducir el movimiento.
     *
     * Al activarse, se conserva un fotograma estático en lugar de detener el
     * efecto en blanco.
     */
    const handleReducedMotion = (): void => {
      if (canAnimate()) start()
      else {
        stop()
        render()
      }
    }

    const resizeObserver = new ResizeObserver(setSize)
    resizeObserver.observe(container)
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = Boolean(entry?.isIntersecting)
        if (canAnimate()) start()
        else stop()
      },
      { threshold: 0 },
    )
    intersectionObserver.observe(container)
    document.addEventListener('visibilitychange', handleVisibility)
    reducedMotion.addEventListener('change', handleReducedMotion)

    contexts.set(container, {
      renderer,
      program,
      mesh,
      render,
      /**
       * Detiene o reanuda la animación a petición de las propiedades.
       *
       * @param value `true` para detener la animación.
       */
      setPaused(value) {
        isPaused = value
        if (canAnimate()) start()
        else {
          stop()
          render()
        }
      },
      /**
       * Fija la tasa de fotogramas objetivo.
       *
       * @param value Fotogramas por segundo, acotados al intervalo 1–120.
       */
      setFps(value) {
        frameRate = Math.min(Math.max(value, 1), 120)
      },
    })

    setSize()
    start()

    return () => {
      stop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
      reducedMotion.removeEventListener('change', handleReducedMotion)
      contexts.delete(container)
      if (canvas.parentNode === container) container.removeChild(canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [dpr])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const context = contexts.get(container)
    if (!context) return

    const uniforms = typedUniforms(context.program)
    setColor(uniforms.uLineColor, lineColor)
    setColor(uniforms.uGlowColor, glowColor)
    uniforms.uSpeed.value = speed
    uniforms.uScale.value = scale
    uniforms.uRotation.value = rotation
    uniforms.uRotationSpeed.value = rotationSpeed
    uniforms.uLayers.value = Math.min(Math.max(Math.round(layers), 1), 10)
    uniforms.uWaveAmplitude.value = waveAmplitude
    uniforms.uWaveFrequency.value = waveFrequency
    uniforms.uWaveSpeed.value = waveSpeed
    uniforms.uLayerSpeed.value = layerSpeed
    uniforms.uTwist.value = twist
    uniforms.uTwistFrequency.value = twistFrequency
    uniforms.uTwistSpeed.value = twistSpeed
    uniforms.uLineFrequency.value = lineFrequency
    uniforms.uLineSpacing.value = lineSpacing
    uniforms.uLineSharpness.value = lineSharpness
    uniforms.uGlowFalloff.value = glowFalloff
    uniforms.uGlowIntensity.value = glowIntensity
    uniforms.uBrightness.value = brightness
    uniforms.uBlueBoost.value = blueBoost
    uniforms.uVignette.value = vignette
    uniforms.uGrain.value = grain
    uniforms.uLightMode.value = lightMode ? 1 : 0
    context.setFps(fps)
    context.setPaused(paused)
    context.render()
  }, [
    lineColor,
    glowColor,
    speed,
    scale,
    rotation,
    rotationSpeed,
    layers,
    waveAmplitude,
    waveFrequency,
    waveSpeed,
    layerSpeed,
    twist,
    twistFrequency,
    twistSpeed,
    lineFrequency,
    lineSpacing,
    lineSharpness,
    glowFalloff,
    glowIntensity,
    brightness,
    blueBoost,
    vignette,
    grain,
    lightMode,
    fps,
    paused,
    dpr,
  ])

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden ${className}`.trim()}
      aria-hidden="true"
    />
  )
}

export default GhostFibers
