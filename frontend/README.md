# Frontend — Base de Batos

> Aplicación web para la gestión y generación automática de planes de entrenamiento.
> Parte del proyecto conjunto de **Bases de Datos II** e **Ingeniería de Software**.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 + TypeScript 6 (modo estricto) |
| Empaquetado | Vite 8 (rolldown) |
| Estilos | Tailwind CSS v4 (configuración en CSS, sin `tailwind.config.js`) |
| Componentes | shadcn/ui sobre primitivas de Radix UI + CVA |
| Enrutado | React Router 7 (enrutador declarativo) |
| Estado del servidor | TanStack Query 5 |
| Tablas | TanStack Table 9 (ordenamiento por columna) |
| Gráficos | Recharts 3 |
| Exportación a PDF | jsPDF + jsPDF-AutoTable |
| Validación | Zod 4 |
| Notificaciones | Sonner |
| Pruebas | Vitest 5 + Testing Library + MSW 2 |
| Calidad | ESLint 10 (configuración plana) + Prettier 3 |
| Despliegue | Docker multietapa + Nginx |

---

## Puesta en marcha

```bash
cd frontend
npm install
cp .env.example .env.local   # ajustar VITE_API_PROXY_TARGET si el backend no está en :8080
npm run dev                  # http://localhost:5173
```

Para trabajar sin backend, con respuestas simuladas de MSW:

```bash
npm run mock
```

### Usuarios de prueba (sólo con MSW activo)

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | `admin@basedebatos.cu` | `Admin2026!` |
| Entrenador | `entrenador@basedebatos.cu` | `Entrena2026!` |
| Jefe de sala | `jefe@basedebatos.cu` | `JefeSala2026!` |
| Cliente | `cliente@basedebatos.cu` | `Cliente2026!` |

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR y proxy hacia la API |
| `npm run build` | Comprobación de tipos y compilación de producción |
| `npm run preview` | Sirve localmente el resultado de `build` |
| `npm run typecheck` | Comprobación de tipos sin emitir |
| `npm run lint` / `lint:fix` | Análisis estático |
| `npm run format` / `format:check` | Formateo con Prettier |
| `npm test` | Suite de pruebas |
| `npm run test:watch` | Pruebas en modo interactivo |
| `npm run test:coverage` | Pruebas con informe de cobertura y umbrales |
| `npm run verify` | `typecheck` + `lint` + `test`, en un solo comando |

---

## Arquitectura

Estructura por capas (**arquitectura hexagonal** en el dominio), con alias de
importación que hacen explícita la dirección de las dependencias.

```text
src/
├── app/            # Composition root: providers, enrutador, guardas, layouts
├── core/           # Infraestructura transversal: config, HTTP, RBAC, DI, storage
├── domain/         # Dominio puro: entidades y contratos (puertos)
├── features/       # Vertical slices por capacidad de negocio
├── infrastructure/ # Adaptadores: implementaciones HTTP de los puertos
├── shared/         # Componentes de UI, hooks y utilidades reutilizables
├── mocks/          # Datos simulados con MSW
└── tests/          # Pruebas unitarias, de componentes e integración
```

### Regla de dependencia

Las dependencias apuntan **hacia dentro**:

```text
app → features → domain
app → infrastructure → domain
core → domain
shared → (nadie)          # `shared` no importa de otras capas
```

`domain` no conoce React, ni la capa HTTP, ni el almacenamiento. Gracias a eso
las funcionalidades se prueban con dobles de prueba, sin servidor.

### Alias de importación

| Alias | Ruta |
|-------|------|
| `@app/*` | `src/app/*` |
| `@core/*` | `src/core/*` |
| `@domain/*` | `src/domain/*` |
| `@features/*` | `src/features/*` |
| `@infrastructure/*` | `src/infrastructure/*` |
| `@shared/*` | `src/shared/*` |
| `@mocks/*` | `src/mocks/*` |
| `@tests/*` | `src/tests/*` |

---

## Patrones de diseño implementados

