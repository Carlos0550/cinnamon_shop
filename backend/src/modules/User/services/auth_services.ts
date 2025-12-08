import { prisma } from "@/config/prisma";
import { comparePassword, hashPassword } from "@/config/bcrypt";
import { Request, Response } from "express";
import { signToken } from "@/config/jwt";
import { redis } from "@/config/redis";
import { sendEmail } from "@/config/resend";
import { welcomeKuromiHTML } from "@/templates/welcome_kuromi";
import { new_user_html } from "@/templates/new_user";
import { verifyToken as verifyClerkToken } from "@clerk/backend";

class AuthServices {
    async loginAdmin(req: Request, res: Response) {
        const { email, password } = req.body;
        const rows: any[] = await prisma.$queryRaw`SELECT id, email, password, name, role, profile_image FROM "Admin" WHERE email = ${email} LIMIT 1`;
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ ok: false, error: 'invalid_email', message: "El correo electrónico no está registrado" });
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ ok: false, error: 'invalid_password', message: "La contraseña es incorrecta" });
        }

        const payload = {
            sub: user.id.toString(),
            email: user.email,
            name: user.name,
            role: 1,
            is_clerk: false,
            subjectType: 'admin',
        }
        const token = signToken(payload);

        await redis.set(`user:${token}`, JSON.stringify(payload), 'EX', 60 * 60 * 24);
        const user_without_password = {
            ...user,
            password: undefined,
        }

        return res.status(200).json({ ok: true, token, user: user_without_password });
    }

    async loginShop(req: Request, res: Response) {
        const { email, password } = req.body;
        const user = await prisma.user.findFirst({
            where: {
                email: email,
                role: 2,
            }
        })

        if (!user) {
            return res.status(400).json({ ok: false, error: 'invalid_email', message: "El correo electrónico no está registrado" });
        }
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ ok: false, error: 'invalid_password', message: "La contraseña es incorrecta" });
        }

        const payload = {
            sub: user.id.toString(),
            email: user.email,
            name: user.name,
            role: 2,
            is_clerk: user.is_clerk ?? false,
            subjectType: 'user',
        }
        const token = signToken(payload);

        await redis.set(`user:${token}`, JSON.stringify(payload), 'EX', 60 * 60 * 24);
        const user_without_password = {
            ...user,
            password: undefined,
        }

        return res.status(200).json({ ok: true, token, user: user_without_password });
    }

    async clerkLogin(req: Request, res: Response) {
        try {
            const authHeader = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined;
            if (!authHeader) {
                console.warn('clerk_login_missing_token');
                return res.status(401).json({ ok: false, error: 'missing_clerk_token' });
            }
            const parts = authHeader.split(' ');
            if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
                console.warn('clerk_login_invalid_auth_header');
                return res.status(401).json({ ok: false, error: 'invalid_auth_header' });
            }
            const clerkToken = parts[1];
            console.log("clerkToken", clerkToken)
            if (!process.env.CLERK_SECRET_KEY) {
                console.error('clerk_login_missing_secret_key');
                return res.status(500).json({ ok: false, error: 'missing_clerk_secret_key' });
            }
            const verified = await verifyClerkToken(clerkToken, {
                secretKey: process.env.CLERK_SECRET_KEY,
            });
            const { email, name, profileImage } = req.body as {
                email?: string;
                name?: string;
                profileImage?: string;
            };

            const payloadClaims = (verified as any) || {};
            console.log("payloadClaims", payloadClaims)
            const claimedEmail = payloadClaims?.email || email;
            if (!claimedEmail) {
                console.warn('clerk_login_missing_email');
                return res.status(400).json({ ok: false, error: 'missing_email' });
            }
            if (payloadClaims?.email_verified === false) {
                console.warn('clerk_login_email_not_verified');
                return res.status(400).json({ ok: false, error: 'email_not_verified' });
            }

            const normalized_name = ((name || (claimedEmail.split('@')[0]))).trim().toLowerCase();

            const clerkUserId = payloadClaims?.sub as string | undefined;
            const picture = profileImage || payloadClaims?.picture || undefined;

            const existingByClerkId = clerkUserId ? await prisma.user.findUnique({ where: { clerk_user_id: clerkUserId } }) : null;

            let user = existingByClerkId;

            if (!user) {
                const secure_password = Math.random().toString(36).slice(-12);
                const hashed = await hashPassword(secure_password);
                user = await prisma.user.create({
                    data: {
                        email: claimedEmail,
                        password: hashed,
                        name: normalized_name,
                        is_clerk: true,
                        clerk_user_id: clerkUserId,
                        profile_image: picture,
                        role: 2,
                    }
                });
            } else {
                try {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            name: normalized_name,
                            is_clerk: true,
                            clerk_user_id: clerkUserId,
                            profile_image: picture,
                        }
                    });
                    user = { ...user, name: normalized_name, is_clerk: true, clerk_user_id: clerkUserId, profile_image: picture } as any;
                } catch { }
            }

            if (!user) {
                return res.status(500).json({ ok: false, error: 'user_persist_failed' });
            }
            const payload = {
                sub: user.id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                profileImage: picture,
                is_clerk: true,
                subjectType: 'user',
            };
            const token = signToken(payload);

            await redis.set(`user:${token}`, JSON.stringify(payload), 'EX', 60 * 60 * 24);
            const user_without_password = { ...user, password: undefined } as any;
            return res.status(200).json({ ok: true, token, user: user_without_password });
        } catch (err) {
            console.warn('clerk_login_invalid_token', err);
            return res.status(401).json({ ok: false, error: 'invalid_clerk_token' });
        }
    }

    async resetPasswordShop(req: Request, res: Response) {
        try {
            const { email } = req.body as { email?: string };
            if (!email) return res.status(400).json({ ok: false, error: 'missing_email' });
            const user = await prisma.user.findFirst({ where: { email, role: 2 } });
            if (!user) return res.status(404).json({ ok: false, error: 'user_not_found' });
            const code = String(Math.floor(100000 + Math.random() * 900000));
            const hashed = await hashPassword(code);
            await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
            try {
                await sendEmail({ to: user.email, subject: 'Recuperación de contraseña', text: `Tu nueva contraseña temporal es: ${code}. Ingresa y cámbiala desde tu cuenta.` });
            } catch {}
            return res.status(200).json({ ok: true });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'reset_password_failed' });
        }
    }

    async changePasswordShop(req: Request, res: Response) {
        try {
            const { old_password, new_password } = req.body as { old_password?: string; new_password?: string };
            if (!old_password || !new_password) return res.status(400).json({ ok: false, error: 'missing_fields' });
            const userClaim = (req as any).user;
            const user = await prisma.user.findUnique({ where: { id: Number(userClaim.sub || userClaim.id) } });
            if (!user) return res.status(404).json({ ok: false, error: 'user_not_found' });
            const ok = await comparePassword(old_password, user.password);
            if (!ok) return res.status(401).json({ ok: false, error: 'invalid_old_password' });
            const hashed = await hashPassword(new_password);
            await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
            return res.status(200).json({ ok: true });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'change_password_failed' });
        }
    }

    
    async registerAdmin(req: Request, res: Response) {
        const { email, password, name } = req.body;
        const existingRows: any[] = await prisma.$queryRaw`SELECT id FROM "Admin" WHERE email = ${email} LIMIT 1`;
        const user_exists = existingRows[0];

        if (user_exists) {
            return res.status(400).json({ ok: false, error: 'email_already_registered' });
        }
        const normalized_name = name.trim().toLowerCase()
        const hashed = await hashPassword(password);
        await prisma.$executeRaw`INSERT INTO "Admin" (email, password, name, is_active, role, created_at, updated_at) VALUES (${email}, ${hashed}, ${normalized_name}, true, 1, NOW(), NOW())`;
        const createdRows: any[] = await prisma.$queryRaw`SELECT id, email, name, role, profile_image, created_at, updated_at FROM "Admin" WHERE email = ${email} LIMIT 1`;
        const user = createdRows[0];

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
        if (Number(role_id) === 1) {
            const rows: any[] = await prisma.$queryRaw`SELECT id FROM "Admin" WHERE email = ${email} LIMIT 1`;
            const exists = rows[0];
            if (exists) {
                return res.status(400).json({ ok: false, error: 'email_already_registered' });
            }
        } else {
            const exists = await prisma.user.findFirst({ where: { email, role: 2 } });
            if (exists) {
                return res.status(400).json({ ok: false, error: 'email_already_registered' });
            }
        }

        var secure_password = Math.random().toString(36).slice(-8);
        var hashedPassword = await hashPassword(secure_password);
        const normalized_name = name.trim().toLowerCase()
        let user: any;
        if (Number(role_id) === 1) {
            await prisma.$executeRaw`INSERT INTO "Admin" (email, password, name, is_active, role, created_at, updated_at) VALUES (${email}, ${hashedPassword}, ${normalized_name}, true, 1, NOW(), NOW())`;
            const created: any[] = await prisma.$queryRaw`SELECT id, email, name, role, profile_image, created_at, updated_at FROM "Admin" WHERE email = ${email} LIMIT 1`;
            user = created[0];
        } else {
            user = await prisma.user.create({
                data: {
                    email: email,
                    password: hashedPassword,
                    name: normalized_name,
                    role: 2,
                }
            })
        }
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
        const { page, limit, search, type } = req.query as any

        const pageQ = Number(page) || 1
        const limitQ = Number(limit) || 10
        const searchQ = (search ? String(search) : '').toLowerCase()
        const typeQ = String(type || 'user').toLowerCase() === 'admin' ? 'admin' : 'user'

        if (typeQ === 'admin') {
            try {
                const pattern = `%${searchQ}%`
                let countRows: any[] = []
                let rows: any[] = []
                if (searchQ) {
                    countRows = await prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "Admin" WHERE name ILIKE ${pattern} OR email ILIKE ${pattern}`
                    rows = await prisma.$queryRaw`SELECT id, name, email, role, is_active FROM "Admin" WHERE name ILIKE ${pattern} OR email ILIKE ${pattern} ORDER BY created_at DESC LIMIT ${limitQ} OFFSET ${(pageQ - 1) * limitQ}`
                } else {
                    countRows = await prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "Admin"`
                    rows = await prisma.$queryRaw`SELECT id, name, email, role, is_active FROM "Admin" ORDER BY created_at DESC LIMIT ${limitQ} OFFSET ${(pageQ - 1) * limitQ}`
                }
                const count = Number(countRows?.[0]?.count || 0)
                const users = rows.map((r: any) => ({ id: String(r.id), name: r.name, email: r.email, role: 1, is_active: !!r.is_active }))
                const total_pages = Math.ceil(count / limitQ)
                const pagination = { total: count, page: pageQ, limit: limitQ, totalPages: total_pages, hasNextPage: pageQ < total_pages, hasPrevPage: pageQ > 1 }
                return res.status(200).json({ ok: true, users, pagination })
            } catch (err) {
                return res.status(500).json({ ok: false, error: 'internal_error' })
            }
        }

        const where: any = { role: 2 }
        if (searchQ) {
            where.OR = [
                { name: { contains: searchQ } },
                { email: { contains: searchQ } }
            ]
        }
        const [count, users] = await Promise.all([
            prisma.user.count({ where }),
            prisma.user.findMany({
                select: { id: true, name: true, email: true, role: true, is_active: true },
                where,
                skip: (pageQ - 1) * limitQ,
                take: limitQ,
                orderBy: { created_at: 'desc' }
            })
        ])
        const total_pages = Math.ceil(count / limitQ)
        const pagination = { total: count, page: pageQ, limit: limitQ, totalPages: total_pages, hasNextPage: pageQ < total_pages, hasPrevPage: pageQ > 1 }
        return res.status(200).json({ ok: true, users: users.map(u => ({ ...u, id: String(u.id) })), pagination })
    }

    async disableUser(req: Request, res: Response) {
        const { id } = req.params as any
        const type = String((req.query as any)?.type || 'user').toLowerCase()
        if (type === 'admin') {
            const exists: any[] = await prisma.$queryRaw`SELECT id FROM "Admin" WHERE id = ${Number(id)} LIMIT 1`
            if (!exists?.[0]) return res.status(404).json({ ok: false, error: 'user_not_found' })
            await prisma.$executeRaw`UPDATE "Admin" SET is_active = FALSE, updated_at = NOW() WHERE id = ${Number(id)}`
            return res.status(200).json({ ok: true })
        }
        const found = await prisma.user.findUnique({ where: { id: Number(id) } })
        if (!found) return res.status(404).json({ ok: false, error: 'user_not_found' })
        await prisma.user.update({ where: { id: Number(id) }, data: { is_active: false } })
        return res.status(200).json({ ok: true })
    }

    async enableUser(req: Request, res: Response) {
        const { id } = req.params as any
        const type = String((req.query as any)?.type || 'user').toLowerCase()
        if (type === 'admin') {
            const exists: any[] = await prisma.$queryRaw`SELECT id FROM "Admin" WHERE id = ${Number(id)} LIMIT 1`
            if (!exists?.[0]) return res.status(404).json({ ok: false, error: 'user_not_found' })
            await prisma.$executeRaw`UPDATE "Admin" SET is_active = TRUE, updated_at = NOW() WHERE id = ${Number(id)}`
            return res.status(200).json({ ok: true })
        }
        const found = await prisma.user.findUnique({ where: { id: Number(id) } })
        if (!found) return res.status(404).json({ ok: false, error: 'user_not_found' })
        await prisma.user.update({ where: { id: Number(id) }, data: { is_active: true } })
        return res.status(200).json({ ok: true })
    }

    async deleteUser(req: Request, res: Response) {
        const { id } = req.params as any
        const type = String((req.query as any)?.type || 'user').toLowerCase()
        if (type === 'admin') {
            const exists: any[] = await prisma.$queryRaw`SELECT id FROM "Admin" WHERE id = ${Number(id)} LIMIT 1`
            if (!exists?.[0]) return res.status(404).json({ ok: false, error: 'user_not_found' })
            await prisma.$executeRaw`DELETE FROM "Admin" WHERE id = ${Number(id)}`
            return res.status(200).json({ ok: true })
        }
        const found = await prisma.user.findUnique({ where: { id: Number(id) } })
        if (!found) return res.status(404).json({ ok: false, error: 'user_not_found' })
        await prisma.user.delete({ where: { id: Number(id) } })
        return res.status(200).json({ ok: true })
    }

    async resetPasswordAdmin(req: Request, res: Response) {
        try {
            const { email } = req.body as { email?: string };
            if (!email) return res.status(400).json({ ok: false, error: 'missing_email' });
            const rows: any[] = await prisma.$queryRaw`SELECT id, email FROM "Admin" WHERE email = ${email} LIMIT 1`;
            const admin = rows[0];
            if (!admin) return res.status(404).json({ ok: false, error: 'user_not_found' });
            const code = String(Math.floor(100000 + Math.random() * 900000));
            const hashed = await hashPassword(code);
            await prisma.$executeRaw`UPDATE "Admin" SET password = ${hashed}, updated_at = NOW() WHERE id = ${admin.id}`;
            try { await sendEmail({ to: admin.email, subject: 'Recuperación de contraseña', text: `Tu nueva contraseña temporal es: ${code}. Ingresa y cámbiala desde tu perfil.` }); } catch {}
            return res.status(200).json({ ok: true });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'reset_password_failed' });
        }
    }

    async changePasswordAdmin(req: Request, res: Response) {
        try {
            const { old_password, new_password } = req.body as { old_password?: string; new_password?: string };
            if (!old_password || !new_password) return res.status(400).json({ ok: false, error: 'missing_fields' });
            const claim = (req as any).user;
            const rows: any[] = await prisma.$queryRaw`SELECT id, password FROM "Admin" WHERE id = ${Number(claim.sub || claim.id)} LIMIT 1`;
            const admin = rows[0];
            if (!admin) return res.status(404).json({ ok: false, error: 'user_not_found' });
            const ok = await comparePassword(old_password, admin.password);
            if (!ok) return res.status(401).json({ ok: false, error: 'invalid_old_password' });
            const hashed = await hashPassword(new_password);
            await prisma.$executeRaw`UPDATE "Admin" SET password = ${hashed}, updated_at = NOW() WHERE id = ${admin.id}`;
            return res.status(200).json({ ok: true });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'change_password_failed' });
        }
    }
}

export default AuthServices;
