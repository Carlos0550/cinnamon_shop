import { Router } from 'express';
import { getSales, saveSale } from './router.controller';
import { requireAuth } from '@/middlewares/auth.middleware';

const router = Router();

router.post("/save", requireAuth,saveSale);
router.get("/", requireAuth, getSales);

export default router;