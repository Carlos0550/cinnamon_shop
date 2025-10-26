import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { PromoCreateRequestSchema } from '@/modules/Promos/services/promo.zod';
extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

registry.register('PromoCreateRequest', PromoCreateRequestSchema);

registry.registerPath({
  method: 'get',
  path: '/health',
  summary: 'Health check',
  responses: {
    200: {
      description: 'Estado OK',
      content: {
        'application/json': {
          schema: z.object({
            ok: z.boolean(),
            db: z.string(),
            redis: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/promos',
  summary: 'Crear una promo',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: PromoCreateRequestSchema },
      },
    },
  },
  responses: {
    201: { description: 'Promo creada' },
    400: { description: 'Validación inválida' },
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);
const spec = generator.generateDocument({
  openapi: '3.0.3',
  info: {
    title: 'Cinnamon API',
    version: '1.0.0',
    description: 'Documentación generada automáticamente desde esquemas Zod',
  },
  servers: [{ url: 'http://localhost:3000/api', description: 'API local' }],
});

export default spec;