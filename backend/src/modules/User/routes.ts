import { Router } from 'express';
import { login, createUser, CreateUserController } from './routes.controller';
import AuthServices from './services/auth_services';
import { requireAuth, requireRole } from '@/middlewares/auth.middleware';
const authServices = new AuthServices();
const router = Router();

router.post('/login', login, authServices.login);
router.post('/register', createUser, authServices.createUser);
router.post("/new", CreateUserController, authServices.newUser)
router.get("/", requireAuth, requireRole([1]), (req, res) => authServices.getUsers(req, res))
router.get('/validate-token', requireAuth, (req, res) => {
    const user = (req as any).user;
    console.log("User:", user)
    res.json({ 
        ok: true, 
        id: user.id,
        email: user.email,
        name: user.name,
        is_active: true,
        role: user.role || 2
    });
});

export default router;