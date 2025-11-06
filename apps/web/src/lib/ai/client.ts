/**
 * AI Client with Multi-Provider Fallback
 * Primary: OpenRouter → Fallbacks: Anthropic, Gemini, OpenAI
 */

import type {
  AIProvider,
  AIProviderInterface,
  AICompletionRequest,
  AICompletionResponse,
  AIEmbeddingRequest,
  AIEmbeddingResponse,
  AIProviderError,
  AIServiceStats,
} from "./types";
import { AI_CONFIG, getRetryDelay, sleep, calculateCost } from "./config";
import { OpenRouterProvider } from "./providers/openrouter";
import { AnthropicProvider } from "./providers/anthropic";
import { GeminiProvider } from "./providers/gemini";
import { OpenAIProvider } from "./providers/openai";

class AIService {
  private providers: Map<AIProvider, AIProviderInterface>;
  private stats: AIServiceStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    fallbackUsed: 0,
    providerUsage: {
      openrouter: 0,
      anthropic: 0,
      gemini: 0,
      openai: 0,
    },
    averageLatency: 0,
    totalCost: 0,
  };

  constructor() {
    this.providers = new Map([
      ["openrouter", new OpenRouterProvider()],
      ["anthropic", new AnthropicProvider()],
      ["gemini", new GeminiProvider()],
      ["openai", new OpenAIProvider()],
    ]);
  }

  /**
   * Get text completion with automatic fallback
   */
  async completion(request: AICompletionRequest): Promise<AICompletionResponse> {
    this.stats.totalRequests++;

    // Try primary provider first
    const primary = AI_CONFIG.primaryProvider;

    try {
      const result = await this.tryProvider(primary, "completion", request);
      this.recordSuccess(result);
      return result;
    } catch (error) {
      console.warn(`Primary provider (${primary}) failed:`, error);

      // Try fallback providers in order
      for (const fallbackProvider of AI_CONFIG.fallbackProviders) {
        try {
          console.log(`Attempting fallback to ${fallbackProvider}...`);
          const result = await this.tryProvider(fallbackProvider, "completion", request);
          this.recordSuccess(result, true);
          return result;
        } catch (fallbackError) {
          console.warn(`Fallback provider (${fallbackProvider}) failed:`, fallbackError);
          continue;
        }
      }

      // All providers failed
      this.stats.failedRequests++;
      throw new Error("All AI providers failed. Please check your API keys and try again.");
    }
  }

  /**
   * Get embeddings (uses OpenAI or Gemini)
   */
  async embedding(request: AIEmbeddingRequest): Promise<AIEmbeddingResponse> {
    this.stats.totalRequests++;

    // Try OpenAI first (best embedding quality)
    const embeddingProviders: AIProvider[] = ["openai", "gemini"];

    for (const provider of embeddingProviders) {
      try {
        const providerInstance = this.providers.get(provider);
        if (!providerInstance?.isAvailable()) {
          continue;
        }

        const result = await providerInstance.embedding(request);
        this.recordEmbeddingSuccess(result);
        return result;
      } catch (error) {
        console.warn(`Embedding provider (${provider}) failed:`, error);
        continue;
      }
    }

    // All providers failed
    this.stats.failedRequests++;
    throw new Error("All embedding providers failed. Please check your API keys.");
  }

  /**
   * Try a provider with retry logic
   */
  private async tryProvider(
    providerName: AIProvider,
    method: "completion" | "embedding",
    request: any
  ): Promise<any> {
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    if (!provider.isAvailable()) {
      throw new Error(`Provider ${providerName} is not available (missing API key)`);
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= AI_CONFIG.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = getRetryDelay(attempt - 1);
          console.log(`Retry attempt ${attempt} for ${providerName} after ${delay}ms`);
          await sleep(delay);
        }

        const result = await provider[method](request);
        return result;
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        const isRetryable = (error as any).retryable !== false;

        if (!isRetryable || attempt === AI_CONFIG.maxRetries) {
          throw error;
        }

        console.warn(
          `Attempt ${attempt + 1}/${AI_CONFIG.maxRetries + 1} failed for ${providerName}:`,
          error
        );
      }
    }

    throw lastError || new Error(`Failed after ${AI_CONFIG.maxRetries} retries`);
  }

  /**
   * Record successful completion
   */
  private recordSuccess(response: AICompletionResponse, isFallback: boolean = false) {
    this.stats.successfulRequests++;
    this.stats.providerUsage[response.provider]++;

    if (isFallback) {
      this.stats.fallbackUsed++;
    }

    // Update average latency
    const totalLatency = this.stats.averageLatency * (this.stats.successfulRequests - 1);
    this.stats.averageLatency = (totalLatency + response.latency) / this.stats.successfulRequests;

    // Calculate cost
    const cost = calculateCost(
      response.model,
      response.usage.promptTokens,
      response.usage.completionTokens
    );
    this.stats.totalCost += cost;
  }

  /**
   * Record successful embedding
   */
  private recordEmbeddingSuccess(response: AIEmbeddingResponse) {
    this.stats.successfulRequests++;
    this.stats.providerUsage[response.provider]++;

    // Embedding cost (rough estimate)
    const cost = calculateCost(response.model, response.usage.promptTokens, 0);
    this.stats.totalCost += cost;
  }

  /**
   * Get service statistics
   */
  getStats(): AIServiceStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      fallbackUsed: 0,
      providerUsage: {
        openrouter: 0,
        anthropic: 0,
        gemini: 0,
        openai: 0,
      },
      averageLatency: 0,
      totalCost: 0,
    };
  }

  /**
   * Check provider availability
   */
  getAvailableProviders(): AIProvider[] {
    const available: AIProvider[] = [];

    for (const [name, provider] of this.providers.entries()) {
      if (provider.isAvailable()) {
        available.push(name);
      }
    }

    return available;
  }

  /**
   * Test all providers
   */
  async testProviders(): Promise<Record<AIProvider, boolean>> {
    const results: Record<AIProvider, boolean> = {
      openrouter: false,
      anthropic: false,
      gemini: false,
      openai: false,
    };

    const testRequest: AICompletionRequest = {
      messages: [
        {
          role: "user",
          content: "Say 'test successful' and nothing else.",
        },
      ],
      maxTokens: 10,
    };

    for (const [name, provider] of this.providers.entries()) {
      if (!provider.isAvailable()) {
        continue;
      }

      try {
        await provider.completion(testRequest);
        results[name] = true;
      } catch (error) {
        console.warn(`Provider ${name} test failed:`, error);
        results[name] = false;
      }
    }

    return results;
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export convenience functions
export async function generateCompletion(request: AICompletionRequest) {
  return aiService.completion(request);
}

export async function generateEmbedding(request: AIEmbeddingRequest) {
  return aiService.embedding(request);
}

export function getAIStats() {
  return aiService.getStats();
}

export function getAvailableProviders() {
  return aiService.getAvailableProviders();
}

export async function testAIProviders() {
  return aiService.testProviders();
}
