# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Etapa 1: construcción
# ---------------------------------------------------------------------------
FROM node:24-alpine AS build

WORKDIR /app

# Se copian primero los manifiestos para aprovechar la caché de Docker: mientras
# las dependencias no cambien, la capa de `npm ci` se reutiliza.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Variables de entorno de la fase de construcción. Vite las incrusta en el
# bundle, por lo que deben fijarse antes de `npm run build`.
ARG VITE_APP_ENV=production
ARG VITE_API_BASE_URL=/api
ARG VITE_ENABLE_MOCKS=false

ENV VITE_APP_ENV=$VITE_APP_ENV \
    VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_ENABLE_MOCKS=$VITE_ENABLE_MOCKS

RUN npm run build

# ---------------------------------------------------------------------------
# Etapa 2: publicación
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Se copia la configuración del servidor y el service worker de MSW.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/public/mockServiceWorker.js /usr/share/nginx/html/mockServiceWorker.js

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
