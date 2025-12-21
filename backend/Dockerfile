FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --legacy-peer-deps

RUN npx prisma generate

FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/prisma ./prisma

COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY src ./src
COPY scripts ./scripts

RUN npm run build

RUN if [ -d "scripts" ]; then npm run postbuild || true; fi

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=development
ENV PORT=3000

RUN apk add --no-cache postgresql-client

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/scripts ./scripts

COPY scripts/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

RUN mkdir -p /app/uploads /app/uploads/storage

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]

