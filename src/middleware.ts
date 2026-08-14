import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/overview', '/brand', '/campaigns', '/content', '/analytics', '/settings', '/strategy', '/calendar', '/competitors', '/market', '/seo', '/copilot'];
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('abge_session');
  const pathname = request.nextUrl.pathname;
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();

  // Root redirect to /overview if authenticated, else /login
  if (pathname === '/') {
    if (sessionCookie) {
      const response = NextResponse.redirect(new URL('/overview', request.url));
      response.headers.set('x-request-id', requestId);
      return response;
    } else {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.headers.set('x-request-id', requestId);
      return response;
    }
  }

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  let response = NextResponse.next();

  if (isProtectedRoute && !sessionCookie) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    response = NextResponse.redirect(url);
  } else if (isAuthRoute && sessionCookie) {
    response = NextResponse.redirect(new URL('/overview', request.url));
  }

  // Clone headers from the request if we are calling next(), but if it's a redirect, we just add the header to the response
  response.headers.set('x-request-id', requestId);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
