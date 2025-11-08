/**
 * NextAuth.js Configuration
 * Supports: Credentials (email/password), Google OAuth, GitHub OAuth
 *
 * Security features:
 * - Bcrypt password hashing (12 rounds)
 * - Session tokens with automatic rotation
 * - CSRF protection (built-in)
 * - Secure session cookies (httpOnly, sameSite)
 */

import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { compare } from "bcryptjs";
import { prisma } from "@wos/database";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  // Session strategy: JWT for serverless compatibility
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Authentication providers
  providers: [
    // Email/Password authentication
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validation
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            passwordHash: true,
            emailVerified: true,
            plan: true,
          },
        });

        // User not found
        if (!user) {
          throw new Error("No user found with this email");
        }

        // Password not set (OAuth-only user)
        if (!user.passwordHash) {
          throw new Error("Please sign in with the provider you used to create your account");
        }

        // Verify password using bcrypt
        const isValidPassword = await compare(credentials.password, user.passwordHash);

        if (!isValidPassword) {
          throw new Error("Incorrect password");
        }

        // Return user object (passwordHash excluded for security)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
          plan: user.plan,
        };
      },
    }),

    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true, // Link to existing account if email matches
    }),

    // GitHub OAuth provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  // Custom pages
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },

  // Callbacks for session and JWT customization
  callbacks: {
    // JWT callback: Add user data to token
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.plan = (user as any).plan;
      }

      // OAuth sign in
      if (account?.provider) {
        token.provider = account.provider;
      }

      return token;
    },

    // Session callback: Add user data to session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        (session.user as any).plan = token.plan;
      }

      return session;
    },

    // Redirect callback: Handle post-login redirects
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;

      // Default to dashboard
      return `${baseUrl}/dashboard`;
    },
  },

  // Events for logging and analytics
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email} (${account?.provider || 'credentials'})`);

      if (isNewUser) {
        console.log(`New user registered: ${user.email}`);
      }
    },
    async signOut({ session, token }) {
      console.log(`User signed out: ${token.email}`);
    },
  },

  // Security options
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
};
