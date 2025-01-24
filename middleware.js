import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // If user is an employee, they should only access employee routes
        if (token?.role === "EMPLOYEE") {
            if (!path.startsWith("/employee-dashboard")) {
                return NextResponse.redirect(new URL("/employee-dashboard", req.url));
            }
        }

        // If user is an admin, they should only access admin routes
        if (token?.role === "ADMIN") {
            if (path.startsWith("/employee-dashboard")) {
                return NextResponse.redirect(new URL("/manage-employees", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        }
    }
);

// Protect these routes
export const config = {
    matcher: [
        "/manage-employees/:path*",
        "/employee-dashboard/:path*",
        "/manage-employees",
        "/employee-dashboard"
    ]
};

