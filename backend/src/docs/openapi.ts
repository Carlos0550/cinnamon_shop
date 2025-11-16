import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { PromoCreateRequestSchema, DeletePromoRequestSchema } from '@/modules/Promos/services/promo.zod';
import { SaveProductRequestSchema, SaveCategoryRequestSchema, GetProductsQuerySchema, UpdateProductRequestSchema } from '@/modules/Products/services/product.zod';
import { LoginRequestSchema, RegisterRequestSchema, NewUserRequestSchema, GetUsersQuerySchema } from '@/modules/User/services/user.zod';
import { SalesSchema } from '@/modules/Sales/services/schemas/sales.zod';
extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

registry.register('PromoCreateRequest', PromoCreateRequestSchema);
registry.register('DeletePromoRequest', DeletePromoRequestSchema);
registry.register('SaveProductRequest', SaveProductRequestSchema);
registry.register('SaveCategoryRequest', SaveCategoryRequestSchema);
registry.register('GetProductsQuery', GetProductsQuerySchema);
registry.register('UpdateProductRequest', UpdateProductRequestSchema);
registry.register('LoginRequest', LoginRequestSchema);
registry.register('RegisterRequest', RegisterRequestSchema);
registry.register('NewUserRequest', NewUserRequestSchema);
registry.register('GetUsersQuery', GetUsersQuerySchema);
registry.register('SalesSaveRequest', SalesSchema);


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

// User endpoints
registry.registerPath({
  method: 'post',
  path: '/login',
  summary: 'Login de usuario',
  request: {
    body: { content: { 'application/json': { schema: LoginRequestSchema } } },
  },
  responses: {
    200: { description: 'Login exitoso' },
    400: { description: 'Credenciales inválidas' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/register',
  summary: 'Registro de usuario',
  request: {
    body: { content: { 'application/json': { schema: RegisterRequestSchema } } },
  },
  responses: {
    201: { description: 'Usuario creado' },
    400: { description: 'Validación inválida' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/new',
  summary: 'Crear usuario con rol',
  request: {
    body: { content: { 'application/json': { schema: NewUserRequestSchema } } },
  },
  responses: {
    200: { description: 'Usuario creado' },
    400: { description: 'Validación inválida' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/',
  summary: 'Listar usuarios',
  security: [{ bearerAuth: [] }],
  request: { query: GetUsersQuerySchema },
  responses: {
    200: { description: 'Usuarios obtenidos' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/validate-token',
  summary: 'Validar token y devolver su contenido',
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'Token válido y contenido devuelto' },
    401: { description: 'Token inválido o sesión expirada' },
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

registry.registerPath({
  method: 'get',
  path: '/promos',
  summary: 'Obtener todas las promos',
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'Promos obtenidas' },
    404: { description: 'No se encontraron promos' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/promos/{id}',
  summary: 'Eliminar una promo',
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    200: { description: 'Promo eliminada' },
    404: { description: 'Promo no encontrada' },
  },
});

// Products
registry.registerPath({
  method: 'post',
  path: '/products/save-product',
  summary: 'Crear producto',
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { 'multipart/form-data': { schema: SaveProductRequestSchema } } },
  },
  responses: {
    201: { description: 'Producto creado' },
    400: { description: 'Validación inválida' },
  },
});

// Sales
registry.registerPath({
  method: 'post',
  path: '/sales/save',
  summary: 'Guardar una venta',
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { 'application/json': { schema: SalesSchema } } },
  },
  responses: {
    200: { description: 'Venta guardada exitosamente' },
    400: { description: 'Validación inválida o datos incompletos' },
    500: { description: 'Error interno del servidor' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/sales',
  summary: 'Listar ventas con paginación',
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      page: z.string().optional(),
      per_page: z.string().optional(),
      limit: z.string().optional(),
    }),
  },
  responses: {
    200: { description: 'Ventas obtenidas' },
    400: { description: 'Error en parámetros de consulta' },
    500: { description: 'Error interno del servidor' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/sales/analytics',
  summary: 'Analíticas de ventas para un rango de fechas',
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      start_date: z.string().optional().openapi({ description: 'YYYY-MM-DD' }),
      end_date: z.string().optional().openapi({ description: 'YYYY-MM-DD' }),
    }),
  },
  responses: {
    200: { description: 'Analíticas calculadas' },
    400: { description: 'Error en parámetros' },
    500: { description: 'Error interno del servidor' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/products/categories',
  summary: 'Crear categoría',
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { 'multipart/form-data': { schema: SaveCategoryRequestSchema } } },
  },
  responses: {
    201: { description: 'Categoría creada' },
    400: { description: 'Validación inválida' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/products/categories',
  summary: 'Listar categorías',
  responses: { 200: { description: 'Categorías obtenidas' } },
});

registry.registerPath({
  method: 'get',
  path: '/products',
  summary: 'Listar productos',
  request: { query: GetProductsQuerySchema },
  responses: {
    200: { description: 'Productos obtenidos' },
    400: { description: 'Parámetros inválidos' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/products/{product_id}',
  summary: 'Eliminar producto',
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'product_id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    200: { description: 'Producto eliminado' },
    404: { description: 'Producto no encontrado' },
  },
});

registry.registerPath({
  method: 'put',
  path: '/products/{product_id}',
  summary: 'Actualizar producto',
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'product_id', in: 'path', required: true, schema: { type: 'string' } }],
  request: {
    body: { content: { 'multipart/form-data': { schema: UpdateProductRequestSchema } } },
  },
  responses: {
    200: { description: 'Producto actualizado' },
    400: { description: 'Validación inválida' },
    404: { description: 'Producto no encontrado' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/products/status/{product_id}/{state}',
  summary: 'Actualizar estado del producto',
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'product_id', in: 'path', required: true, schema: { type: 'string' } },
    { name: 'state', in: 'path', required: true, schema: { type: 'string', enum: ['active','inactive','draft','out_stock','deleted'] } },
  ],
  responses: {
    200: { description: 'Estado actualizado' },
    400: { description: 'Estado inválido o parámetros faltantes' },
    404: { description: 'Producto no encontrado' },
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