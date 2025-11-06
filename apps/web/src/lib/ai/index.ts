/**
 * AI Service
 * Multi-provider AI service with automatic fallback
 *
 * Primary: OpenRouter → Fallbacks: Anthropic, Gemini, OpenAI
 *
 * @example
 * ```ts
 * import { generateCompletion, generateEmbedding } from '@/lib/ai';
 *
 * const response = await generateCompletion({
 *   messages: [{ role: 'user', content: 'Hello!' }]
 * });
 *
 * const embeddings = await generateEmbedding({
 *   input: 'Some text to embed'
 * });
 * ```
 */

export * from "./types";
export * from "./config";
export * from "./client";

// Re-export main functions
export {
  generateCompletion,
  generateEmbedding,
  getAIStats,
  getAvailableProviders,
  testAIProviders,
} from "./client";
