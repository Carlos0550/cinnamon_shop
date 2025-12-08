# Prisma: Guía rápida de migraciones (Supabase y local)

## Configuración

- Este proyecto usa `prisma.config.ts` y toma la URL de la BD desde `DIRECT_URL`.
- Asegúrate de tener las variables de entorno correctas antes de ejecutar comandos.

## Flujo recomendado (Supabase remoto)

1) Generar migración sin aplicar (local)

```
npx prisma migrate dev --name <nombre_migracion> --create-only
```

2) Aplicar migraciones en Supabase

```
npx prisma migrate deploy
```

3) Verificar que el esquema remoto coincide con `schema.prisma`

```
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
```

## Resolver “drift” sin resetear datos

Cuando Prisma detecte drift entre la base remota y tu historial de migraciones:

1) Generar el SQL exacto necesario para alinear la base con tu `schema.prisma`

```
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script > prisma/migrations/<timestamp>_fix_drift/migration.sql
```

2) Aplicar en Supabase

```
npx prisma migrate deploy
```

3) Confirmar que no hay diferencias

```
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
```

## Notas sobre `--from-migrations`

- Si prefieres comparar desde el directorio de migraciones, Prisma requiere una shadow DB:

```
npx prisma migrate diff --from-migrations prisma/migrations --to-config-datasource --script --shadow-database-url "<SHADOW_DATABASE_URL>"
```

- Alternativamente, define `datasource.shadowDatabaseUrl` en `prisma.config.ts`.

## Desarrollo local

- Generar y aplicar automáticamente (solo local):

```
npx prisma migrate dev --name <nombre_migracion>
```

- Resetear la base de desarrollo (borra datos):

```
npx prisma migrate reset
```

## Ejemplos útiles

- Crear columna en `Orders` y desplegar (Supabase):

```
npx prisma migrate dev --name add-buyerphone-orders --create-only
npx prisma migrate deploy
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
```

