import js from '@eslint/js'
import jsdoc from 'eslint-plugin-jsdoc'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/**
 * Configuración plana de ESLint (formato oficial desde ESLint v9).
 *
 * Se organizan tres bloques, de menos a más restrictivo:
 *
 * 1. Correcciones recomendadas de JavaScript y TypeScript, aplicables a todos
 *    los archivos (incluidos los de configuración, que se ejecutan en Node).
 * 2. Reglas propias del proyecto sobre el código de `src`, con información de
 *    tipos habilitada (`recommendedTypeChecked`), lo que permite detectar
 *    promesas sin awaits o `any` implícitos.
 * 3. Reglas de documentación JSDoc, exigidas por la asignatura de Ingeniería
 *    de Software, con exención para las pruebas.
 */
export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },

  /* --- 1. Base compartida ------------------------------------------------ */
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: { jsdoc },
    rules: {
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'object-shorthand': 'error',
    },
  },

  /* --- 2. Código de la aplicación ---------------------------------------- */
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      jsdoc,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // --- Buenas prácticas de la asignatura -------------------------------
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
    },
  },

  /* --- 3. Documentación obligatoria -------------------------------------- */
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.d.ts', 'src/tests/**', 'src/mocks/**'],
    rules: {
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: false,
          require: {
            FunctionDeclaration: true,
            FunctionExpression: true,
            ArrowFunctionExpression: true,
            ClassDeclaration: true,
            MethodDefinition: true,
          },
        },
      ],
      'jsdoc/require-description': 'error',
      // `checkDestructured: false` evita exigir una entrada `@param` por cada
      // propiedad desestructurada: en un componente, documentar el propósito
      // del componente y de las props con nombre propio es más útil que
      // repetir el tipo dos veces.
      'jsdoc/require-param': ['error', { checkDestructured: false, checkRestProperty: false }],
      'jsdoc/require-returns': ['error', { checkGetters: false }],
    },
  },

  /*
   * Los archivos del sistema de diseño exportan, junto al componente, la
   * definición de sus variantes (`buttonVariants`, `badgeVariants`), que es el
   * patrón de shadcn/ui. Los proveedores de contexto, por su parte, exportan
   * además su hook de consumo. En ambos casos la advertencia de refresco rápido
   * no aporta valor: la velocidad de recarga durante el desarrollo no compensa
   * fragmentar la cohesión de estos archivos.
   */
  {
    files: [
      'src/shared/components/ui/**/*.{ts,tsx}',
      'src/**/context/*.{ts,tsx}',
      'src/app/providers/**/*.{ts,tsx}',
      'src/app/router.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },

  /* --- Exenciones para los componentes de React -------------------------- */
  /*
   * Este bloque se declara al final, después del de documentación, para que la
   * configuración plana de ESLint le dé prioridad.
   *
   * En un componente de React el tipo de retorno es JSX, ya evidente por la
   * propia expresión, y las props se declaran mediante un tipo externo
   * (`ComponentProps<'div'>`) que reiterar en `@param` sólo duplicaría. Lo que
   * sí se exige —y es lo valioso— es que cada componente tenga un bloque de
   * documentación con descripción clara de su propósito.
   */
  {
    files: ['src/**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-param': 'off',
    },
  },

  /* --- Exenciones para las pruebas --------------------------------------- */
  {
    files: ['src/**/*.{test,spec}.{ts,tsx}', 'src/tests/**/*.{ts,tsx}'],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  /* --- Archivos de configuración ejecutados por Node ---------------------- */
  {
    files: ['**/*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
)
