// Shared types across WOS Links platform

export interface CreateLinkRequest {
  destination: string;
  shortCode?: string; // Optional: let AI generate if not provided
  customDomain?: string;
  title?: string;
  description?: string;
  password?: string;
  expiresAt?: Date;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export interface CreateLinkResponse {
  id: string;
  shortCode: string;
  shortUrl: string;
  destination: string;
  aiSuggestions?: string[]; // AI-generated alternative slugs
}

export interface LinkAnalytics {
  totalClicks: number;
  uniqueClicks: number;
  clicksByCountry: Record<string, number>;
  clicksByDevice: Record<string, number>;
  clicksByReferrer: Record<string, number>;
  conversionRate: number;
  totalRevenue: number;
}

export interface AISlugSuggestion {
  slug: string;
  confidence: number;
  reason: string;
}

export interface SemanticDuplicate {
  id: string;
  shortCode: string;
  destination: string;
  similarity: number;
}

export interface SmartRoutingRule {
  type: "geo" | "device" | "time" | "referrer";
  condition: string;
  destination: string;
}

// Edge script types
export interface EdgeRedirectRequest {
  shortCode: string;
  domain: string;
  headers: Record<string, string>;
  ip: string;
  userAgent: string;
}

export interface EdgeRedirectResponse {
  destination: string;
  statusCode: 301 | 302 | 307 | 308;
  tracking: {
    linkId: string;
    timestamp: number;
    fingerprint: string;
  };
}
