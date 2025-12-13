import { prisma } from "@/config/prisma"

type MergeItem = { product_id: string; quantity: number; price?: number }

export default class CartServices {
  async getOrCreateUserCart(tenantId: string, userId: number) {
    const cart = await prisma.cart.findFirst({ where: { userId, tenantId }, include: { items: { include: { product: true } } } })
    if (cart) return cart
    return prisma.cart.create({ data: { user: { connect: { id: userId } }, tenant: { connect: { id: tenantId } } }, include: { items: { include: { product: true } } } })
  }

  async getCart(tenantId: string, userId: number) {
    const cart = await this.getOrCreateUserCart(tenantId, userId)
    const total = cart.items.reduce((acc, it) => acc + Number(it.product.price) * Number(it.quantity), 0)
    if (Number(cart.total) !== total) {
      await prisma.cart.update({ where: { id: cart.id, tenantId }, data: { total } })
      return { ...cart, total }
    }
    return cart
  }

  async addItem(tenantId: string, userId: number, productId: string, quantity: number = 1) {
    const cart = await this.getOrCreateUserCart(tenantId, userId)
    const product = await prisma.products.findFirst({ where: { id: productId, tenantId } })
    if (!product || !product.is_active || product.state !== "active") return { ok: false, status: 400, error: "product_not_available" }

    const existing = await prisma.orderItems.findFirst({ where: { cartId: cart.id, productId, tenantId } })
    if (existing) {
      const updated = await prisma.orderItems.update({ where: { id: existing.id, tenantId }, data: { quantity: existing.quantity + quantity } })
      const total = await this.recomputeTotal(tenantId, cart.id)
      return { ok: true, item: updated, total }
    }
    const item = await prisma.orderItems.create({ data: { cart: { connect: { id: cart.id } }, product: { connect: { id: productId } }, tenant: { connect: { id: tenantId } }, quantity, price_has_changed: false } })
    const total = await this.recomputeTotal(tenantId, cart.id)
    return { ok: true, item, total }
  }

  async updateQuantity(tenantId: string, userId: number, productId: string, quantity: number) {
    const cart = await this.getOrCreateUserCart(tenantId, userId)
    const existing = await prisma.orderItems.findFirst({ where: { cartId: cart.id, productId, tenantId } })
    if (!existing) return { ok: false, status: 404, error: "item_not_found" }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await prisma.orderItems.delete({ where: { id: existing.id, tenantId } })
    } else {
      // Update quantity if greater than 0
      await prisma.orderItems.update({ where: { id: existing.id, tenantId }, data: { quantity } })
    }
    
    const total = await this.recomputeTotal(tenantId, cart.id)
    return { ok: true, total }
  }

  async removeItem(tenantId: string, userId: number, productId: string) {
    const cart = await this.getOrCreateUserCart(tenantId, userId)
    const existing = await prisma.orderItems.findFirst({ where: { cartId: cart.id, productId, tenantId } })
    if (!existing) return { ok: false, status: 404, error: "item_not_found" }
    await prisma.orderItems.delete({ where: { id: existing.id, tenantId } })
    const total = await this.recomputeTotal(tenantId, cart.id)
    return { ok: true, total }
  }

  async clearCart(tenantId: string, userId: number) {
    const cart = await this.getOrCreateUserCart(tenantId, userId)
    await prisma.orderItems.deleteMany({ where: { cartId: cart.id, tenantId } })
    await prisma.cart.update({ where: { id: cart.id, tenantId }, data: { total: 0 } })
    return { ok: true }
  }

  async merge(tenantId: string, userId: number, items: MergeItem[]) {
    const cart = await this.getOrCreateUserCart(tenantId, userId)
    for (const incoming of items) {
      const product = await prisma.products.findFirst({ where: { id: incoming.product_id, tenantId } })
      if (!product) continue
      const existing = await prisma.orderItems.findFirst({ where: { cartId: cart.id, productId: incoming.product_id, tenantId } })
      const priceChanged = typeof incoming.price === "number" && Number(incoming.price) !== Number(product.price)
      if (existing) {
        if (Number(incoming.quantity) <= 0) {
          // Remove item if quantity is 0 or less
          await prisma.orderItems.delete({ where: { id: existing.id, tenantId } })
        } else {
          // Update quantity if greater than 0
          await prisma.orderItems.update({ where: { id: existing.id, tenantId }, data: { quantity: Number(incoming.quantity) || 1, price_has_changed: priceChanged || existing.price_has_changed } })
        }
      } else if (Number(incoming.quantity) > 0) {
        // Only create new item if quantity is greater than 0
        await prisma.orderItems.create({ data: { cart: { connect: { id: cart.id } }, product: { connect: { id: incoming.product_id } }, tenant: { connect: { id: tenantId } }, quantity: Number(incoming.quantity) || 1, price_has_changed: priceChanged } })
      }
    }
    const total = await this.recomputeTotal(tenantId, cart.id)
    return { ok: true, total }
  }

  private async recomputeTotal(tenantId: string, cartId: number) {
    const items = await prisma.orderItems.findMany({ where: { cartId, tenantId }, include: { product: true } })
    const total = items.reduce((acc, it) => acc + Number(it.product.price) * Number(it.quantity), 0)
    await prisma.cart.update({ where: { id: cartId, tenantId }, data: { total } })
    return total
  }
}
