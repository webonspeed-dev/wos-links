# WOS Links AI Service

Multi-provider AI service with automatic fallback for maximum reliability.

## Architecture

```
Primary: OpenRouter
    ↓ (if fails)
Fallback 1: Anthropic
    ↓ (if fails)
Fallback 2: Gemini
    ↓ (if fails)
Fallback 3: OpenAI
```

## Features

- ✅ **Automatic Fallback**: Seamlessly switches providers on failure
- ✅ **Retry Logic**: Exponential backoff for transient errors
- ✅ **Cost Tracking**: Monitor API usage and costs
- ✅ **Usage Stats**: Track provider usage and performance
- ✅ **Model Mapping**: Automatically maps models across providers
- ✅ **Type-Safe**: Full TypeScript support

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure API Keys

Add your API keys to `.env.local`:

```env
# Primary provider (supports all models)
OPENROUTER_API_KEY="sk-or-v1-..."

# Fallback providers (optional but recommended)
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_API_KEY="AIza..."
OPENAI_API_KEY="sk-..."
```

**Note:** You need at least ONE API key for the service to work. More keys = better reliability.

### 3. Test Providers

```bash
# Run a test to check which providers are working
pnpm test:ai
```

## Usage

### Basic Completion

```typescript
import { generateCompletion } from '@/lib/ai';

const response = await generateCompletion({
  messages: [
    { role: 'user', content: 'Generate 3 URL slugs for a summer sale' }
  ],
  temperature: 0.8,
  maxTokens: 100
});

console.log(response.content);
console.log(`Used: ${response.provider} - ${response.model}`);
console.log(`Latency: ${response.latency}ms`);
```

### Generate Embeddings

```typescript
import { generateEmbedding } from '@/lib/ai';

const response = await generateEmbedding({
  input: 'Text to embed for semantic search'
});

console.log(response.embeddings[0]); // [0.123, 0.456, ...]
```

### High-Level Helpers

```typescript
import {
  generateSlugSuggestions,
  generateSEOMetadata,
  categorizeContent,
  analyzeLinkContent,
} from '@/lib/ai-helpers';

// Generate smart URL slugs
const slugs = await generateSlugSuggestions(
  'https://example.com/products/wireless-headphones',
  'Premium Wireless Headphones',
  'High-quality audio with noise cancellation'
);
// Returns: ['headphones', 'wireless', 'audio']

// Generate SEO metadata
const seo = await generateSEOMetadata(
  'https://example.com/blog/ai-marketing'
);
// Returns: { title: '...', description: '...', keywords: [...] }

// Categorize content
const category = await categorizeContent(
  'https://example.com/product/...'
);
// Returns: 'ecommerce'

// Complete analysis (runs all in parallel)
const analysis = await analyzeLinkContent(
  'https://example.com/...',
  'Title',
  'Description'
);
// Returns: { slugs, category, seo }
```

## Provider Configuration

### Model Selection

```typescript
// Use specific model
const response = await generateCompletion({
  model: 'anthropic/claude-3.5-sonnet', // OpenRouter model
  messages: [...]
});

// Model is automatically mapped to direct provider on fallback
// anthropic/claude-3.5-sonnet → claude-3-5-sonnet-20241022 (on Anthropic)
```

### Available Models

**Via OpenRouter (Primary):**
- `anthropic/claude-3.5-sonnet` - Best quality
- `anthropic/claude-3-opus` - Most capable
- `google/gemini-pro` - Fast & cheap
- `openai/gpt-4-turbo` - GPT-4 Turbo
- `openai/gpt-4` - GPT-4
- `openai/gpt-3.5-turbo` - Cheap & fast

**Direct (Fallbacks):**
- `claude-3-5-sonnet-20241022`
- `gemini-1.5-pro`
- `gpt-4-turbo-preview`

## Monitoring

### Get Statistics

```typescript
import { getAIStats } from '@/lib/ai';

const stats = getAIStats();
console.log(stats);
// {
//   totalRequests: 150,
//   successfulRequests: 148,
//   failedRequests: 2,
//   fallbackUsed: 3,
//   providerUsage: {
//     openrouter: 145,
//     anthropic: 3,
//     gemini: 0,
//     openai: 0
//   },
//   averageLatency: 1234,
//   totalCost: 0.045
// }
```

### Check Available Providers

