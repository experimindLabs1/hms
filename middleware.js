import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';  // Using jose instead of jsonwebtoken for Edge compatibility

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

async function verifyAuth(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function middleware(request) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const verifiedToken = await verifyAuth(token);
    if (!verifiedToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check role-based access
    const { pathname } = request.nextUrl;
    if (pathname.startsWith('/manage-employees') && verifiedToken.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/employee-dashboard', request.url));
    }

    if (pathname.startsWith('/employee-dashboard') && verifiedToken.role !== 'EMPLOYEE') {
      return NextResponse.redirect(new URL('/manage-employees', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Protect these routes
export const config = {
  matcher: [
    '/manage-employees/:path*',
    '/employee-dashboard/:path*',
    '/manage-employees',
    '/employee-dashboard'
  ]
};

