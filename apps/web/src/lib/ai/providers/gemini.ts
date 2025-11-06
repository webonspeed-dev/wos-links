/**
 * Google Gemini Provider
 * Direct Gemini API integration (fallback)
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

export class GeminiProvider implements AIProviderInterface {
  name = "gemini" as const;
  private config = getProviderConfig("gemini");

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }

  async completion(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.isAvailable()) {
      throw this.createError("Google API key not configured", false);
    }

    const startTime = Date.now();
    const model = mapModelForProvider(
      request.model || this.config.defaultModel!,
      "gemini"
    );

    try {
      // Convert messages to Gemini format
      const contents = this.convertMessagesToGemini(request.messages);

      const response = await fetch(
        `${this.config.baseUrl}/models/${model}:generateContent?key=${this.config.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: request.temperature ?? 0.7,
              maxOutputTokens: request.maxTokens ?? 1000,
            },
          }),
          signal: AbortSignal.timeout(this.config.timeout || 30000),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw this.createError(
          error.error?.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status >= 500 || response.status === 429
        );
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const promptTokens = data.usageMetadata?.promptTokenCount || 0;
      const completionTokens = data.usageMetadata?.candidatesTokenCount || 0;

      return {
        content,
        model,
        provider: "gemini",
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
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
      throw this.createError("Google API key not configured", false);
    }

    const model = "embedding-001";

    try {
      const inputs = Array.isArray(request.input) ? request.input : [request.input];
      const embeddings: number[][] = [];

      // Gemini requires individual requests for embeddings
      for (const input of inputs) {
        const response = await fetch(
          `${this.config.baseUrl}/models/${model}:embedContent?key=${this.config.apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: {
                parts: [{ text: input }],
              },
            }),
            signal: AbortSignal.timeout(this.config.timeout || 30000),
          }
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw this.createError(
            error.error?.message || `HTTP ${response.status}`,
            response.status >= 500 || response.status === 429
          );
        }

        const data = await response.json();
        embeddings.push(data.embedding?.values || []);
      }

      return {
        embeddings,
        model,
        provider: "gemini",
        usage: {
          promptTokens: inputs.reduce((sum, input) => sum + input.length / 4, 0),
          totalTokens: inputs.reduce((sum, input) => sum + input.length / 4, 0),
        },
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw this.createError("Request timeout", true);
      }
      throw error;
    }
  }

  private convertMessagesToGemini(messages: AICompletionRequest["messages"]) {
    const contents: any[] = [];
    let systemInstruction = "";

    for (const message of messages) {
      if (message.role === "system") {
        systemInstruction = message.content;
      } else {
        contents.push({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        });
      }
    }

    // Prepend system instruction to first user message
    if (systemInstruction && contents.length > 0 && contents[0].role === "user") {
      contents[0].parts[0].text = `${systemInstruction}\n\n${contents[0].parts[0].text}`;
    }

    return contents;
  }

  private createError(message: string, retryable: boolean): AIProviderError {
    const error: any = new Error(message);
    error.name = "AIProviderError";
    error.provider = this.name;
    error.retryable = retryable;
    return error as AIProviderError;
  }
}
