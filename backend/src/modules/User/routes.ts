import { Router } from 'express';
import { login, createUser, CreateUserController } from './routes.controller';
import AuthServices from './services/auth_services';
import { requireAuth, requireRole } from '@/middlewares/auth.middleware';
const authServices = new AuthServices();
const router = Router();

router.post('/login', login, (req, res) => authServices.loginAdmin(req, res));
router.post('/register', createUser, (req, res) => authServices.registerAdmin(req, res));
router.post("/new", CreateUserController, authServices.newUser)
// Intercambio de sesión Clerk -> token propio
router.post('/clerk-login', (req, _res, next) => next(), (req, res) => authServices.clerkLogin(req, res));
router.get("/users", requireAuth, requireRole([1]), (req, res) => authServices.getUsers(req, res))
router.put('/users/:id/disable', requireAuth, requireRole([1]), (req, res) => authServices.disableUser(req, res))
router.put('/users/:id/enable', requireAuth, requireRole([1]), (req, res) => authServices.enableUser(req, res))
router.delete('/users/:id', requireAuth, requireRole([1]), (req, res) => authServices.deleteUser(req, res))
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
    });
});

export default router;
