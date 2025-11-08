/**
 * Next.js Middleware for Route Protection
 * Protects dashboard and API routes from unauthorized access
 *
 * Security features:
 * - Session validation using NextAuth.js
 * - Automatic redirect to signin for unauthenticated users
 * - Protected routes: /dashboard/*, /api/* (except public endpoints)
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // You can add additional middleware logic here if needed
    // For example, role-based access control
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Example: Restrict /dashboard/admin to admin users
    if (path.startsWith("/dashboard/admin") && token?.plan !== "ENTERPRISE") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Allow the request to continue
    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true if user is authorized, false otherwise
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public API routes (no authentication required)
        const publicApiRoutes = [
          "/api/auth",
          "/api/redirect",
          "/api/test",
        ];

        // Check if the path starts with any public API route
        const isPublicApi = publicApiRoutes.some((route) =>
          path.startsWith(route)
        );

        if (isPublicApi) {
          return true;
        }

        // For protected routes, require a valid token
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
    },
  }
);

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    // Protected dashboard routes
    "/dashboard/:path*",

    // Protected API routes (except public ones)
    "/api/links/:path*",
    "/api/analytics/:path*",
    "/api/domains/:path*",
    "/api/user/:path*",
  ],
};
