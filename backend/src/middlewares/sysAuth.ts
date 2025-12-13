import type { Request, Response, NextFunction } from 'express'

export function requireAdminToken(req: Request, res: Response, next: NextFunction) {
  const header = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined
  if (!header) return res.status(401).json({ ok: false, error: 'missing_admin_token' })
  const parts = header.split(' ')
  if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) return res.status(401).json({ ok: false, error: 'invalid_admin_auth' })
  const incoming = parts[1]
  const expected = process.env.ADMIN_TOKEN || ''
  if (!expected) return res.status(500).json({ ok: false, error: 'admin_token_not_configured' })
  if (incoming !== expected) return res.status(403).json({ ok: false, error: 'forbidden' })
  next()
}
