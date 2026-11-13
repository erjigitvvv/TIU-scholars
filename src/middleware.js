import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-123456';
  return new TextEncoder().encode(secret);
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtectedPath = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/pending-approval');

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get('tiu_token')?.value;

  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  try {
    const verified = await jwtVerify(token, getJwtSecretKey());
    const { role } = verified.payload;

    return NextResponse.next();
  } catch (err) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/pending-approval/:path*'],
};
