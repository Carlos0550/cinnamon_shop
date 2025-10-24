import { Router } from 'express';
import { login, createUser, CreateUserController } from './routes.controller';
import AuthServices from './services/auth_services';
const authServices = new AuthServices();
const router = Router();

router.post('/users/login', login, authServices.login);
router.post('/users/register', createUser, authServices.createUser);
router.post("/users/new", CreateUserController, authServices.newUser)
router.get("/users", (req, res) => authServices.getUsers(req, res))

export default router;