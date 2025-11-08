/**
 * User Registration API Endpoint
 * POST /api/auth/signup
 *
 * Security features:
 * - Input validation with Zod
 * - Password strength requirements
 * - Duplicate email checking
 * - Secure password hashing (bcrypt, 12 rounds)
 * - Rate limiting (TODO: Add when Redis is configured)
 */

import { NextRequest, NextResponse } from "next/server";
import { createUser, signupSchema } from "@/lib/auth-helpers";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validated = signupSchema.parse(body);

    // Create user (includes duplicate checking and password hashing)
    const user = await createUser({
      email: validated.email,
      password: validated.password,
      name: validated.name,
    });

    // Return success response (exclude sensitive data)
    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
    }, { status: 201 });

  } catch (error) {
    // Validation error (Zod)
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      }, { status: 400 });
    }

    // Duplicate email error
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json({
        success: false,
        error: "An account with this email already exists",
      }, { status: 409 });
    }

    // Generic error
    console.error("Signup error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to create account. Please try again.",
    }, { status: 500 });
  }
}
