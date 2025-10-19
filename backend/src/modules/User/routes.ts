import { Router } from 'express';
import { login, createUser } from './routes.controller';
import AuthServices from './services/auth_services';
const authServices = new AuthServices();
const router = Router();

router.post('/login', login, authServices.login);
router.post('/register', createUser, authServices.createUser);


export default router;