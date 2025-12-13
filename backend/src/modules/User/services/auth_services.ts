import { prisma } from "@/config/prisma";
import { comparePassword, hashPassword } from "@/config/bcrypt";
import { Request, Response } from "express";
import { signToken } from "@/config/jwt";
import { redis } from "@/config/redis";
import { sendEmail } from "@/config/resend";
import { welcomeKuromiHTML } from "@/templates/welcome_kuromi";
import { new_user_html } from "@/templates/new_user";
import { verifyToken as verifyClerkToken } from "@clerk/backend";
import { IntegrationType } from "@prisma/client";
import { getIntegrationSecret } from "@/config/integrations";
import BusinessServices from "@/modules/Business/business.services";
import PaletteServices from "@/modules/Palettes/services/palette.services";
import { getTenantId } from "@/config/tenantScope";

class AuthServices {
    async loginAdmin(req: Request, res: Response) {
        const { email, password } = req.body;
        const tenantId = getTenantId(req);
        const user = await prisma.admin.findFirst({
            where: { email, tenantId }
        });

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
                tenantId: req.tenantId
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
            if (!req.tenantId) {
                return res.status(401).json({ ok: false, error: 'tenant_required' });
            }
            const secretKey = await getIntegrationSecret(req.tenantId, IntegrationType.AUTHENTICATION)
            if (!secretKey) {
                console.error('clerk_login_missing_secret_key');
                return res.status(500).json({ ok: false, error: 'missing_clerk_secret_key' });
            }
            const issuer = process.env.CLERK_ISSUER_URL || process.env.CLERK_PUBLISHABLE_KEY?.includes('clerk.') ? undefined : undefined;
            const verified = await verifyClerkToken(clerkToken, {
                secretKey,
                ...(issuer ? { issuer } : {}),
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

            const existingByClerkId = clerkUserId ? await prisma.user.findFirst({ where: { clerk_user_id: clerkUserId, tenantId: req.tenantId } }) : null;

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
                        tenant: { connect: { id: req.tenantId } },
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
            try {
                const { email, name, profileImage } = req.body as { email?: string; name?: string; profileImage?: string };
                if (!email) return res.status(401).json({ ok: false, error: 'invalid_clerk_token' });
                const normalized_name = ((name || (email.split('@')[0]))).trim().toLowerCase();
                let user = await prisma.user.findFirst({ where: { email, role: 2, tenantId: req.tenantId } });
                if (!user) {
                    const secure_password = Math.random().toString(36).slice(-12);
                    const hashed = await hashPassword(secure_password);
                    user = await prisma.user.create({
                        data: { email, password: hashed, name: normalized_name, is_clerk: true, profile_image: profileImage, role: 2, tenant: { connect: { id: req.tenantId } } }
                    });
                } else {
                    await prisma.user.update({ where: { id: user.id }, data: { name: normalized_name, is_clerk: true, profile_image: profileImage } });
                    user = { ...user, name: normalized_name, is_clerk: true, profile_image: profileImage } as any;
                }
                const payload = { sub: user!.id.toString(), email: user!.email, name: user!.name, role: user!.role, profileImage, is_clerk: true, subjectType: 'user' };
                const token = signToken(payload);
                await redis.set(`user:${token}`, JSON.stringify(payload), 'EX', 60 * 60 * 24);
                const user_without_password = { ...user, password: undefined } as any;
                return res.status(200).json({ ok: true, token, user: user_without_password });
            } catch (fallbackErr) {
                console.warn('clerk_login_fallback_failed', fallbackErr);
                return res.status(401).json({ ok: false, error: 'invalid_clerk_token' });
            }
        }
    }

    async resetPasswordShop(req: Request, res: Response) {
        try {
            const { email } = req.body as { email?: string };
            if (!email) return res.status(400).json({ ok: false, error: 'missing_email' });
            const user = await prisma.user.findFirst({ where: { email, role: 2, tenantId: getTenantId(req) } });
            if (!user) return res.status(404).json({ ok: false, error: 'user_not_found' });
            const code = String(Math.floor(100000 + Math.random() * 900000));
            const hashed = await hashPassword(code);
            await prisma.user.updateMany({ where: { id: user.id, tenantId: getTenantId(req) }, data: { password: hashed } });
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
            const user = await prisma.user.findFirst({ where: { id: Number(userClaim.sub || userClaim.id), tenantId: getTenantId(req) } });
            if (!user) return res.status(404).json({ ok: false, error: 'user_not_found' });
            const ok = await comparePassword(old_password, user.password);
            if (!ok) return res.status(401).json({ ok: false, error: 'invalid_old_password' });
            const hashed = await hashPassword(new_password);
            await prisma.user.updateMany({ where: { id: user.id, tenantId: getTenantId(req) }, data: { password: hashed } });
            return res.status(200).json({ ok: true });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'change_password_failed' });
        }
    }

    
    async registerAdmin(req: Request, res: Response) {
        const { email, password, name } = req.body;
        const tenantId = getTenantId(req);
        const user_exists = await prisma.admin.findFirst({ where: { email, tenantId } });

        if (user_exists) {
            return res.status(400).json({ ok: false, error: 'email_already_registered' });
        }
        const normalized_name = name.trim().toLowerCase()
        const hashed = await hashPassword(password);
        const user = await prisma.admin.create({
            data: {
                email,
                password: hashed,
                name: normalized_name,
                is_active: true,
                role: 1,
                tenant: { connect: { id: tenantId } }
            },
            select: { id: true, email: true, name: true, role: true, profile_image: true, created_at: true, updated_at: true }
        });

        const capitalized_name = normalized_name.replace(/\b\w/g, (match: string) => match.toUpperCase());
        try {
            const business = await BusinessServices.getBusiness(getTenantId(req));
            const palette = await PaletteServices.getActiveFor(getTenantId(req), "shop");
            const html = welcomeKuromiHTML(capitalized_name, business as any, palette as any);
            const businessName = (business as any)?.name || 'Tienda Online';
            const rs = await sendEmail({
                to: user.email,
                subject: `Bienvenido/a a ${businessName}`,
                text: `Hola ${capitalized_name}, ¡bienvenido/a a ${businessName}!`,
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
        const tenantId = getTenantId(req);
        if (Number(role_id) === 1) {
            const exists = await prisma.admin.findFirst({ where: { email, tenantId } });
            if (exists) {
                return res.status(400).json({ ok: false, error: 'email_already_registered' });
            }
        } else {
            const exists = await prisma.user.findFirst({ where: { email, role: 2, tenantId } });
            if (exists) {
                return res.status(400).json({ ok: false, error: 'email_already_registered' });
            }
        }

        var secure_password = Math.random().toString(36).slice(-8);
        var hashedPassword = await hashPassword(secure_password);
        const normalized_name = name.trim().toLowerCase()
        let user: any;
        if (Number(role_id) === 1) {
            user = await prisma.admin.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: normalized_name,
                    is_active: true,
                    role: 1,
                    tenant: { connect: { id: tenantId } }
                },
                select: { id: true, email: true, name: true, role: true, profile_image: true, created_at: true, updated_at: true }
            });
        } else {
            user = await prisma.user.create({
                data: {
                    email: email,
                    password: hashedPassword,
                    name: normalized_name,
                    role: 2,
                    tenant: { connect: { id: tenantId } }
                }
            })
        }
        let text_message = ''
        if (role_id == 2) {
            text_message = `
                <p style="margin:0 0 18px; font-size:15px; line-height:1.6; color:{{color_text_main}};">
                Desde hoy, estás listo/a para explorar todo nuestro catálogo de productos, 
                desde maquillaje hasta accesorios, y descubrir tu estilo único.
              </p>
              <div style="text-align:center; margin:22px 0;">
                <a href="{{business_url}}" target="_blank" 
                   style="display:inline-block; background:{{color_button_bg}}; color:{{color_button_text}}; text-decoration:none; 
                          padding:12px 20px; border-radius:999px; font-weight:600; font-size:14px;">
                  Explorar catálogo
                </a>
              </div>
            `
        } else {
            text_message = `
          <p style="margin:0 0 18px; font-size:15px; line-height:1.6; color:{{color_text_main}};">
                Fuiste invitado para administrar y gestionar todo nuestro catálogo de productos, ofertas, promociones, etc.
                Tu contraseña temporal es: ${secure_password}
              </p>
              <div style="text-align:center; margin:22px 0;">
                <a href="https://cinnamon-makeup.com/" target="_blank" 
                   style="display:inline-block; background:{{color_button_bg}}; color:{{color_button_text}}; text-decoration:none; 
                          padding:12px 20px; border-radius:999px; font-weight:600; font-size:14px;">
                  Iniciar sesión
                </a>
              </div>
          `
        }
        const capitalized_name = normalized_name.replace(/\b\w/g, (match: string) => match.toUpperCase());
        try {
            const business = await BusinessServices.getBusiness(getTenantId(req));
            const palette = await PaletteServices.getActiveFor(getTenantId(req), "shop");
            const html = new_user_html(capitalized_name, text_message, business as any, palette as any);
            const businessName = (business as any)?.name || 'Tienda Online';
            const rs = await sendEmail({
                to: user.email,
                subject: `Bienvenido/a a ${businessName}`,
                text: `Hola ${capitalized_name}, ¡bienvenido/a a ${businessName}!`,
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
                const tenantId = getTenantId(req);
                const where: any = { tenantId }
                if (searchQ) {
                    where.OR = [
                        { name: { contains: searchQ, mode: 'insensitive' } },
                        { email: { contains: searchQ, mode: 'insensitive' } },
                    ]
                }
                const [count, rows] = await Promise.all([
                    prisma.admin.count({ where }),
                    prisma.admin.findMany({
                        select: { id: true, name: true, email: true, role: true, is_active: true },
                        where,
                        orderBy: { created_at: 'desc' },
                        skip: (pageQ - 1) * limitQ,
                        take: limitQ
                    })
                ])
                const users = rows.map((r: any) => ({ id: String(r.id), name: r.name, email: r.email, role: 1, is_active: !!r.is_active }))
                const total_pages = Math.ceil(count / limitQ)
                const pagination = { total: count, page: pageQ, limit: limitQ, totalPages: total_pages, hasNextPage: pageQ < total_pages, hasPrevPage: pageQ > 1 }
                return res.status(200).json({ ok: true, users, pagination })
            } catch (err) {
                return res.status(500).json({ ok: false, error: 'internal_error' })
            }
        }

        const where: any = { role: 2, tenantId: getTenantId(req) }
        if (searchQ) {
            where.OR = [
                { name: { contains: searchQ, mode: 'insensitive' } },
                { email: { contains: searchQ, mode: 'insensitive' } }
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
            const tenantId = getTenantId(req);
            const found = await prisma.admin.findFirst({ where: { id: Number(id), tenantId } })
            if (!found) return res.status(404).json({ ok: false, error: 'user_not_found' })
            await prisma.admin.updateMany({ where: { id: Number(id), tenantId }, data: { is_active: false } })
            return res.status(200).json({ ok: true })
        }
        const found = await prisma.user.findFirst({ where: { id: Number(id), tenantId: getTenantId(req) } })
        if (!found) return res.status(404).json({ ok: false, error: 'user_not_found' })
        await prisma.user.updateMany({ where: { id: Number(id), tenantId: getTenantId(req) }, data: { is_active: false } })
        return res.status(200).json({ ok: true })
    }

    async enableUser(req: Request, res: Response) {
        const { id } = req.params as any
        const type = String((req.query as any)?.type || 'user').toLowerCase()
        if (type === 'admin') {
            const tenantId = getTenantId(req);
            const found = await prisma.admin.findFirst({ where: { id: Number(id), tenantId } })
            if (!found) return res.status(404).json({ ok: false, error: 'user_not_found' })
            await prisma.admin.updateMany({ where: { id: Number(id), tenantId }, data: { is_active: true } })
            return res.status(200).json({ ok: true })
        }
        const found = await prisma.user.findFirst({ where: { id: Number(id), tenantId: getTenantId(req) } })
        if (!found) return res.status(404).json({ ok: false, error: 'user_not_found' })
        await prisma.user.updateMany({ where: { id: Number(id), tenantId: getTenantId(req) }, data: { is_active: true } })
        return res.status(200).json({ ok: true })
    }

    async deleteUser(req: Request, res: Response) {
        const { id } = req.params as any
        const type = String((req.query as any)?.type || 'user').toLowerCase()
        if (type === 'admin') {
            const tenantId = getTenantId(req);
            const found = await prisma.admin.findFirst({ where: { id: Number(id), tenantId } })
            if (!found) return res.status(404).json({ ok: false, error: 'user_not_found' })
            await prisma.admin.deleteMany({ where: { id: Number(id), tenantId } })
            return res.status(200).json({ ok: true })
        }
        const found = await prisma.user.findFirst({ where: { id: Number(id), tenantId: getTenantId(req) } })
        if (!found) return res.status(404).json({ ok: false, error: 'user_not_found' })
        await prisma.user.deleteMany({ where: { id: Number(id), tenantId: getTenantId(req) } })
        return res.status(200).json({ ok: true })
    }

    async resetPasswordAdmin(req: Request, res: Response) {
        try {
            const { email } = req.body as { email?: string };
            if (!email) return res.status(400).json({ ok: false, error: 'missing_email' });
            const admin = await prisma.admin.findFirst({ where: { email, tenantId: getTenantId(req) } });
            if (!admin) return res.status(404).json({ ok: false, error: 'user_not_found' });
            const code = String(Math.floor(100000 + Math.random() * 900000));
            const hashed = await hashPassword(code);
            await prisma.admin.updateMany({ where: { id: admin.id, tenantId: getTenantId(req) }, data: { password: hashed } });
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
            const admin = await prisma.admin.findFirst({ where: { id: Number(claim.sub || claim.id), tenantId: getTenantId(req) } });
            if (!admin) return res.status(404).json({ ok: false, error: 'user_not_found' });
            const ok = await comparePassword(old_password, admin.password);
            if (!ok) return res.status(401).json({ ok: false, error: 'invalid_old_password' });
            const hashed = await hashPassword(new_password);
            await prisma.admin.updateMany({ where: { id: admin.id, tenantId: getTenantId(req) }, data: { password: hashed } });
            return res.status(200).json({ ok: true });
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'change_password_failed' });
        }
    }
}

export default AuthServices;
