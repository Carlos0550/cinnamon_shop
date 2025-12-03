import { Router } from 'express';
import { getSales, saveSale, getSalesAnalytics, processSale, declineSale, getSaleReceipt } from './router.controller';
import { requireAuth } from '@/middlewares/auth.middleware';

const router = Router();

router.post("/save", requireAuth,saveSale);
router.get("/", requireAuth, getSales);
router.get("/analytics", requireAuth, getSalesAnalytics);
router.patch("/:id/process", ...processSale);
router.patch("/:id/decline", ...declineSale);
router.get("/:id/receipt", ...getSaleReceipt);

export default router;
