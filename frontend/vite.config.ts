import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
// `vitest/config` extiende la configuración de Vite con la sección `test`.
import { defineConfig } from 'vitest/config'

/**
 * Configuración de Vite para el frontend de «Base de Batos».
 *
 * Responsabilidades:
 * - Compilación de React con refresco rápido (HMR).
 * - Inyección de Tailwind CSS v4 (configuración basada en CSS, sin `tailwind.config.js`).
 * - Resolución de los alias de capa definidos en `tsconfig.json` (`@app`, `@core`, ...),
 *   de modo que las reglas de dependencia de la arquitectura sean explícitas en el código.
 * - Proxy hacia la API en desarrollo, evitando problemas de CORS y dejando las URLs
 *   relativas en el navegador.
 * - Ejecución de las pruebas unitarias con Vitest en modo `jsdom`.
 */
export default defineConfig(({ mode }) => {
  // Sólo se exponen al bundle las variables con prefijo `VITE_`.
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080'
  const apiPrefix = env.VITE_API_PREFIX || '/api'

  return {
    plugins: [react(), tailwindcss()].flat(),

    resolve: {
      alias: {
        '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
        '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
        '@domain': fileURLToPath(new URL('./src/domain', import.meta.url)),
        '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
        '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
        '@infrastructure': fileURLToPath(new URL('./src/infrastructure', import.meta.url)),
        '@mocks': fileURLToPath(new URL('./src/mocks', import.meta.url)),
        '@tests': fileURLToPath(new URL('./src/tests', import.meta.url)),
      },
    },

    server: {
      port: 5173,
      strictPort: false,
      proxy: {
        // El frontend siempre consume rutas relativas; el destino se resuelve aquí.
        [apiPrefix]: {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
      port: 4173,
    },

    build: {
      target: 'es2022',
      outDir: 'dist',
      sourcemap: mode !== 'production',
      /*
       * No se declara `manualChunks` de forma deliberada.
       *
       * Una función que capture todo `node_modules` en un chunk «vendor»
       * anula el particionado automático del bundler: los módulos alcanzados
       * sólo por un `import()` dinámico acaban fusionados en el chunk eager y
       * se descargan siempre. Fue exactamente lo que ocurrió con MSW, una
       * dependencia exclusiva de desarrollo que arrastra interceptores de red,
       * analizador de URL y almacén de cookies.
       *
       * El particionado por rutas de entrada y por módulos compartidos lo
       * resuelve el bundler de forma más correcta que una heurística propia.
       */
      chunkSizeWarningLimit: 700,
    },

    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/tests/setup.ts'],
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/main.tsx',
          'src/**/index.ts',
          'src/tests/**',
          'src/mocks/**',
          'src/**/*.d.ts',
        ],
        // Umbrales mínimos exigidos por la asignatura (pruebas unitarias en el front-end).
        thresholds: {
          statements: 60,
          branches: 50,
          functions: 60,
          lines: 60,
        },
      },
    },
  }
})
