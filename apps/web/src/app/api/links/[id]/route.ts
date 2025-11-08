/**
 * Individual Link API Routes
 * GET /api/links/[id] - Get specific link
 * PUT /api/links/[id] - Update link
 * DELETE /api/links/[id] - Delete link
 *
 * Security features:
 * - Session-based authentication
 * - Rate limiting (per-user, plan-based)
 * - Ownership verification
 * - Input validation with Zod
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import {
  getLinkById,
  updateLink,
  deleteLink,
  updateLinkSchema,
} from "@/lib/link-helpers";
import { rateLimit, createRateLimitResponse, addRateLimitHeaders } from "@/lib/rate-limit";

/**
 * GET /api/links/[id]
 * Get a specific link by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 3. Get link (with ownership check)
    const link = await getLinkById(params.id, session.user.id);

    if (!link) {
      return NextResponse.json(
        { success: false, error: "Link not found or you don't have permission to view it." },
        { status: 404 }
      );
    }

    // 4. Return success response
    const response = NextResponse.json({
      success: true,
      link,
    });

    return addRateLimitHeaders(response, rateLimitResult);
  } catch (error: any) {
    console.error("Error fetching link:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch link. Please try again.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/links/[id]
 * Update a specific link
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validated = updateLinkSchema.parse(body);

    // 4. Update link (with ownership check)
    const link = await updateLink(params.id, session.user.id, validated);

    // 5. Return success response
    const response = NextResponse.json({
      success: true,
      link,
    });

    return addRateLimitHeaders(response, rateLimitResult);
  } catch (error: any) {
    console.error("Error updating link:", error);

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

    // Not found or no permission
    if (error.message.includes("not found") || error.message.includes("permission")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update link. Please try again.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/links/[id]
 * Delete a specific link
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 3. Delete link (with ownership check)
    await deleteLink(params.id, session.user.id);

    // 4. Return success response
    const response = NextResponse.json({
      success: true,
      message: "Link deleted successfully",
    });

    return addRateLimitHeaders(response, rateLimitResult);
  } catch (error: any) {
    console.error("Error deleting link:", error);

    // Not found or no permission
    if (error.message.includes("not found") || error.message.includes("permission")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete link. Please try again.",
      },
      { status: 500 }
    );
  }
}
