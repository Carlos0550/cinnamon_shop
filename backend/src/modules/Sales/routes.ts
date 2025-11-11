import { Router } from 'express';
import { getSales, saveSale, getSalesAnalytics } from './router.controller';
import { requireAuth } from '@/middlewares/auth.middleware';

const router = Router();

router.post("/save", requireAuth,saveSale);
router.get("/", requireAuth, getSales);
router.get("/analytics", requireAuth, getSalesAnalytics);

export default router;