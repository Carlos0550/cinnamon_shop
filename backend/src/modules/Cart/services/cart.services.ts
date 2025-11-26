import { prisma } from "@/config/prisma"

type MergeItem = { product_id: string; quantity: number; price?: number }

export default class CartServices {
  async getOrCreateUserCart(userId: number) {
    const cart = await prisma.cart.findUnique({ where: { userId }, include: { items: { include: { product: true } } } })
    if (cart) return cart
    return prisma.cart.create({ data: { user: { connect: { id: userId } } }, include: { items: { include: { product: true } } } })
  }

  async getCart(userId: number) {
    const cart = await this.getOrCreateUserCart(userId)
    const total = cart.items.reduce((acc, it) => acc + Number(it.product.price) * Number(it.quantity), 0)
    if (Number(cart.total) !== total) {
      await prisma.cart.update({ where: { id: cart.id }, data: { total } })
      return { ...cart, total }
    }
    return cart
  }

  async addItem(userId: number, productId: string, quantity: number = 1) {
    const cart = await this.getOrCreateUserCart(userId)
    const product = await prisma.products.findUnique({ where: { id: productId } })
    if (!product || !product.is_active || product.state !== "active") return { ok: false, status: 400, error: "product_not_available" }

    const existing = await prisma.orderItems.findFirst({ where: { cartId: cart.id, productId } })
    if (existing) {
      const updated = await prisma.orderItems.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } })
      const total = await this.recomputeTotal(cart.id)
      return { ok: true, item: updated, total }
    }
    const item = await prisma.orderItems.create({ data: { cart: { connect: { id: cart.id } }, product: { connect: { id: productId } }, quantity, price_has_changed: false } })
    const total = await this.recomputeTotal(cart.id)
    return { ok: true, item, total }
  }

  async updateQuantity(userId: number, productId: string, quantity: number) {
    const cart = await this.getOrCreateUserCart(userId)
    const existing = await prisma.orderItems.findFirst({ where: { cartId: cart.id, productId } })
    if (!existing) return { ok: false, status: 404, error: "item_not_found" }
    const updated = await prisma.orderItems.update({ where: { id: existing.id }, data: { quantity: Math.max(1, quantity) } })
    const total = await this.recomputeTotal(cart.id)
    return { ok: true, item: updated, total }
  }

  async removeItem(userId: number, productId: string) {
    const cart = await this.getOrCreateUserCart(userId)
    const existing = await prisma.orderItems.findFirst({ where: { cartId: cart.id, productId } })
    if (!existing) return { ok: false, status: 404, error: "item_not_found" }
    await prisma.orderItems.delete({ where: { id: existing.id } })
    const total = await this.recomputeTotal(cart.id)
    return { ok: true, total }
  }

  async clearCart(userId: number) {
    const cart = await this.getOrCreateUserCart(userId)
    await prisma.orderItems.deleteMany({ where: { cartId: cart.id } })
    await prisma.cart.update({ where: { id: cart.id }, data: { total: 0 } })
    return { ok: true }
  }

  async merge(userId: number, items: MergeItem[]) {
    const cart = await this.getOrCreateUserCart(userId)
    for (const incoming of items) {
      const product = await prisma.products.findUnique({ where: { id: incoming.product_id } })
      if (!product) continue
      const existing = await prisma.orderItems.findFirst({ where: { cartId: cart.id, productId: incoming.product_id } })
      const priceChanged = typeof incoming.price === "number" && Number(incoming.price) !== Number(product.price)
      if (existing) {
        await prisma.orderItems.update({ where: { id: existing.id }, data: { quantity: existing.quantity + Math.max(1, Number(incoming.quantity) || 1), price_has_changed: priceChanged || existing.price_has_changed } })
      } else {
        await prisma.orderItems.create({ data: { cart: { connect: { id: cart.id } }, product: { connect: { id: incoming.product_id } }, quantity: Math.max(1, Number(incoming.quantity) || 1), price_has_changed: priceChanged } })
      }
    }
    const total = await this.recomputeTotal(cart.id)
    return { ok: true, total }
  }

  private async recomputeTotal(cartId: number) {
    const items = await prisma.orderItems.findMany({ where: { cartId }, include: { product: true } })
    const total = items.reduce((acc, it) => acc + Number(it.product.price) * Number(it.quantity), 0)
    await prisma.cart.update({ where: { id: cartId }, data: { total } })
    return total
  }
}

