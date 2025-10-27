

FROM node:20-alpine AS build
WORKDIR /app

# Capturar variables VITE_* desde Railway
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=build /app/dist /app/dist

RUN npm i -g serve

ENV PORT=4173
EXPOSE 4173

CMD ["sh", "-c", "serve -s dist -l ${PORT:-4173}"]