import { NextRequest, NextResponse } from 'next/server';

type CachedTenant = { id: string; slug: string; expires: number }
const cache = new Map<string, CachedTenant>()
const TTL = 10 * 60 * 1000

function normalizeHost(h?: string | null) {
  if (!h) return ''
  const host = h.toLowerCase().split(':')[0]
  return host.startsWith('www.') ? host.slice(4) : host
}

async function resolveTenant(host: string) {
  const now = Date.now()
  const c = cache.get(host)
  if (c && c.expires > now) return c
  const api = (() => {
    const raw = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').trim()
    const cleaned = raw.replace(/^"+|"+$/g, '')
    return cleaned
  })()
  const res = await fetch(`${api}/tenant/resolve`, { headers: { host } })
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  if (!data?.tenantId) return null
  const entry = { id: data.tenantId as string, slug: data.slug as string, expires: now + TTL }
  cache.set(host, entry)
  return entry
}

export default async function middleware(req: NextRequest) {
  const rawHost = req.headers.get('x-forwarded-host') || req.headers.get('host') || ''
  const host = normalizeHost(rawHost)
  if (!host) return NextResponse.next()

  const resolved = await resolveTenant(host)
  if (!resolved) {
    return NextResponse.next()
  }

  const { pathname } = req.nextUrl;
  const protectedPaths = ['/account', '/orders'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const headers = new Headers(req.headers)
  headers.set('x-tenant-id', resolved.id)
  if (!isProtected) {
    return NextResponse.next({ request: { headers } })
  }
  const cookieToken = req.cookies.get('auth_token')?.value;
  if (!cookieToken) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    '/:path*',
  ],
};
