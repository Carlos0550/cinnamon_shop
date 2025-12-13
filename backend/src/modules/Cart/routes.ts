import { Router } from "express"
import { requireAuth } from "@/middlewares/auth.middleware"
import CartServices from "./services/cart.services"
import { ensureMergeItems, ensureProductId, ensureQuantity } from "./router.controller"
import { getTenantId } from "@/config/tenantScope"

const router = Router()
const service = new CartServices()

router.get("/", requireAuth, async (req, res) => {
  const user = (req as any).user
  const cart = await service.getCart(getTenantId(req), Number(user.sub || user.id))
  res.json({ ok: true, cart })
})

router.post("/items", requireAuth, ensureProductId, ensureQuantity, async (req, res) => {
  const user = (req as any).user
  const rs = await service.addItem(getTenantId(req), Number(user.sub || user.id), (req as any).product_id, (req as any).quantity)
  if (!rs.ok) return res.status(rs.status || 400).json(rs)
  res.json({ ok: true, item: rs.item, total: rs.total })
})

router.patch("/items/:product_id", requireAuth, ensureProductId, ensureQuantity, async (req, res) => {
  const user = (req as any).user
  const rs = await service.updateQuantity(getTenantId(req), Number(user.sub || user.id), (req as any).product_id, (req as any).quantity)
  if (!rs.ok) return res.status(rs.status || 400).json(rs)
  res.json({ ok: true, total: rs.total })
})

router.delete("/items/:product_id", requireAuth, ensureProductId, async (req, res) => {
  const user = (req as any).user
  const rs = await service.removeItem(getTenantId(req), Number(user.sub || user.id), (req as any).product_id)
  if (!rs.ok) return res.status(rs.status || 400).json(rs)
  res.json({ ok: true, total: rs.total })
})

router.delete("/", requireAuth, async (req, res) => {
  const user = (req as any).user
  const rs = await service.clearCart(getTenantId(req), Number(user.sub || user.id))
  res.json(rs)
})

router.post("/merge", requireAuth, ensureMergeItems, async (req, res) => {
  const user = (req as any).user
  const rs = await service.merge(getTenantId(req), Number(user.sub || user.id), (req as any).items)
  res.json(rs)
})

export default router
