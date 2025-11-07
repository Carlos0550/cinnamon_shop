import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);
import { PaymentMethods, SaleSource } from './sales.schemas';

export const SalesSchema = z.object({
    payment_method: z.enum(PaymentMethods),
    source: z.enum(SaleSource),
    product_ids: z.array(z.string()),
    user_sale: z.object({
        user_id: z.string().optional(),
    }).optional(),
    tax: z.number().optional(),
})  
