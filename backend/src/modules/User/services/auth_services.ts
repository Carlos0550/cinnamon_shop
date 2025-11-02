import { prisma } from "@/config/prisma";
import { comparePassword, hashPassword } from "@/config/bcrypt";
import { Request, Response } from "express";
import { signToken } from "@/config/jwt";
import { redis } from "@/config/redis";
import { sendEmail } from "@/config/resend";
import { welcomeKuromiHTML } from "@/templates/welcome_kuromi";
import { new_user_html } from "@/templates/new_user";

class AuthServices {
    async login(req: Request, res: Response) {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!user) {
            return res.status(400).json({ ok: false, error: 'invalid_email' });
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ ok: false, error: 'invalid_password' });
        }

        const payload = {
            sub: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        }
        const token = signToken(payload);

        await redis.set(`user:${token}`, JSON.stringify(payload), 'EX', 60 * 60 * 24);
        const user_without_password = {
            ...user,
            password: undefined,
        }

        return res.status(200).json({ ok: true, token, user: user_without_password });
    }


    async createUser(req: Request, res: Response) {
        const { email, password, name } = req.body;
        const user_exists = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (user_exists) {
            return res.status(400).json({ ok: false, error: 'email_already_registered' });
        }
        const normalized_name = name.trim().toLowerCase()
        const user = await prisma.user.create({
            data: {
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

    async newUser(req: Request, res: Response) {
        const { email, role_id, name } = req.body;
        const user_exists = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        var secure_password = Math.random().toString(36).slice(-8);
        var password = await hashPassword(secure_password);
        if (user_exists) {
            return res.status(400).json({ ok: false, error: 'email_already_registered' });
        }
        const normalized_name = name.trim().toLowerCase()
        const user = await prisma.user.create({
            data: {
                email: email,
                password: await hashPassword(password),
                name: normalized_name,
                role: Number(role_id),
            }
        })
        let text_message = ''
        if (role_id == 2) {
            text_message = `
                <p style="margin:0 0 18px; font-size:15px; line-height:1.6; color:#F8F8F8;">
                Desde hoy, estás listo/a para explorar todo nuestro catálogo de productos, 
                desde maquillaje hasta accesorios, y descubrir tu estilo único.
              </p>
              <div style="text-align:center; margin:22px 0;">
                <a href="https://cinnamon-makeup.com/" target="_blank" 
                   style="display:inline-block; background:#000000; color:#FF6DAA; text-decoration:none; 
                          padding:12px 20px; border-radius:999px; font-weight:600; font-size:14px;">
                  Explorar catálogo
                </a>
              </div>
            `
        } else {
            text_message = `
          <p style="margin:0 0 18px; font-size:15px; line-height:1.6; color:#F8F8F8;">
                Fuiste invitado para administrar y gestionar todo nuestro catálogo de productos, ofertas, promociones, etc.
                Tu contraseña temporal es: ${secure_password}
              </p>
              <div style="text-align:center; margin:22px 0;">
                <a href="https://cinnamon-makeup.com/" target="_blank" 
                   style="display:inline-block; background:#000000; color:#FF6DAA; text-decoration:none; 
                          padding:12px 20px; border-radius:999px; font-weight:600; font-size:14px;">
                  Iniciar sesión
                </a>
              </div>
          `
        }
        const capitalized_name = normalized_name.replace(/\b\w/g, (match: string) => match.toUpperCase());
        try {
            const html = new_user_html(capitalized_name, text_message);
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
        return res.status(200).json({ ok: true, user })
    }

    async getUsers(req: Request, res: Response) {
        const {
            page,
            limit,
            search
        } = req.query

        const pageQ = Number(page) || 1
        const limitQ = Number(limit) || 10
        const searchQ = search?.toString().toLowerCase() || ''

        const where: any = {}

        if (searchQ) {
            where.OR = [
                {
                    name: {
                        contains: searchQ
                    }
                },
                {
                    email: {
                        contains: searchQ
                    }
                }
            ]
        }
        const [count, users] = await Promise.all([
            prisma.user.count({
                where
            }),
            prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
                where,
                skip: (pageQ - 1) * limitQ,
                take: limitQ,
            })
        ])

        const total_pages = Math.ceil(count / limitQ)
        const pagination = {
            total: count,
            page: pageQ,
            limit: limitQ,
            totalPages: total_pages,
            hasNextPage: pageQ < total_pages,
            hasPrevPage: pageQ > 1
        }
        return res.status(200).json({ ok: true, users, pagination })
    }
}

export default AuthServices;