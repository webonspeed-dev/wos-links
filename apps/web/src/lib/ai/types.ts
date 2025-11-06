/**
 * AI Service Types
 * Defines interfaces for multi-provider AI system
 */

export type AIProvider = "openrouter" | "anthropic" | "gemini" | "openai";

export type AIModel =
  // OpenRouter models (supports all)
  | "anthropic/claude-3.5-sonnet"
  | "anthropic/claude-3-opus"
  | "google/gemini-pro"
  | "openai/gpt-4-turbo"
  | "openai/gpt-4"
  | "openai/gpt-3.5-turbo"
  // Direct provider models (fallbacks)
  | "claude-3-5-sonnet-20241022"
  | "claude-3-opus-20240229"
  | "gemini-1.5-pro"
  | "gemini-1.5-flash"
  | "gpt-4-turbo-preview"
  | "gpt-4"
  | "gpt-3.5-turbo";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string;
  model: string;
  provider: AIProvider;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latency: number;
}

export interface AIEmbeddingRequest {
  input: string | string[];
  model?: string;
}

export interface AIEmbeddingResponse {
  embeddings: number[][];
  model: string;
  provider: AIProvider;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface AIProviderInterface {
  name: AIProvider;
  isAvailable: () => boolean;
  completion: (request: AICompletionRequest) => Promise<AICompletionResponse>;
  embedding: (request: AIEmbeddingRequest) => Promise<AIEmbeddingResponse>;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public provider: AIProvider,
    public originalError?: Error,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

export interface AIServiceStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  fallbackUsed: number;
  providerUsage: Record<AIProvider, number>;
  averageLatency: number;
  totalCost: number;
}
