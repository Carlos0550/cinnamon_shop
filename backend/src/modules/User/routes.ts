import { Router } from 'express';
import { login, createUser, CreateUserController } from './routes.controller';
import AuthServices from './services/auth_services';
const authServices = new AuthServices();
const router = Router();

router.post('/login', login, authServices.login);
router.post('/register', createUser, authServices.createUser);
router.post("/new", CreateUserController, authServices.newUser)
router.get("/", (req, res) => authServices.getUsers(req, res))

export default router;