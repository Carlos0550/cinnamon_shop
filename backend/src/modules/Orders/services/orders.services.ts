import { prisma } from "@/config/prisma"
import { sendEmail } from "@/config/resend"
import { sale_email_html } from "@/templates/sale_email"
import { purchase_email_html } from "@/templates/purchase_email"
import salesServices from "@/modules/Sales/services/sales.services"
type OrderItemInput = { product_id: string; quantity: number }
type CustomerInput = { name: string; email: string; phone?: string; street?: string; postal_code?: string; city?: string; province?: string; pickup?: boolean }

export default class OrdersServices {
  async createOrder(userId: number | undefined, items: OrderItemInput[], paymentMethod: string, customer: CustomerInput) {
    const productIds = items.map(i => String(i.product_id))
    const products = await prisma.products.findMany({ where: { id: { in: productIds } } })
    const itemsMap = new Map(items.map(i => [i.product_id, Math.max(1, Number(i.quantity) || 1)]))
    const snapshot = products.map(p => ({ id: p.id, title: p.title, price: Number(p.price), quantity: itemsMap.get(p.id) || 1 }))
    const total = snapshot.reduce((acc, it) => acc + Number(it.price) * Number(it.quantity), 0)

    const order = await prisma.orders.create({
      data: {
        total,
        payment_method: paymentMethod,
        items: snapshot as any,
        buyer_email: customer.email || undefined,
        buyer_name: customer.name || undefined,
        ...(userId && Number.isInteger(userId) ? { user: { connect: { id: userId } } } : {}),
      }
    })

    if (userId && Number.isInteger(userId)) {
      await prisma.user.update({ where: { id: userId }, data: {
        phone: customer.phone || undefined,
        shipping_street: customer.street || undefined,
        shipping_postal_code: customer.postal_code || undefined,
        shipping_city: customer.city || undefined,
        shipping_province: customer.province || undefined,
      } })
      const cart = await prisma.cart.findUnique({ where: { userId }, select: { id: true } })
      if (cart?.id) {
        await prisma.orderItems.deleteMany({ where: { cartId: cart.id } })
        await prisma.cart.update({ where: { id: cart.id }, data: { total: 0 } })
      }
    }
    setImmediate(async () => {
      await this.notify(order.id, snapshot, total, paymentMethod, customer)
      await salesServices.saveSale({
          payment_method: paymentMethod as any,
          source: "WEB",
          product_ids: productIds,
          user_sale:{
            user_id: userId?.toString() || undefined,
          }
        })
    })
    return { ok: true, order_id: order.id, total }
  }

  private async notify(orderId: string, items: { title: string; price: number; quantity: number }[], total: number, paymentMethod: string, customer: CustomerInput) {
    const productRows = items.map(it => ({ title: `${it.title} x${it.quantity}`, price: Number(it.price) * Number(it.quantity) }))
    if (customer.email && customer.email.trim()) {
      const buyerHtml = purchase_email_html({
        payment_method: paymentMethod,
        products: productRows,
        subtotal: total,
        finalTotal: total,
        saleId: orderId,
        saleDate: new Date(),
        buyerName: customer.name,
        buyerEmail: customer.email,
      })
      await sendEmail({ to: customer.email, subject: `Confirmación de compra #${orderId}`, html: buyerHtml })
    }
  }
}
