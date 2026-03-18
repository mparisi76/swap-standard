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

  let validToken: string | null = null;
  let validUserId: string | null = null;
  let newRefreshToken: string | null = null;

  // Validate current session token
  if (sessionToken) {
    try {
      const check = await fetch(`${BASE_URL}/users/me?fields=id`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
        cache: 'no-store',
      });
      if (check.ok) {
        const { data } = await check.json();
        validToken = sessionToken;
        validUserId = data.id;
      }
    } catch { /* network error */ }
  }

  // If expired, attempt refresh
  if (!validToken && refreshToken) {
    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken, mode: 'json' }),
      });

      if (refreshRes.ok) {
        const { data } = await refreshRes.json();
        validToken = data.access_token;
        newRefreshToken = data.refresh_token;

        // Get user ID with the new token
        const userRes = await fetch(`${BASE_URL}/users/me?fields=id`, {
          headers: { Authorization: `Bearer ${validToken}` },
          cache: 'no-store',
        });
        if (userRes.ok) {
          const { data: userData } = await userRes.json();
          validUserId = userData.id;
        }
      }
    } catch { /* refresh failed */ }
  }

  // Redirect unauthenticated dashboard requests to login
  if (pathname.startsWith('/dashboard') && !validToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Forward validated token + userId via request headers so route handlers
  // don't re-validate (and don't consume the single-use refresh token again)
  const requestHeaders = new Headers(request.headers);
  if (validToken) requestHeaders.set('x-auth-token', validToken);
  if (validUserId) requestHeaders.set('x-auth-user-id', validUserId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Persist new tokens in cookies if we just refreshed
  if (newRefreshToken && validToken) {
    response.cookies.set('directus_session', validToken, COOKIE_OPTS);
    response.cookies.set('directus_refresh_token', newRefreshToken, COOKIE_OPTS);
  }

  return response;
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
};
