# Backend - Envío de Email (Resend y Mailgun)

El backend puede enviar correos transaccionales usando Resend (preferido) o Mailgun.

## Resend (recomendado)

Variables de entorno en `backend/.env`:

```
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXX
RESEND_BASE_URL=https://api.resend.com
RESEND_FROM=no-reply@tu-dominio-verificado.com
```

Notas:
- `RESEND_FROM` debe ser un remitente del dominio verificado en Resend (puedes usar formato `Nombre <no-reply@tu-dominio.com>` si deseas).
- Asegúrate que tu dominio esté verificado en Resend para evitar rebotes.

Uso en código:

- Servicio: `src/config/resend.ts`
- Ejemplo de envío:

```ts
import { sendEmail } from '@/config/resend';

await sendEmail({
  to: 'usuario@correo.com',
  subject: 'Asunto',
  text: 'Contenido en texto',
  html: '<p>Contenido en HTML</p>',
});
```

## Mailgun (alternativa)

Variables de entorno:

```
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=mg.tu-dominio.com
MAILGUN_BASE_URL=https://api.mailgun.net
```

Si tu dominio está en región EU, usa `MAILGUN_BASE_URL=https://api.eu.mailgun.net`.

Servicio: `src/config/mailgun.ts`

## Flujo de registro

El registro de usuario (`src/modules/User/services/auth_services.ts`) envía un email de bienvenida automáticamente tras crear la cuenta usando Resend.

## Pruebas locales

1. Configura `.env` con Resend o Mailgun.
2. Inicia el servidor: `npm run dev` o `npm start`.
3. Haz un `POST /api/register` con `{ email, password, name }`.
4. Revisa logs y la bandeja del correo destino.
