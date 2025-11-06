/**
 * Anthropic Provider
 * Direct Claude API integration (fallback)
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

export class AnthropicProvider implements AIProviderInterface {
  name = "anthropic" as const;
  private config = getProviderConfig("anthropic");

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }

  async completion(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.isAvailable()) {
      throw this.createError("Anthropic API key not configured", false);
    }

    const startTime = Date.now();
    const model = mapModelForProvider(
      request.model || this.config.defaultModel!,
      "anthropic"
    );

    try {
      // Separate system message from user messages
      const systemMessage = request.messages.find((m) => m.role === "system");
      const messages = request.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch(`${this.config.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          messages,
          system: systemMessage?.content,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 1000,
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
        content: data.content[0]?.text || "",
        model: data.model,
        provider: "anthropic",
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
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
    // Anthropic doesn't support embeddings
    throw this.createError("Anthropic does not support embeddings", false);
  }

  private createError(message: string, retryable: boolean): AIProviderError {
    const error: any = new Error(message);
    error.name = "AIProviderError";
    error.provider = this.name;
    error.retryable = retryable;
    return error as AIProviderError;
  }
}
