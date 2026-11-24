import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const cookieStore = await cookies();
  cookieStore.delete('tiu_token');
  cookieStore.delete('session');

  // If called via fetch or ajax
  const accept = request.headers.get('accept') || '';
  if (accept.includes('application/json')) {
    return NextResponse.json({ success: true, redirectUrl: '/login' });
  }

  // If called via standard HTML form POST
  return NextResponse.redirect(new URL('/login', request.url), 303);
}

export async function GET(request) {
  const cookieStore = await cookies();
  cookieStore.delete('tiu_token');
  cookieStore.delete('session');
  return NextResponse.redirect(new URL('/login', request.url), 303);
}
