import type { AuthUser } from '@/middlewares/auth.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      tenantId?: string;
      normalizedHost?: string;
    }
  }
}

export {}
