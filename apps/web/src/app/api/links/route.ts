/**
 * Links API Route
 * POST /api/links - Create a new short link
 * GET /api/links - Get user's links
 *
 * Security features:
 * - Session-based authentication
 * - Rate limiting (per-user, plan-based)
 * - Input validation with Zod
 * - URL safety checking
 * - User limit enforcement
 * - Ownership verification
 *
 * AI features:
 * - Automatic slug suggestions
 * - SEO metadata generation
 * - Content categorization
 * - Vector embeddings for semantic search
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import {
  createLink,
  getUserLinks,
  createLinkSchema,
  isSafeUrl,
  normalizeUrl,
} from "@/lib/link-helpers";
import { rateLimit, createRateLimitResponse, addRateLimitHeaders } from "@/lib/rate-limit";

/**
 * POST /api/links
 * Create a new short link with AI enhancements
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting check
    const rateLimitResult = await rateLimit(req);

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    // 2. Authenticate user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // 3. Parse and validate request body
    const body = await req.json();

    // Normalize destination URL
    if (body.destination) {
      body.destination = normalizeUrl(body.destination);
    }

    const validated = createLinkSchema.parse(body);

    // 4. Security: Check if URL is safe
    if (!isSafeUrl(validated.destination)) {
      return NextResponse.json(
        {
          success: false,
          error: "This URL appears to be unsafe and cannot be shortened",
        },
        { status: 400 }
      );
    }

    // 5. Create link with AI enhancements
    const link = await createLink(session.user.id, validated);

    // 6. Return success response with rate limit headers
    const response = NextResponse.json(
      {
        success: true,
        link: {
          id: link.id,
          shortCode: link.shortCode,
          shortUrl: link.shortUrl,
          destination: link.destination,
          title: link.title,
          description: link.description,
          category: link.category,
          createdAt: link.createdAt,
        },
      },
      { status: 201 }
    );

    return addRateLimitHeaders(response, rateLimitResult);
  } catch (error: any) {
    console.error("Error creating link:", error);

    // Validation error (Zod)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // User limit exceeded
    if (error.message.includes("plan limit")) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    // Duplicate short code (shouldn't happen with validation, but just in case)
    if (error.code === "P2002" || error.message.includes("already taken")) {
      return NextResponse.json(
        {
          success: false,
          error: "This short code is already taken. Please choose another.",
        },
        { status: 409 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create link. Please try again.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/links
 * Get user's links with search and pagination
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Rate limiting check
    const rateLimitResult = await rateLimit(req);

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    // 2. Authenticate user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // 3. Parse query parameters
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);
    const search = searchParams.get("search") || undefined;

    // 4. Fetch user's links
    const result = await getUserLinks(session.user.id, {
      limit,
      offset,
      search,
    });

    // 5. Return success response with rate limit headers
    const response = NextResponse.json({
      success: true,
      ...result,
    });

    return addRateLimitHeaders(response, rateLimitResult);
  } catch (error: any) {
    console.error("Error fetching links:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch links. Please try again.",
      },
      { status: 500 }
    );
  }
}
