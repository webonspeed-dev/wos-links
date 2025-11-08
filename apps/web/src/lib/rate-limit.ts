/**
 * Rate Limiting Utilities
 * Supports both Upstash Redis (production) and in-memory (development)
 *
 * Security features:
 * - Per-user rate limiting (authenticated endpoints)
 * - Per-IP rate limiting (public endpoints)
 * - Different limits per plan tier
 * - Automatic fallback to in-memory if Redis unavailable
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

// In-memory rate limiter for development (when Redis not available)
class InMemoryRateLimiter {
  private requests: Map<string, { count: number; resetAt: number }> = new Map();

  async limit(identifier: string, limit: number, windowMs: number) {
    const now = Date.now();
    const key = identifier;
    const existing = this.requests.get(key);

    // Clean up expired entries
    if (existing && now > existing.resetAt) {
      this.requests.delete(key);
    }

    const current = this.requests.get(key);

    if (!current) {
      // First request in window
      this.requests.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });

      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + windowMs,
        pending: Promise.resolve(),
      };
    }

    if (current.count >= limit) {
      // Rate limit exceeded
      return {
        success: false,
        limit,
        remaining: 0,
        reset: current.resetAt,
        pending: Promise.resolve(),
      };
    }

    // Increment count
    current.count++;
    this.requests.set(key, current);

    return {
      success: true,
      limit,
      remaining: limit - current.count,
      reset: current.resetAt,
      pending: Promise.resolve(),
    };
  }
}

// Initialize rate limiters
let redis: Redis | null = null;
let rateLimiters: {
  free: Ratelimit | InMemoryRateLimiter;
  pro: Ratelimit | InMemoryRateLimiter;
  business: Ratelimit | InMemoryRateLimiter;
  enterprise: Ratelimit | InMemoryRateLimiter;
  public: Ratelimit | InMemoryRateLimiter;
} | null = null;

function initializeRateLimiters() {
  if (rateLimiters) return rateLimiters;

  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Try to use Upstash Redis if configured
  if (redisUrl && redisToken) {
    try {
      redis = new Redis({
        url: redisUrl,
        token: redisToken,
      });

      console.log("✅ Using Upstash Redis for rate limiting");

      rateLimiters = {
        // Free tier: 60 requests per minute
        free: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(60, "1 m"),
          analytics: true,
          prefix: "@ratelimit/free",
        }),

        // Pro tier: 300 requests per minute
        pro: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(300, "1 m"),
          analytics: true,
          prefix: "@ratelimit/pro",
        }),

        // Business tier: 1000 requests per minute
        business: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(1000, "1 m"),
          analytics: true,
          prefix: "@ratelimit/business",
        }),

        // Enterprise tier: Unlimited (high limit)
        enterprise: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(10000, "1 m"),
          analytics: true,
          prefix: "@ratelimit/enterprise",
        }),

        // Public endpoints: 20 requests per minute per IP
        public: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(20, "1 m"),
          analytics: true,
          prefix: "@ratelimit/public",
        }),
      };
    } catch (error) {
      console.warn("⚠️  Failed to initialize Upstash Redis, using in-memory rate limiting");
      redis = null;
    }
  }

  // Fallback to in-memory rate limiting for development
  if (!rateLimiters) {
    console.log("ℹ️  Using in-memory rate limiting (development only)");

    const inMemory = new InMemoryRateLimiter();

    rateLimiters = {
      free: inMemory,
      pro: inMemory,
      business: inMemory,
      enterprise: inMemory,
      public: inMemory,
    };
  }

  return rateLimiters;
}

/**
 * Get rate limiter for user's plan
 */
function getRateLimiterForPlan(plan: string = "FREE"): Ratelimit | InMemoryRateLimiter {
  const limiters = initializeRateLimiters();

  switch (plan.toUpperCase()) {
    case "PRO":
      return limiters.pro;
    case "BUSINESS":
      return limiters.business;
    case "ENTERPRISE":
      return limiters.enterprise;
    default:
      return limiters.free;
  }
}

/**
 * Rate limit middleware for authenticated endpoints
 * Uses user ID as identifier and plan-based limits
 */
export async function rateLimit(req: NextRequest): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  try {
    // Get user session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      // Not authenticated - use IP-based rate limiting
      return rateLimitPublic(req);
    }

    // Get user's plan
    const plan = (session.user as any).plan || "FREE";
    const limiter = getRateLimiterForPlan(plan);

    // Use user ID as identifier
    const identifier = `user:${session.user.id}`;

    // Check rate limit
    if (limiter instanceof InMemoryRateLimiter) {
      // In-memory limiter (development)
      const limits = {
        FREE: 60,
        PRO: 300,
        BUSINESS: 1000,
        ENTERPRISE: 10000,
      };

      return await limiter.limit(
        identifier,
        limits[plan as keyof typeof limits] || 60,
        60 * 1000 // 1 minute
      );
    } else {
      // Upstash limiter (production)
      const result = await limiter.limit(identifier);

      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    }
  } catch (error) {
    console.error("Rate limit error:", error);

    // On error, allow the request (fail open for better UX)
    return {
      success: true,
      limit: 60,
      remaining: 59,
      reset: Date.now() + 60000,
    };
  }
}

/**
 * Rate limit middleware for public endpoints
 * Uses IP address as identifier
 */
export async function rateLimitPublic(req: NextRequest): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  try {
    const limiters = initializeRateLimiters();
    const limiter = limiters.public;

    // Get IP address
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const identifier = `ip:${ip}`;

    // Check rate limit
    if (limiter instanceof InMemoryRateLimiter) {
      return await limiter.limit(identifier, 20, 60 * 1000);
    } else {
      const result = await limiter.limit(identifier);

      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    }
  } catch (error) {
    console.error("Public rate limit error:", error);

    // On error, allow the request
    return {
      success: true,
      limit: 20,
      remaining: 19,
      reset: Date.now() + 60000,
    };
  }
}

/**
 * Create rate limit response
 * Returns 429 Too Many Requests with headers
 */
export function createRateLimitResponse(result: {
  limit: number;
  remaining: number;
  reset: number;
}) {
  return NextResponse.json(
    {
      success: false,
      error: "Too many requests. Please try again later.",
      retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
      },
    }
  );
}

/**
 * Add rate limit headers to successful response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: {
    limit: number;
    remaining: number;
    reset: number;
  }
): NextResponse {
  response.headers.set("X-RateLimit-Limit", result.limit.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", result.reset.toString());

  return response;
}
