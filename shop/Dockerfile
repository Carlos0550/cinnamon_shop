

FROM node:20-alpine AS build
WORKDIR /app

# Capturar variables NEXT_* desde Railway
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copiar artefactos de build de Next.js y dependencias
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts

# Configurar puerto de ejecución
ENV PORT=3001
EXPOSE 3001

# Iniciar Next.js en modo producción
CMD ["sh", "-c", "npm run start -- -p ${PORT:-3001}"]