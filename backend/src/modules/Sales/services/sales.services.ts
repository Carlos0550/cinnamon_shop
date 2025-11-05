import { prisma } from "@/config/prisma";
import { SaleRequest } from "./schemas/sales.schemas";


class SalesServices {
    async saveSale(request: SaleRequest){
        const { payment_method, source, product_ids, user_sale } = request;
        const { user_id } = user_sale || {};

        try {
            const int_product_ids = Array.from(product_ids).map(String);
            const product_data = await prisma.products.findMany({
                where: {
                    id: {
                        in: int_product_ids
                    }
                }
            })

            if (product_data.length !== int_product_ids.length) {
                throw new Error("Some products not found");
            }

            const total_products = product_data.reduce((acc, product) => acc + Number(product.price), 0);

            const parsedUserId = user_id !== undefined ? Number(user_id) : undefined;

            await prisma.sales.create({
                data: {
                    payment_method,
                    source,
                    total: Number(total_products),
                    ...(parsedUserId && Number.isInteger(parsedUserId)
                        ? { user: { connect: { id: parsedUserId } } }
                        : {}),
                    products: {
                        connect: product_data.map(product => ({ id: product.id }))
                    }
                }
            })
            return true
        } catch (error) {
            const error_msg = error instanceof Error ? error.message : String(error);
            console.log(error);
            return {
                success: false,
                message: error_msg
            }
        }
    }
}

export default new SalesServices();