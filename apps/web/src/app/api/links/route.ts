import { NextRequest, NextResponse } from "next/server";
import { db } from "@wos/database";
import { nanoid } from "nanoid";

/**
 * POST /api/links
 * Create a new short link
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { destination, shortCode, customDomain } = body;

    // Validate destination URL
    if (!destination) {
      return NextResponse.json(
        { error: "Destination URL is required" },
        { status: 400 }
      );
    }

    // Generate short code if not provided
    const finalShortCode = shortCode || nanoid(7);

    // TODO: Get user from session
    const userId = "temp-user-id"; // Replace with actual auth

    // TODO: Generate AI slug suggestions if shortCode not provided
    // TODO: Generate embeddings for semantic search
    // TODO: Check for semantic duplicates

    // Create link
    const link = await db.link.create({
      data: {
        shortCode: finalShortCode,
        destination,
        domain: customDomain || "wos.link",
        userId,
      },
    });

    return NextResponse.json({
      id: link.id,
      shortCode: link.shortCode,
      shortUrl: `https://${link.domain}/${link.shortCode}`,
      destination: link.destination,
    });
  } catch (error: any) {
    console.error("Error creating link:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Short code already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/links
 * List all links for authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    // TODO: Get user from session
    const userId = "temp-user-id";

    const links = await db.link.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        _count: {
          select: { clicks: true },
        },
      },
    });

    return NextResponse.json({ links });
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}
