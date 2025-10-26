import { Router } from 'express';
import PromoServices from './services/promo.services';
import { uploadSingleImage } from '@/middlewares/image.middleware';
const promo_services = new PromoServices();

const router = Router();

router.post("/",uploadSingleImage("image"), (req: any, res: any) => promo_services.createPromo(req,res))

export default router;