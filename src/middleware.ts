import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of protected routes that require authentication
const protectedRoutes = ['/dashboard', '/submit'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Check if the requested path is a protected route
  if (protectedRoutes.includes(pathname)) {
    // If no token exists, redirect to login page
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If token exists and user tries to access login/register, redirect to dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 