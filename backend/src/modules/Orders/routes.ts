import { Router } from "express"
import { requireAuth } from "@/middlewares/auth.middleware"
import OrdersServices from "./services/orders.services"
import { ensureCreatePayload } from "./router.controller"

const router = Router()
const service = new OrdersServices()

router.post("/create", ensureCreatePayload, async (req, res) => {
  const user = (req as any).user
  const userId = user ? Number(user.sub || user.id) : undefined
  const rs = await service.createOrder(userId, (req as any).items, (req as any).payment_method, (req as any).customer)
  res.json(rs)
})

export default router

