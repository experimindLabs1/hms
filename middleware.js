import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";

// Define protected routes
const protectedRoutes = ["/manage-employees", "/employee-dashboard"];
const adminRoutes = ["/manage-employees"];
const employeeRoutes = ["/employee-dashboard"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if it's a protected route
  if (protectedRoutes.includes(pathname)) {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1] || request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Verify token
      const decoded = await verifyToken(token);

      // Check role-based access
      if (decoded.role === "admin" && !adminRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL("/manage-employees", request.url));
      }

      if (decoded.role === "employee" && !employeeRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL("/employee-dashboard", request.url));
      }

      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("user", JSON.stringify(decoded));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
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