```typescript
import { getAvailableProviders } from '@/lib/ai';

const providers = getAvailableProviders();
console.log(providers); // ['openrouter', 'anthropic', 'openai']
```

### Test All Providers

```typescript
import { testAIProviders } from '@/lib/ai';

const results = await testAIProviders();
console.log(results);
// {
//   openrouter: true,
//   anthropic: true,
//   gemini: false,
//   openai: true
// }
```

## Error Handling

The service automatically handles errors and retries:

```typescript
try {
  const response = await generateCompletion({
    messages: [{ role: 'user', content: 'Hello!' }]
  });
} catch (error) {
  // Only throws if ALL providers fail
  console.error('All AI providers failed:', error);
}
```

### Error Types

- **`AIProviderError`**: Provider-specific error with retry info
  - `error.provider`: Which provider failed
  - `error.retryable`: Whether error is retryable
  - `error.originalError`: Original error object

## Configuration

Edit `/apps/web/src/lib/ai/config.ts`:

```typescript
export const AI_CONFIG = {
  primaryProvider: "openrouter",
  fallbackProviders: ["anthropic", "gemini", "openai"],
  maxRetries: 3,
  retryDelay: 1000,
  retryMultiplier: 2,
  defaultTimeout: 30000,
  // ...
};
```

## Cost Optimization

### Model Selection

```typescript
// Most expensive (best quality)
model: 'anthropic/claude-3-opus'

// Balanced (recommended)
model: 'anthropic/claude-3.5-sonnet'

// Cheapest
model: 'google/gemini-pro'
model: 'openai/gpt-3.5-turbo'
```

### Temperature & Tokens

```typescript
// More creative (costs more)
temperature: 0.9
maxTokens: 2000

// More focused (costs less)
temperature: 0.3
maxTokens: 500
```

## Best Practices

1. **Always handle errors gracefully**
   ```typescript
   const slugs = await generateSlugSuggestions(...).catch(() => []);
   ```

2. **Use appropriate models for tasks**
   - Simple tasks: gemini-pro, gpt-3.5-turbo
   - Complex tasks: claude-3.5-sonnet, gpt-4

3. **Limit token usage**
   - Only send necessary context
   - Use lower maxTokens for simple responses

4. **Monitor costs**
   ```typescript
   const stats = getAIStats();
   console.log(`Total cost: $${stats.totalCost.toFixed(4)}`);
   ```

5. **Set up all providers**
   - More providers = better reliability
   - OpenRouter covers most use cases
   - OpenAI needed for embeddings

## Troubleshooting

### "All AI providers failed"

**Solution:** Check your API keys are valid

```bash
# Test providers
curl http://localhost:3000/api/test-ai
```

### "Provider not available"

**Solution:** Add API key to `.env.local`

### Slow responses

**Solution:**
- Use faster models (gemini-pro, gpt-3.5-turbo)
- Reduce maxTokens
- Check network connectivity

### High costs

**Solution:**
- Use cheaper models for simple tasks
- Cache responses when possible
- Reduce maxTokens
- Lower temperature

## Examples

### Create Smart Link

```typescript
import { analyzeLinkContent } from '@/lib/ai-helpers';

async function createSmartLink(destination: string) {
  // Get AI analysis
  const analysis = await analyzeLinkContent(destination);

  // Create link with AI suggestions
  const link = await db.link.create({
    data: {
      destination,
      shortCode: analysis.slugs[0],
      category: analysis.category,
      metaTitle: analysis.seo.title,
      metaDescription: analysis.seo.description,
      // Generate embedding for semantic search
      embedding: await generateEmbedding(
        `${analysis.seo.title} ${analysis.seo.description}`
      ),
    }
  });

  return link;
}
```

### Find Similar Links

```typescript
import { generateEmbedding } from '@/lib/ai';

async function findSimilarLinks(query: string, userId: string) {
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // Search using pgvector
  const similar = await db.$queryRaw`
    SELECT id, short_code, destination,
           1 - (embedding <=> ${queryEmbedding}::vector) as similarity
    FROM links
    WHERE user_id = ${userId}
      AND 1 - (embedding <=> ${queryEmbedding}::vector) > 0.85
    ORDER BY similarity DESC
    LIMIT 10
  `;

  return similar;
}
```

## Support

For issues or questions:
1. Check this README
2. Review `ARCHITECTURE.md`
3. Check provider status pages
4. Open an issue on GitHub

## License

MIT
