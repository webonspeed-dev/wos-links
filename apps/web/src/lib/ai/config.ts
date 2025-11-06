/**
 * AI Service Configuration
 */

import type { AIProvider, AIProviderConfig } from "./types";

export const AI_CONFIG = {
  // Primary provider
  primaryProvider: "openrouter" as AIProvider,

  // Fallback order (tried in sequence if primary fails)
  fallbackProviders: ["anthropic", "gemini", "openai"] as AIProvider[],

  // Retry configuration
  maxRetries: 3,
  retryDelay: 1000, // Initial delay in ms
  retryMultiplier: 2, // Exponential backoff multiplier

  // Timeout configuration
  defaultTimeout: 30000, // 30 seconds

  // Model mappings (OpenRouter → Direct provider)
  modelMappings: {
    "anthropic/claude-3.5-sonnet": "claude-3-5-sonnet-20241022",
    "anthropic/claude-3-opus": "claude-3-opus-20240229",
    "google/gemini-pro": "gemini-1.5-pro",
    "openai/gpt-4-turbo": "gpt-4-turbo-preview",
    "openai/gpt-4": "gpt-4",
    "openai/gpt-3.5-turbo": "gpt-3.5-turbo",
  } as Record<string, string>,

  // Default models per provider
  defaultModels: {
    openrouter: "anthropic/claude-3.5-sonnet",
    anthropic: "claude-3-5-sonnet-20241022",
    gemini: "gemini-1.5-pro",
    openai: "gpt-4-turbo-preview",
  } as Record<AIProvider, string>,

  // Cost per 1M tokens (for tracking)
  costs: {
    "anthropic/claude-3.5-sonnet": { prompt: 3, completion: 15 },
    "anthropic/claude-3-opus": { prompt: 15, completion: 75 },
    "google/gemini-pro": { prompt: 0.5, completion: 1.5 },
    "openai/gpt-4-turbo": { prompt: 10, completion: 30 },
    "openai/gpt-4": { prompt: 30, completion: 60 },
    "openai/gpt-3.5-turbo": { prompt: 0.5, completion: 1.5 },
  } as Record<string, { prompt: number; completion: number }>,
};

export function getProviderConfig(provider: AIProvider): AIProviderConfig {
  const configs: Record<AIProvider, AIProviderConfig> = {
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY || "",
      baseUrl: "https://openrouter.ai/api/v1",
      defaultModel: AI_CONFIG.defaultModels.openrouter,
      timeout: AI_CONFIG.defaultTimeout,
      maxRetries: AI_CONFIG.maxRetries,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || "",
      baseUrl: "https://api.anthropic.com/v1",
      defaultModel: AI_CONFIG.defaultModels.anthropic,
      timeout: AI_CONFIG.defaultTimeout,
      maxRetries: AI_CONFIG.maxRetries,
    },
    gemini: {
      apiKey: process.env.GOOGLE_API_KEY || "",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      defaultModel: AI_CONFIG.defaultModels.gemini,
      timeout: AI_CONFIG.defaultTimeout,
      maxRetries: AI_CONFIG.maxRetries,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: AI_CONFIG.defaultModels.openai,
      timeout: AI_CONFIG.defaultTimeout,
      maxRetries: AI_CONFIG.maxRetries,
    },
  };

  return configs[provider];
}

export function isProviderAvailable(provider: AIProvider): boolean {
  const config = getProviderConfig(provider);
  return !!config.apiKey;
}

export function getAvailableProviders(): AIProvider[] {
  const all: AIProvider[] = ["openrouter", "anthropic", "gemini", "openai"];
  return all.filter(isProviderAvailable);
}

export function mapModelForProvider(model: string, provider: AIProvider): string {
  // If using OpenRouter, use as-is
  if (provider === "openrouter") {
    return model;
  }

  // Map OpenRouter model to direct provider model
  return AI_CONFIG.modelMappings[model] || model;
}

export function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const costs = AI_CONFIG.costs[model];
  if (!costs) return 0;

  const promptCost = (promptTokens / 1_000_000) * costs.prompt;
  const completionCost = (completionTokens / 1_000_000) * costs.completion;

  return promptCost + completionCost;
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRetryDelay(attempt: number): number {
  return AI_CONFIG.retryDelay * Math.pow(AI_CONFIG.retryMultiplier, attempt);
}
