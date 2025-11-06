/**
 * AI Services Module
 * Handles all AI-powered features using OpenAI
 */

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate smart URL slug suggestions
 */
export async function generateSlugSuggestions(
  url: string,
  title?: string,
  description?: string
): Promise<string[]> {
  try {
    const prompt = `Generate 3 short, memorable, SEO-friendly URL slugs (5-10 characters) for:
URL: ${url}
${title ? `Title: ${title}` : ""}
${description ? `Description: ${description}` : ""}

Requirements:
- Short and memorable
- No special characters
- SEO-friendly
- Related to content
- Easy to type

Return only the 3 slugs, one per line.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a URL slug generator. Generate short, memorable slugs.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content || "";
    const slugs = content
      .split("\n")
      .map((s) => s.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""))
      .filter((s) => s.length > 0);

    return slugs.slice(0, 3);
  } catch (error) {
    console.error("Error generating slug suggestions:", error);
    return [];
  }
}

/**
 * Generate vector embedding for semantic search
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // 1536 dimensions, $0.02/1M tokens
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

/**
 * Generate SEO metadata for a URL
 */
export async function generateSEOMetadata(
  url: string,
  pageContent?: string
): Promise<{
  title: string;
  description: string;
  keywords: string[];
}> {
  try {
    const prompt = `Generate SEO metadata for this URL:
URL: ${url}
${pageContent ? `Content: ${pageContent.slice(0, 500)}` : ""}

Generate:
1. An engaging meta title (50-60 chars)
2. A compelling meta description (150-160 chars)
3. 5 relevant keywords

Format:
Title: ...
Description: ...
Keywords: word1, word2, word3, word4, word5`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an SEO expert. Generate engaging, keyword-rich metadata.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const content = response.choices[0].message.content || "";

    // Parse response
    const titleMatch = content.match(/Title:\s*(.+)/);
    const descMatch = content.match(/Description:\s*(.+)/);
    const keywordsMatch = content.match(/Keywords:\s*(.+)/);

    return {
      title: titleMatch ? titleMatch[1].trim() : "",
      description: descMatch ? descMatch[1].trim() : "",
      keywords: keywordsMatch
        ? keywordsMatch[1].split(",").map((k) => k.trim())
        : [],
    };
  } catch (error) {
    console.error("Error generating SEO metadata:", error);
    throw error;
  }
}

/**
 * Categorize a URL/content
 */
export async function categorizeContent(
  url: string,
  title?: string,
  description?: string
): Promise<string> {
  try {
    const prompt = `Categorize this URL into ONE category:
URL: ${url}
${title ? `Title: ${title}` : ""}
${description ? `Description: ${description}` : ""}

Categories:
- product
- blog
- video
- documentation
- landing-page
- social
- news
- portfolio
- ecommerce
- saas
- other

Return only the category name.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a content categorization expert.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 20,
    });

    return response.choices[0].message.content?.trim().toLowerCase() || "other";
  } catch (error) {
    console.error("Error categorizing content:", error);
    return "other";
  }
}

/**
 * Find semantically similar links using embeddings
 */
export async function findSimilarLinks(
  embedding: number[],
  userId: string,
  limit: number = 5
): Promise<any[]> {
  // This would use pgvector in the database
  // Implementation would be in a database query
  // Example is in ARCHITECTURE.md
  return [];
}

/**
 * Calculate AI feature costs
 */
export function calculateAICosts(operations: {
  slugSuggestions?: number;
  embeddings?: number;
  seoGeneration?: number;
  categorization?: number;
}): number {
  const costs = {
    slugSuggestions: 0.0001, // GPT-4: ~$0.0001 per call
    embeddings: 0.00001, // text-embedding-3-small: ~$0.00001 per call
    seoGeneration: 0.0001, // GPT-4: ~$0.0001 per call
    categorization: 0.00005, // GPT-4 (fewer tokens): ~$0.00005 per call
  };

  let totalCost = 0;
  for (const [key, count] of Object.entries(operations)) {
    totalCost += (costs[key as keyof typeof costs] || 0) * count;
  }

  return totalCost;
}
