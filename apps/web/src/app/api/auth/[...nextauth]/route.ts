/**
 * NextAuth.js API Route Handler
 * Handles all authentication endpoints:
 * - POST /api/auth/signin
 * - POST /api/auth/signout
 * - GET  /api/auth/session
 * - GET  /api/auth/providers
 * - POST /api/auth/callback/:provider
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
