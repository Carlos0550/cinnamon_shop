import { Router } from 'express';
import AuthServices from '@/modules/User/services/auth_services';
import { requireAuth } from '@/middlewares/auth.middleware';

const router = Router();
const authServices = new AuthServices();

router.post('/login', (req, _res, next) => next(), (req, res) => authServices.loginShop(req, res));
router.post('/clerk-login', (req, _res, next) => next(), (req, res) => authServices.clerkLogin(req, res));

router.get('/validate-token', requireAuth, (req, res) => {
  const user = (req as any).user;
  res.json({
    ok: true,
    id: user.sub || user.id,
    email: user.email,
    name: user.name,
    is_active: true,
    role: user.role || 2,
    profileImage: user.profileImage || null,
    is_clerk: !!user.is_clerk,
    subjectType: 'user',
  });
});

export default router;
