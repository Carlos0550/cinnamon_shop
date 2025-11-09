import { prisma } from "@/config/prisma";
import { SaleRequest } from "./schemas/sales.schemas";
import { sendEmail } from "@/config/resend";
import { sale_email_html } from "@/templates/sale_email";


class SalesServices {
    async saveSale(request: SaleRequest) {
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

            const sale = await prisma.sales.create({
                data: {
                    payment_method,
                    source,
                    total: Number(total_products),
                    ...(parsedUserId && Number.isInteger(parsedUserId)
                        ? { user: { connect: { id: parsedUserId } } }
                        : {}),
                    tax: Number(request.tax) || 0,
                    products: {
                        connect: product_data.map(product => ({ id: product.id }))
                    }
                }
            })
            // Send email notification
            try {
                const user = parsedUserId ? await prisma.user.findUnique({ where: { id: parsedUserId } }) : null;
                const subtotal = Number(total_products);
                const taxPercent = Number(request.tax) || 0;
                const taxAmount = subtotal * (taxPercent / 100);
                const finalTotal = subtotal + taxAmount;
                const html = sale_email_html({
                    source,
                    payment_method,
                    products: product_data.map(p => ({ title: p.title, price: Number(p.price) })),
                    subtotal,
                    taxPercent,
                    finalTotal,
                    saleId: (sale as any)?.id ?? undefined,
                    saleDate: new Date(),
                    buyerName: user?.name ?? undefined,
                    buyerEmail: user?.email ?? undefined,
                });
                const admins = await prisma.user.findMany({ where: { role: 1 } });
                const adminEmails = admins.map(u => u.email).filter(Boolean) as string[];
                console.log(adminEmails)
                const configuredRecipient = process.env.SALES_EMAIL_TO;
                const toRecipients = adminEmails.length > 0
                    ? adminEmails
                    : (configuredRecipient ? configuredRecipient : (process.env.RESEND_FROM || ''));
                if (Array.isArray(toRecipients) ? toRecipients.length > 0 : !!toRecipients) {
                    await sendEmail({
                        to: toRecipients as any,
                        subject: 'Nueva venta realizada',
                        text: `Nueva venta realizada - ${product_data.length} productos - Total: ${finalTotal}`,
                        html,
                    });
                } else {
                    console.warn('No recipient configured for sale email');
                }
            } catch (err) {
                console.error('Error sending sale email', err);
            }
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

    async getSales({ page = 1, per_page = 5 }: { page?: number, per_page?: number }) {
        try {
            const take = Math.max(1, Number(per_page) || 5);
            const currentPage = Math.max(1, Number(page) || 1);
            const skip = (currentPage - 1) * take;

            const [total, sales] = await Promise.all([
                await prisma.sales.count(),
                await prisma.sales.findMany({
                    skip,
                    take,
                    include: {
                        products: true,
                        user: true
                    },
                    orderBy: [{ created_at: 'desc' } as any]
                })
            ])

            const totalPages = Math.ceil(total / take) || 1;
            const pagination = {
                total,
                page: currentPage,
                limit: take,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1,
            };

            return { sales, pagination };
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