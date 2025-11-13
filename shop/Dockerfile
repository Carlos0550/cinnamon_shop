

FROM node:20-alpine AS build
WORKDIR /app

# Cargar variables de entorno desde archivos .env para el build de Next
COPY .env* ./

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

# Copiar archivos de entorno para que Next los cargue en runtime
COPY --from=build /app/.env* ./

# Copiar artefactos de build de Next.js y dependencias
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts

# Configurar puerto de ejecución
ENV PORT=8080
EXPOSE 8080

# Iniciar Next.js en modo producción
CMD ["sh", "-c", "npm run start -- -p ${PORT:-8080}"]