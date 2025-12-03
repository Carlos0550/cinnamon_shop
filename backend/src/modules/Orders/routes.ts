import { Router } from "express"
import { requireAuth, attachAuthIfPresent } from "@/middlewares/auth.middleware"
import OrdersServices from "./services/orders.services"
import { ensureCreatePayload } from "./router.controller"

const router = Router()
const service = new OrdersServices()

router.post("/create", attachAuthIfPresent, ensureCreatePayload, async (req, res) => {
  const user = (req as any).user
  const userId = user ? Number(user.sub || user.id) : undefined
  const rs = await service.createOrder(userId, (req as any).items, (req as any).payment_method, (req as any).customer)
  res.json(rs)
})

router.get('/me', requireAuth, async (req, res) => {
  const user = (req as any).user
  const userId = Number(user.sub || user.id)
  const page = Number((req.query.page as string) || '1')
  const limit = Number((req.query.limit as string) || '10')
  const rs = await service.listUserOrders(userId, page, limit)
  res.json(rs)
})

export default router
