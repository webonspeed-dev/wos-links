/**
 * Link Management Helper Functions
 * URL validation, short code generation, and link utilities
 */

import { z } from "zod";
import { prisma } from "@wos/database";
import { customAlphabet } from "nanoid";
import { analyzeLinkContent, generateEmbedding } from "./ai-helpers";

// Security configuration
const FORBIDDEN_SLUGS = [
  "api",
  "auth",
  "dashboard",
  "admin",
  "login",
  "signup",
  "signout",
  "settings",
  "billing",
  "404",
  "500",
  "static",
  "assets",
  "public",
  "next",
  "_next",
  "favicon",
  "robots",
  "sitemap",
];

// Custom nanoid alphabet (URL-safe, readable characters)
// Excludes confusing characters: 0, O, I, l
const nanoid = customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", 7);

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const createLinkSchema = z.object({
  destination: z.string().url("Invalid destination URL"),
  shortCode: z
    .string()
    .min(3, "Short code must be at least 3 characters")
    .max(50, "Short code must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Short code can only contain letters, numbers, hyphens, and underscores")
    .optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  domain: z.string().optional(),
  password: z.string().min(4).optional(),
  expiresAt: z.string().datetime().optional(),
  // UTM parameters
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
});

export const updateLinkSchema = z.object({
  destination: z.string().url("Invalid destination URL").optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  enabled: z.boolean().optional(),
  password: z.string().min(4).optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;

// ============================================
// SHORT CODE GENERATION
// ============================================

/**
 * Generate a unique short code
 * Attempts up to 5 times to find an available code
 */
export async function generateShortCode(domain: string = "wos.link"): Promise<string> {
  const maxAttempts = 5;

  for (let i = 0; i < maxAttempts; i++) {
    const code = nanoid();

    // Check if code is available
    const existing = await prisma.link.findUnique({
      where: {
        domain_shortCode: {
          domain,
          shortCode: code,
        },
      },
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error("Failed to generate unique short code. Please try again.");
}

/**
 * Validate custom short code
 * Checks against forbidden slugs and availability
 */
export async function validateShortCode(
  shortCode: string,
  domain: string = "wos.link"
): Promise<{ valid: boolean; error?: string }> {
  // Check forbidden slugs
  if (FORBIDDEN_SLUGS.includes(shortCode.toLowerCase())) {
    return {
      valid: false,
      error: "This short code is reserved and cannot be used",
    };
  }

  // Check format
  if (!/^[a-zA-Z0-9_-]+$/.test(shortCode)) {
    return {
      valid: false,
      error: "Short code can only contain letters, numbers, hyphens, and underscores",
    };
  }

  // Check length
  if (shortCode.length < 3 || shortCode.length > 50) {
    return {
      valid: false,
      error: "Short code must be between 3 and 50 characters",
    };
  }

  // Check availability
  const existing = await prisma.link.findUnique({
    where: {
      domain_shortCode: {
        domain,
        shortCode,
      },
    },
  });

  if (existing) {
    return {
      valid: false,
      error: "This short code is already taken",
    };
  }

  return { valid: true };
}

// ============================================
// LINK CREATION
// ============================================

/**
 * Create a new link with AI enhancements
 */
export async function createLink(userId: string, data: CreateLinkInput) {
  // Validate input
  const validated = createLinkSchema.parse(data);

  // Determine short code
  let shortCode = validated.shortCode;
  const domain = validated.domain || "wos.link";

  if (shortCode) {
    // Validate custom short code
    const validation = await validateShortCode(shortCode, domain);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
  } else {
    // Generate random short code
    shortCode = await generateShortCode(domain);
  }

  // Check user limits
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

  if (user.linksCreated >= user.linksLimit) {
    throw new Error(`You've reached your plan limit of ${user.linksLimit} links. Please upgrade your plan.`);
  }

  // AI enhancements (optional - gracefully handle failures)
  let aiData: {
    category?: string;
    embedding?: number[];
    metaTitle?: string;
    metaDescription?: string;
  } = {};

  try {
    // Analyze link content with AI
    const analysis = await analyzeLinkContent(
      validated.destination,
      validated.title,
      validated.description
    );

    aiData = {
      category: analysis.category,
      metaTitle: analysis.seo.title,
      metaDescription: analysis.seo.description,
    };

    // Generate embedding for semantic search
    if (validated.description || validated.title) {
      const embeddingResponse = await generateEmbedding({
        input: `${validated.title || ""} ${validated.description || ""}`,
      });

      if (embeddingResponse.embeddings.length > 0) {
        aiData.embedding = embeddingResponse.embeddings[0];
      }
    }
  } catch (aiError) {
    // AI features are optional - continue without them
    console.log("AI enhancement skipped:", aiError);
  }

  // Create link in database
  const link = await prisma.link.create({
    data: {
      shortCode,
      domain,
      destination: validated.destination,
      title: validated.title,
      description: validated.description,
      password: validated.password,
      expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
      utmSource: validated.utmSource,
      utmMedium: validated.utmMedium,
      utmCampaign: validated.utmCampaign,
      utmTerm: validated.utmTerm,
      utmContent: validated.utmContent,
      category: aiData.category,
      metaTitle: aiData.metaTitle,
      metaDescription: aiData.metaDescription,
      userId,
    },
  });

  // Increment user's link count
  await prisma.user.update({
    where: { id: userId },
    data: { linksCreated: { increment: 1 } },
  });

  return {
    ...link,
    shortUrl: `https://${link.domain}/${link.shortCode}`,
  };
}

// ============================================
// LINK RETRIEVAL
// ============================================

/**
 * Get user's links with analytics
 */
export async function getUserLinks(userId: string, options?: {
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const { limit = 50, offset = 0, search } = options || {};

  const where = {
    userId,
    ...(search && {
      OR: [
        { shortCode: { contains: search, mode: "insensitive" as const } },
        { destination: { contains: search, mode: "insensitive" as const } },
        { title: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [links, total] = await Promise.all([
    prisma.link.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: {
            clicks: true,
            conversions: true,
          },
        },
      },
    }),
    prisma.link.count({ where }),
  ]);

  // Add short URLs
  const linksWithUrls = links.map((link) => ({
    ...link,
    shortUrl: `https://${link.domain}/${link.shortCode}`,
    clicks: link._count.clicks,
    conversions: link._count.conversions,
  }));

  return {
    links: linksWithUrls,
    total,
    hasMore: offset + links.length < total,
  };
}

/**
 * Get link by ID (with ownership check)
 */
export async function getLinkById(linkId: string, userId: string) {
  const link = await prisma.link.findFirst({
    where: {
      id: linkId,
      userId, // Ensure user owns the link
    },
    include: {
      _count: {
        select: {
          clicks: true,
          conversions: true,
        },
      },
    },
  });

  if (!link) {
    return null;
  }

  return {
    ...link,
    shortUrl: `https://${link.domain}/${link.shortCode}`,
    clicks: link._count.clicks,
    conversions: link._count.conversions,
  };
}

/**
 * Get link by short code (for redirects - no auth required)
 */
export async function getLinkByShortCode(shortCode: string, domain: string = "wos.link") {
  return prisma.link.findUnique({
    where: {
      domain_shortCode: {
        domain,
        shortCode,
      },
      enabled: true,
    },
  });
}

// ============================================
// LINK UPDATES
// ============================================

/**
 * Update link (with ownership check)
 */
export async function updateLink(linkId: string, userId: string, data: UpdateLinkInput) {
  // Validate input
  const validated = updateLinkSchema.parse(data);

  // Verify ownership
  const existing = await getLinkById(linkId, userId);
  if (!existing) {
    throw new Error("Link not found or you don't have permission to edit it");
  }

  // Update link
  const updated = await prisma.link.update({
    where: { id: linkId },
    data: validated,
  });

  return {
    ...updated,
    shortUrl: `https://${updated.domain}/${updated.shortCode}`,
  };
}

/**
 * Delete link (with ownership check)
 */
export async function deleteLink(linkId: string, userId: string) {
  // Verify ownership
  const existing = await getLinkById(linkId, userId);
  if (!existing) {
    throw new Error("Link not found or you don't have permission to delete it");
  }

  // Delete link (cascade deletes clicks and conversions)
  await prisma.link.delete({
    where: { id: linkId },
  });

  // Decrement user's link count
  await prisma.user.update({
    where: { id: userId },
    data: { linksCreated: { decrement: 1 } },
  });

  return { success: true };
}

// ============================================
// UTILITIES
// ============================================

/**
 * Check if URL is safe (not phishing, malware, etc.)
 * Basic implementation - can be enhanced with external services
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Block certain schemes
    const dangerousSchemes = ["javascript:", "data:", "file:", "vbscript:"];
    if (dangerousSchemes.some((scheme) => parsed.protocol.startsWith(scheme))) {
      return false;
    }

    // Additional checks can be added here
    // - Check against known malicious domains
    // - Use Google Safe Browsing API
    // - Check URL shortener domains to prevent nested shortening

    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize URL (add protocol if missing, remove tracking parameters, etc.)
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim();

  // Add protocol if missing
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  return normalized;
}
