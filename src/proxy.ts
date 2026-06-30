import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PATHS = ['/login', '/register'];
const PROTECTED_PREFIXES = ['/dashboard'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const response = NextResponse.next();

  // Security headers (CSP is set in next.config.ts headers() with nonce support)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');

  // HTTP → HTTPS in production
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') === 'http'
  ) {
    const url = request.nextUrl.clone();
    url.protocol = 'https';
    return NextResponse.redirect(url);
  }

  // CSRF infrastructure is in place (token generation + cookie + validation helper).
  // Enforcement is deferred until client-side fetch calls include the x-csrf-token header.
  // SameSite=Lax cookies provide baseline CSRF protection for all modern browsers.

  const hasAuth = request.cookies.has('ip_access_token');

  // Redirect unauthenticated users to login for protected paths
  if (!hasAuth && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (hasAuth && AUTH_PATHS.includes(pathname)) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
