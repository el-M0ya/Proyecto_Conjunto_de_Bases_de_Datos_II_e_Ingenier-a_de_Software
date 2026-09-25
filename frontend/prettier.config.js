/**
 * Configuración de Prettier.
 *
 * Se delega el orden de las clases de Tailwind al plugin oficial para que el
 * ordenamiento de utilidades sea estable y las fusiones entre clases
 * (`cn`) funcionen de forma predecible.
 *
 * @type {import('prettier').Config}
 */
export default {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  arrowParens: 'always',
  endOfLine: 'lf',
  plugins: ['prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: ['*.md'],
      options: { proseWrap: 'preserve' },
    },
  ],
}
