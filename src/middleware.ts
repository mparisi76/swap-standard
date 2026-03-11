import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check for the session cookie
  const sessionToken = request.cookies.get('directus_session');

  // If trying to access any route under /dashboard without a token, redirect to login
  if (request.nextUrl.pathname.startsWith('/dashboard') && !sessionToken) {
    const loginUrl = new URL('/login', request.url);
    // Keep track of where they wanted to go so we can send them back after login
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Config to specify which routes this middleware applies to
export const config = {
  matcher: ['/dashboard/:path*'],
};