import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('directus_session')?.value;
  const refreshToken = request.cookies.get('directus_refresh_token')?.value;

  // Validate the current session token
  let tokenValid = false;
  if (sessionToken) {
    try {
      const check = await fetch(`${BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
        cache: 'no-store',
      });
      tokenValid = check.ok;
    } catch {
      tokenValid = false;
    }
  }

  // If expired but refresh token exists, attempt refresh
  if (!tokenValid && refreshToken) {
    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken, mode: 'json' }),
      });

      if (refreshRes.ok) {
        const { data } = await refreshRes.json();
        const response = NextResponse.next();
        response.cookies.set('directus_session', data.access_token, COOKIE_OPTS);
        if (data.refresh_token) {
          response.cookies.set('directus_refresh_token', data.refresh_token, COOKIE_OPTS);
        }
        return response;
      }
    } catch {
      // Refresh failed — fall through to auth check below
    }
  }

  // No valid session — redirect dashboard routes to login
  if (pathname.startsWith('/dashboard') && !tokenValid) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
};
