/**
 * WOS Links - Bunny CDN Edge Script
 *
 * This script runs at the edge (100+ global locations) for ultra-fast redirects.
 * Deploy this to Bunny CDN Edge Scripting for sub-10ms performance.
 *
 * Features:
 * - Ultra-fast redirect lookups from Edge KV
 * - Edge-side click tracking (no backend round-trip)
 * - Bot detection
 * - Geo-based routing
 * - Device-based routing
 */

// Edge KV namespace (configured in Bunny CDN)
// import { KV } from "@bunny.net/edgescript";

/**
 * Main request handler
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  const shortCode = url.pathname.slice(1); // Remove leading slash

  // Health check endpoint
  if (shortCode === "_health") {
    return new Response("OK", { status: 200 });
  }

  // Empty path - redirect to homepage
  if (!shortCode) {
    return Response.redirect("https://wos.link", 302);
  }

  try {
    // 1. Lookup short code in Edge KV (sub-5ms)
    const linkData = await KV.get(`link:${shortCode}`);

    if (!linkData) {
      return notFound();
    }

    const link = JSON.parse(linkData);

    // 2. Check if link is enabled and not expired
    if (!link.enabled) {
      return new Response("Link is disabled", { status: 410 });
    }

    if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
      return new Response("Link has expired", { status: 410 });
    }

    // 3. Smart routing (optional)
    let destination = link.destination;

    if (link.routingRules) {
      destination = applyRoutingRules(link.routingRules, request);
    }

    // 4. Track click at edge (async, doesn't block redirect)
    trackClick(link.id, shortCode, request);

    // 5. Redirect (sub-10ms total)
    return Response.redirect(destination, 301);
  } catch (error) {
    console.error("Edge script error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

/**
 * Apply smart routing rules
 */
function applyRoutingRules(rules, request) {
  const userAgent = request.headers.get("user-agent") || "";
  const country = request.headers.get("cf-ipcountry") || "";

  for (const rule of rules) {
    if (rule.type === "geo" && country === rule.condition) {
      return rule.destination;
    }

    if (rule.type === "device") {
      if (rule.condition === "mobile" && isMobile(userAgent)) {
        return rule.destination;
      }
      if (rule.condition === "desktop" && !isMobile(userAgent)) {
        return rule.destination;
      }
    }
  }

  return rules.destination; // Default destination
}

/**
 * Track click at edge
 */
async function trackClick(linkId, shortCode, request) {
  const userAgent = request.headers.get("user-agent") || "";
  const ip = request.headers.get("cf-connecting-ip") || "";
  const country = request.headers.get("cf-ipcountry") || "";
  const city = request.headers.get("cf-ipcity") || "";
  const referer = request.headers.get("referer") || "";

  // Bot detection
  const isBot = detectBot(userAgent);

  // Device detection
  const device = isMobile(userAgent) ? "mobile" : "desktop";

  // Create tracking payload
  const trackingData = {
    linkId,
    shortCode,
    ip,
    country,
    city,
    device,
    userAgent,
    referer,
    isBot,
    timestamp: Date.now(),
  };

  // Send to backend analytics API (fire and forget)
  fetch("https://api.wos.link/v1/analytics/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Edge-Secret": "YOUR_SECRET_KEY", // Verify this is from edge
    },
    body: JSON.stringify(trackingData),
  }).catch((error) => {
    console.error("Failed to track click:", error);
  });
}

/**
 * Bot detection
 */
function detectBot(userAgent) {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /http/i,
  ];

  return botPatterns.some((pattern) => pattern.test(userAgent));
}

/**
 * Mobile detection
 */
function isMobile(userAgent) {
  return /mobile|android|iphone|ipad|phone/i.test(userAgent);
}

/**
 * 404 response
 */
function notFound() {
  return new Response("Link not found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

// Export for Bunny CDN
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});
