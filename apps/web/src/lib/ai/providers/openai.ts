/**
 * OpenAI Provider
 * Direct OpenAI API integration (fallback + embeddings)
 */

import type {
  AIProviderInterface,
  AICompletionRequest,
  AICompletionResponse,
  AIEmbeddingRequest,
  AIEmbeddingResponse,
  AIProviderError,
} from "../types";
import { getProviderConfig, mapModelForProvider } from "../config";

export class OpenAIProvider implements AIProviderInterface {
  name = "openai" as const;
  private config = getProviderConfig("openai");

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }

  async completion(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.isAvailable()) {
      throw this.createError("OpenAI API key not configured", false);
    }

    const startTime = Date.now();
    const model = mapModelForProvider(
      request.model || this.config.defaultModel!,
      "openai"
    );

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
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
        provider: "openai",
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
    if (!this.isAvailable()) {
      throw this.createError("OpenAI API key not configured", false);
    }

    const model = request.model || "text-embedding-3-small";

    try {
      const response = await fetch(`${this.config.baseUrl}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          input: request.input,
        }),
        signal: AbortSignal.timeout(this.config.timeout || 30000),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw this.createError(
          error.error?.message || `HTTP ${response.status}`,
          response.status >= 500 || response.status === 429
        );
      }

      const data = await response.json();

      const embeddings = data.data.map((item: any) => item.embedding);

      return {
        embeddings,
        model: data.model,
        provider: "openai",
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw this.createError("Request timeout", true);
      }
      throw error;
    }
  }

  private createError(message: string, retryable: boolean): AIProviderError {
    const error: any = new Error(message);
    error.name = "AIProviderError";
    error.provider = this.name;
    error.retryable = retryable;
    return error as AIProviderError;
  }
}
