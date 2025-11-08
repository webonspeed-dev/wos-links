/**
 * Authentication Helper Functions
 * Secure password hashing, user creation, and validation
 */

import { hash, compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@wos/database";

// Security configuration
const BCRYPT_ROUNDS = 12; // Higher = more secure but slower (12 is recommended)

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

export const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// ============================================
// PASSWORD HASHING
// ============================================

/**
 * Hash a password using bcrypt
 * Uses 12 rounds for security (takes ~300ms)
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Create a new user with email/password
 * Includes validation and duplicate checking
 */
export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
}) {
  // Validate input
  const validated = signupSchema.parse(data);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validated.email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const passwordHash = await hashPassword(validated.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: validated.email,
      name: validated.name,
      passwordHash,
      plan: "FREE",
      linksLimit: 100,
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      plan: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * Update user password
 * Verifies current password before updating
 */
export async function updateUserPassword(userId: string, data: {
  currentPassword: string;
  newPassword: string;
}) {
  // Validate input
  const validated = updatePasswordSchema.parse(data);

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.passwordHash) {
    throw new Error("Cannot update password for OAuth-only accounts");
  }

  // Verify current password
  const isValid = await verifyPassword(validated.currentPassword, user.passwordHash);

  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  const newPasswordHash = await hashPassword(validated.newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  return { success: true };
}

/**
 * Check if email is already registered
 */
export async function isEmailTaken(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return !!user;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      emailVerified: true,
      plan: true,
      linksCreated: true,
      linksLimit: true,
      createdAt: true,
    },
  });
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      emailVerified: true,
      plan: true,
      linksCreated: true,
      linksLimit: true,
      stripeCustomerId: true,
      subscriptionStatus: true,
      createdAt: true,
    },
  });
}

// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * Generate a secure random token
 * Used for email verification, password reset, etc.
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';

  // Use crypto for secure random generation
  const randomBytes = crypto.getRandomValues(new Uint8Array(length));

  for (let i = 0; i < length; i++) {
    token += chars[randomBytes[i] % chars.length];
  }

  return token;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .slice(0, 500); // Limit length
}

/**
 * Check if user has reached their plan limits
 */
export async function checkUserLimits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      linksCreated: true,
      linksLimit: true,
      plan: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const hasReachedLimit = user.linksCreated >= user.linksLimit;

  return {
    current: user.linksCreated,
    limit: user.linksLimit,
    plan: user.plan,
    hasReachedLimit,
    remaining: Math.max(0, user.linksLimit - user.linksCreated),
  };
}
