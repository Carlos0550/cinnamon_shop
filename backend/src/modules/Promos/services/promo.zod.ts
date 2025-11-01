import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);

export const PromoTypeSchema = z.enum(['FIXED', 'PERCENTAJE']).openapi({ description: 'Tipo de promoción' });

export const PromoCreateRequestSchema = z.object({
  code: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  type: PromoTypeSchema,
  value: z.number(),
  max_discount: z.number().optional(),
  min_order_amount: z.number().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_active: z.boolean().optional(),
  usage_limit: z.number().optional(),
  usage_count: z.number().optional(),
  show_in_home: z.boolean().optional(),
  per_user_limit: z.number().optional(),
  categories: z.array(z.string()).optional(),
  products: z.array(z.string()).optional(),
}).openapi({ description: 'Body para crear una promoción' });

export const DeletePromoRequestSchema = z.object({
  id: z.string(),
}).openapi({ description: 'Body para eliminar una promoción' });

export type PromoCreateRequest = z.infer<typeof PromoCreateRequestSchema>;
export type DeletePromoRequest = z.infer<typeof DeletePromoRequestSchema>;
