/**
 * AI Helper Functions
 * High-level AI features using the multi-provider service
 */

import { generateCompletion, generateEmbedding as generateEmbeddingBase } from "./ai";

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
- Short and memorable (5-10 characters)
- No special characters, only lowercase letters, numbers, and hyphens
- SEO-friendly and descriptive
- Related to content
- Easy to type and remember

Return ONLY the 3 slugs, one per line, nothing else.`;

    const response = await generateCompletion({
      messages: [
        {
          role: "system",
          content: "You are a URL slug generator. Generate short, memorable, SEO-friendly slugs. Output only the slugs, one per line.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      maxTokens: 100,
    });

    const slugs = response.content
      .split("\n")
      .map((s) => s.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""))
      .filter((s) => s.length >= 3 && s.length <= 15);

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
    const response = await generateEmbeddingBase({
      input: text,
    });

    return response.embeddings[0];
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

Format your response exactly like this:
Title: [your title here]
Description: [your description here]
Keywords: word1, word2, word3, word4, word5`;

    const response = await generateCompletion({
      messages: [
        {
          role: "system",
          content: "You are an SEO expert. Generate engaging, keyword-rich metadata in the specified format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 250,
    });

    const content = response.content;

    // Parse response
    const titleMatch = content.match(/Title:\s*(.+)/i);
    const descMatch = content.match(/Description:\s*(.+)/i);
    const keywordsMatch = content.match(/Keywords:\s*(.+)/i);

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

Return ONLY the category name, nothing else.`;

    const response = await generateCompletion({
      messages: [
        {
          role: "system",
          content: "You are a content categorization expert. Return only the category name.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      maxTokens: 20,
    });

    return response.content.trim().toLowerCase() || "other";
  } catch (error) {
    console.error("Error categorizing content:", error);
    return "other";
  }
}

/**
 * Analyze link for smart features
 */
export async function analyzeLinkContent(
  url: string,
  title?: string,
  description?: string
): Promise<{
  slugs: string[];
  category: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}> {
  try {
    // Run all analyses in parallel
    const [slugs, category, seo] = await Promise.all([
      generateSlugSuggestions(url, title, description),
      categorizeContent(url, title, description),
      generateSEOMetadata(url, description),
    ]);

    return { slugs, category, seo };
  } catch (error) {
    console.error("Error analyzing link content:", error);
    throw error;
  }
}

/**
 * Check for duplicate/similar content
 */
export async function checkDuplicate(
  url: string,
  title?: string,
  description?: string
): Promise<{
  isDuplicate: boolean;
  confidence: number;
  reasoning: string;
}> {
  try {
    const prompt = `Analyze if this URL appears to be a duplicate or very similar to common content:
URL: ${url}
${title ? `Title: ${title}` : ""}
${description ? `Description: ${description}` : ""}

Is this likely a duplicate, test, or placeholder link?
Respond in this format:
Duplicate: [yes/no]
Confidence: [0-100]
Reasoning: [brief explanation]`;

    const response = await generateCompletion({
      messages: [
        {
          role: "system",
          content: "You are a content analysis expert. Identify duplicate or placeholder content.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      maxTokens: 150,
    });

    const content = response.content;
    const duplicateMatch = content.match(/Duplicate:\s*(yes|no)/i);
    const confidenceMatch = content.match(/Confidence:\s*(\d+)/);
    const reasoningMatch = content.match(/Reasoning:\s*(.+)/i);

    return {
      isDuplicate: duplicateMatch?.[1].toLowerCase() === "yes",
      confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 50,
      reasoning: reasoningMatch?.[1].trim() || "Unknown",
    };
  } catch (error) {
    console.error("Error checking duplicate:", error);
    return {
      isDuplicate: false,
      confidence: 0,
      reasoning: "Error during analysis",
    };
  }
}
