# Tenants Console (Vite + React)

Consola básica para gestionar Tenants, Domains e Integrations.

## Variables
- `VITE_API_URL`: base de la API (`http://localhost:3000/api`)
- `VITE_ADMIN_TOKEN`: token de admin para endpoints `/api/sys/*`

## Scripts
- `npm install`
- `npm run dev` (http://localhost:5174)
- `npm run build` + `npm run preview`

## Endpoints esperados
- `GET/POST /api/sys/tenants`
- `GET/PATCH/DELETE /api/sys/tenants/:id`
- `GET/POST /api/sys/tenants/:id/domains`
- `DELETE /api/sys/domains/:id`
- `GET/PATCH /api/sys/tenants/:id/integrations`

Todas las requests envían `Authorization: Bearer ${VITE_ADMIN_TOKEN}`.
