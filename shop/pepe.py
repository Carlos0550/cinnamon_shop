

# FROM node:20-alpine AS build
# WORKDIR /app

# COPY .env* ./

# COPY package*.json ./
# RUN npm ci

# COPY . .

# RUN npm run build

# FROM node:20-alpine AS runner
# WORKDIR /app

# COPY --from=build /app/.env* ./

# COPY --from=build /app/package.json ./package.json
# COPY --from=build /app/node_modules ./node_modules
# COPY --from=build /app/.next ./.next
# COPY --from=build /app/public ./public
# COPY --from=build /app/next.config.ts ./next.config.ts

# ENV PORT=8080
# EXPOSE 8080

# CMD ["sh", "-c", "npm run start -- -p ${PORT:-8080}"]