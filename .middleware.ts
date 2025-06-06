import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const protectedPaths = ['/profile', '/api/friends', '/api/profile'];

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  // Routes publiques
  if (!protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const user = verifyToken(token);
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Ajouter user dans headers pour API routes si besoin
  const res = NextResponse.next();
  res.headers.set('x-user', JSON.stringify(user));
  return res;
}

export const config = {
  matcher: ['/profile/:path*', '/api/friends/:path*', '/api/profile/:path*'],
};
