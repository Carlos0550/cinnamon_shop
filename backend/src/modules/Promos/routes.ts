import { Router } from 'express';
import PromoServices from './services/promo.services';
import { uploadSingleImage } from '@/middlewares/image.middleware';
import { requireAuth } from '@/middlewares/auth.middleware';
const promo_services = new PromoServices();

const router = Router();

router.post("/", requireAuth, uploadSingleImage("image"), (req: any, res: any) => promo_services.createPromo(req,res))
router.get("/", (req: any, res: any) => promo_services.getPromos(req,res))
router.put("/:id", requireAuth, uploadSingleImage("image"), (req: any, res: any) => promo_services.updatePromo(req,res))
router.patch("/:id/active", requireAuth, (req: any, res: any) => promo_services.togglePromoActive(req,res))
router.delete("/:id", requireAuth, (req: any, res: any) => promo_services.deletePromo(req,res))
export default router;