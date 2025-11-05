import { Router } from 'express';
import { saveSale } from './router.controller';
import { requireAuth } from '@/middlewares/auth.middleware';

const router = Router();

router.post("/save", requireAuth,saveSale);

export default router;