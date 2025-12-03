import { Router } from 'express';
import { getSales, saveSale, getSalesAnalytics, processSale } from './router.controller';
import { requireAuth } from '@/middlewares/auth.middleware';

const router = Router();

router.post("/save", requireAuth,saveSale);
router.get("/", requireAuth, getSales);
router.get("/analytics", requireAuth, getSalesAnalytics);
router.patch("/:id/process", ...processSale);

export default router;
