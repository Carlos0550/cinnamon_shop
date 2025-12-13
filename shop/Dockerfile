FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Variables de entorno de runtime (pueden sobreescribirse en docker run)
ENV NEXT_PUBLIC_SITE_URL=""
ENV NEXT_PUBLIC_API_URL=""
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
ENV CLERK_SECRET_KEY=""

# Copiar artefactos standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]

