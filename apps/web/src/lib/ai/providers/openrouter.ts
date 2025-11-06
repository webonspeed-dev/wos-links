/**
 * OpenRouter Provider
 * Primary AI provider supporting multiple models
 */

import type {
  AIProviderInterface,
  AICompletionRequest,
  AICompletionResponse,
  AIEmbeddingRequest,
  AIEmbeddingResponse,
  AIProviderError,
} from "../types";
import { getProviderConfig } from "../config";

export class OpenRouterProvider implements AIProviderInterface {
  name = "openrouter" as const;
  private config = getProviderConfig("openrouter");

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }

  async completion(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.isAvailable()) {
      throw this.createError("OpenRouter API key not configured", false);
    }

    const startTime = Date.now();

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://wos.link",
          "X-Title": "WOS Links",
        },
        body: JSON.stringify({
          model: request.model || this.config.defaultModel,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 1000,
          stream: false,
        }),
        signal: AbortSignal.timeout(this.config.timeout || 30000),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw this.createError(
          error.error?.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status >= 500 || response.status === 429
        );
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      return {
        content: data.choices[0]?.message?.content || "",
        model: data.model,
        provider: "openrouter",
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        latency,
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw this.createError("Request timeout", true);
      }
      throw error;
    }
  }

  async embedding(request: AIEmbeddingRequest): Promise<AIEmbeddingResponse> {
    // OpenRouter doesn't support embeddings directly
    // This would need to be routed through OpenAI
    throw this.createError("OpenRouter does not support embeddings", false);
  }

  private createError(message: string, retryable: boolean): AIProviderError {
    const error: any = new Error(message);
    error.name = "AIProviderError";
    error.provider = this.name;
    error.retryable = retryable;
    return error as AIProviderError;
  }
}
