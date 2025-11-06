import { NextRequest, NextResponse } from "next/server";
import { db } from "@wos/database";
import UAParser from "ua-parser-js";

/**
 * GET /api/redirect/:shortCode
 * Handle short link redirects and track analytics
 *
 * NOTE: In production, this should be handled by Bunny CDN Edge Scripts
 * This is a fallback/development implementation
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const { shortCode } = params;

    // Find link
    const link = await db.link.findUnique({
      where: { shortCode },
    });

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    // Check if link is enabled
    if (!link.enabled) {
      return NextResponse.json(
        { error: "Link is disabled" },
        { status: 410 }
      );
    }

    // Check if link is expired
    if (link.expiresAt && new Date() > link.expiresAt) {
      return NextResponse.json(
        { error: "Link has expired" },
        { status: 410 }
      );
    }

    // Parse user agent
    const userAgent = req.headers.get("user-agent") || "";
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    const browser = parser.getBrowser();
    const os = parser.getOS();

    // Get IP (handle proxy headers)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Get referrer
    const referrer = req.headers.get("referer") || "";
    const referrerDomain = referrer
      ? new URL(referrer).hostname
      : null;

    // Track click (async, don't block redirect)
    db.click
      .create({
        data: {
          linkId: link.id,
          ip,
          userAgent,
          device: device.type || "desktop",
          browser: browser.name || "unknown",
          os: os.name || "unknown",
          referrer,
          referrerDomain,
          // TODO: Add geolocation
          // TODO: Add bot detection
          // TODO: Add fingerprinting
        },
      })
      .catch((error) => {
        console.error("Failed to track click:", error);
      });

    // Redirect to destination
    return NextResponse.redirect(link.destination, 301);
  } catch (error) {
    console.error("Error handling redirect:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
