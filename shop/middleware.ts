import { NextRequest, NextResponse } from 'next/server';

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedPaths = ['/account', '/orders'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();
  const cookieToken = req.cookies.get('auth_token')?.value;
  if (!cookieToken) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/account/:path*',
    '/orders/:path*',
  ],
};
