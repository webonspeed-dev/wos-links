/**
 * TypeScript type extensions for NextAuth.js
 * Adds custom fields to User and Session types
 */

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image: string;
      plan: "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
    plan?: "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    picture?: string | null;
    plan?: "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
    provider?: string;
  }
}
