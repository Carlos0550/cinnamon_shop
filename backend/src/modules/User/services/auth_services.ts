import { prisma } from "@/config/prisma";
import { comparePassword, hashPassword } from "@/config/bcrypt";
import { Request, Response } from "express";
import { signToken } from "@/config/jwt";
import { redis } from "@/config/redis";
import { sendEmail } from "@/config/resend";
import { welcomeKuromiHTML } from "@/templates/welcome_kuromi";

class AuthServices {
    async login(req:Request, res: Response) {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where:{
                email: email
            }
        })

        if (!user){
            return res.status(400).json({ ok: false, error: 'invalid_email' });
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid){
            return res.status(400).json({ ok: false, error: 'invalid_password' });
        }

        const payload = {
            sub: user.id.toString(),
            email: user.email,
            name: user.name,
        }
        const token = signToken(payload);

        await redis.set(`user:${token}`, JSON.stringify(payload), 'EX', 60 * 5);

        return res.status(200).json({ ok: true, token, user });
    }

    async createUser(req:Request, res: Response) {
        const { email, password, name } = req.body;
        const user_exists = await prisma.user.findUnique({
            where:{
                email: email
            }
        })

        if (user_exists){
            return res.status(400).json({ ok: false, error: 'email_already_registered' });
        }
        const normalized_name = name.trim().toLowerCase()
        const user = await prisma.user.create({
            data:{
                email: email,
                password: await hashPassword(password),
                name: normalized_name,
            }
        })

        const capitalized_name = normalized_name.replace(/\b\w/g, (match: string) => match.toUpperCase());
        try {
            const html = welcomeKuromiHTML(capitalized_name);
            const rs = await sendEmail({
                to: user.email,
                subject: 'Bienvenido/a a Cinnamon',
                text: `Hola ${capitalized_name}, ¡bienvenido/a a Cinnamon!`,
                html,
            });
            console.log('resend_send_result', rs);
        } catch (err) {
            console.error('resend_send_failed', err);
        }
        return res.status(200).json({ ok: true, user });
    }
}

export default AuthServices;