| Patrón | Dónde | Para qué |
|--------|-------|----------|
| **Repository** | `domain/repositories`, `infrastructure/repositories` | El dominio declara *qué* necesita; la infraestructura decide *cómo* se obtiene. Permite cambiar la API por un servicio en memoria sin tocar las funcionalidades. |
| **Adapter** | `infrastructure/http/HttpRepository` | Traduce las operaciones del puerto a rutas HTTP concretas. |
| **Strategy** | `core/storage`, `core/auth/tokenStorage` | Tres políticas de persistencia (`localStorage`, `sessionStorage`, memoria) tras una única interfaz. |
| **Factory** | `core/storage/storeFactory`, `core/di/container`, `app/lazyPage` | Creación de objetos en un único punto, con degradación segura si el navegador bloquea el almacenamiento. |
| **Chain of Responsibility** | `core/http` (cadena de interceptores) | Autenticación, trazabilidad, reintentos, tiempo de espera y normalización de errores como concerns independientes y componibles. |
| **Facade** | `features/auth/services/SessionFacade` | Un único objeto para restaurar, autenticar, renovar y cerrar sesión, además de consultar permisos. |
| **Provider** | `app/providers`, `features/auth/context` | Estado global de tema, consultas, sesión y notificaciones mediante contextos de React. |
| **Compound Components** | `shared/components/ui` | Componentes con estructura y comportamiento componibles (Radix + CVA). |
| **Guard** | `app/guards/RouteGuards` | `ProtectedRoute` y `PermissionRoute` resuelven la autorización antes de montar. |

---

## Configuración

Todas las variables se declaran en `.env.example`. Sólo las que llevan el
prefijo `VITE_` llegan al navegador, por lo que **nunca deben incluirse
secretos**.

| Variable | Por defecto | Descripción |
|----------|-------------|-------------|
| `VITE_APP_ENV` | `development` | `development` \| `production` \| `test` |
| `VITE_API_BASE_URL` | `/api` | Ruta base de la API. Relativa = misma origen. |
| `VITE_API_PROXY_TARGET` | `http://localhost:8080` | Destino real del proxy en desarrollo. |
| `VITE_API_TIMEOUT` | `15000` | Tiempo máximo de espera, en milisegundos. |
| `VITE_API_RETRY_COUNT` | `2` | Reintentos ante fallos transitorios. |
| `VITE_DEFAULT_LOCALE` | `es-CU` | Formato de números y fechas. |
| `VITE_DEFAULT_TIMEZONE` | `America/Havana` | Zona horaria de las fechas. |
| `VITE_ENABLE_MOCKS` | `false` | Activa los datos simulados de MSW. |

---

## Sistema de diseño

Tailwind v4 se configura desde `src/index.css`: el bloque `@theme` genera las
utilidades a partir de variables CSS, y los temas claro y oscuro se activan con
la clase `dark` en `<html>`. Un script en línea en `index.html` aplica la
preferencia antes de la hidratación para evitar el destello de estilo.

Las variantes de los componentes se declaran con `class-variance-authority`, lo
que produce un tipo cerrado: un error de estilo se detecta al compilar.

---

## Pruebas

```bash
npm test                  # Suite completa
npm run test:coverage     # Con informe y umbrales mínimos
```

- **Unitarias** (`tests/unit`): lógica de RBAC, errores, paginación, validación
  del entorno, formato, estrategia de tokens y almacenes, interceptores y la
  fachada de sesión con dobles de repositorio.
- **De componentes** (`tests/components`): primitivos del sistema de diseño,
  proveedor de tema, proveedor de sesión, guardas, panel por rol y estados.
- **De integración** (`tests/integration`): repositorios HTTP reales contra
  MSW, verificando rutas, parámetros, mapeo de DTO a entidad y errores.

Los umbrales de cobertura se configuran en `vite.config.ts` y hoy se sitúan en
60 % de sentencias, ramas, funciones y líneas.

---

## Despliegue

```bash
docker build -t basedebatos-frontend .
docker run -p 8081:80 basedebatos-frontend
```

Imagen multietapa: la primera compila con Node y la segunda publica sólo los
archivos estáticos en Nginx, que además configura el enrutamiento del lado del
cliente y las cabeceras de seguridad.

Las variables de entorno se fijan en tiempo de construcción, porque Vite las
incrusta en el bundle:

```bash
docker build --build-arg VITE_API_BASE_URL=/api -t basedebatos-frontend .
```
