# WOS Links Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Web Dashboard (Next.js)  │  API Clients  │  Mobile Apps    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       EDGE LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  Bunny CDN Edge Scripts (100+ global locations)            │
│  • Sub-10ms redirects                                       │
│  • Edge KV store                                            │
│  • Bot detection                                            │
│  • Smart routing                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  Next.js API Routes                                         │
│  • Link management                                          │
│  • Analytics processing                                     │
│  • User authentication                                      │
│  • Payment processing                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      AI LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  OpenAI GPT-4           │  text-embedding-3-small           │
│  • Slug suggestions     │  • Vector embeddings              │
│  • SEO optimization     │  • Semantic search                │
│  • Content analysis     │  • Duplicate detection            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL + pgvector  │  Redis                            │
│  • Primary data store   │  • Session cache                  │
│  • Vector search        │  • Rate limiting                  │
│  • ACID compliance      │  • Analytics buffer               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Link Creation Flow

```
User creates link → Next.js API → Generate AI slug suggestions
                                 ↓
                         Generate embeddings (OpenAI)
                                 ↓
                         Check semantic duplicates (pgvector)
                                 ↓
                         Save to PostgreSQL
                                 ↓
                         Sync to Edge KV (Bunny CDN)
                                 ↓
                         Return short URL to user
```

### 2. Redirect Flow (Edge-First)

```
User clicks short link → Bunny CDN Edge Script
                              ↓
                         Lookup in Edge KV (<5ms)
                              ↓
                         Apply smart routing rules
                              ↓
                         Track click (async, fire & forget)
                              ↓
                         Redirect to destination (<10ms total)
                              ↓
                         Analytics processed in background
```

### 3. Analytics Flow

```
Click tracked at edge → Sent to analytics API (async)
                              ↓
                         Enriched with geo data
                              ↓
                         Bot detection
                              ↓
                         Device fingerprinting
                              ↓
                         Saved to PostgreSQL
                              ↓
                         Redis cache invalidated
                              ↓
                         Real-time dashboard updated
```

## Database Schema

### Core Tables

1. **users** - User accounts & subscriptions
2. **links** - Short links with embeddings
3. **clicks** - Click analytics
4. **conversions** - Revenue attribution
5. **custom_domains** - White-label domains
6. **api_keys** - API access management

### Vector Search

```sql
-- Links with vector embeddings
CREATE TABLE links (
  id TEXT PRIMARY KEY,
  short_code TEXT UNIQUE,
  destination TEXT,
  embedding vector(1536),  -- OpenAI text-embedding-3-small
  ...
);

-- Vector similarity index
CREATE INDEX links_embedding_idx
ON links USING ivfflat (embedding vector_cosine_ops);

-- Semantic search query
SELECT id, short_code, destination,
       1 - (embedding <=> $1::vector) as similarity
FROM links
WHERE user_id = $2
  AND 1 - (embedding <=> $1::vector) > 0.85
ORDER BY similarity DESC
LIMIT 10;
```

## Edge Architecture

### Why Edge-First?

Traditional approach (slow):
```
User → DNS → Load Balancer → API Server → Database → Redirect
Latency: 50-200ms
```

Edge approach (fast):
```
User → Edge → KV Lookup → Redirect
Latency: <10ms
```

### Edge KV Structure

```javascript
// Key pattern: link:${shortCode}
{
  "id": "link_abc123",
  "destination": "https://example.com/page",
  "enabled": true,
  "expiresAt": null,
  "routingRules": [
    {
      "type": "geo",
      "condition": "US",
      "destination": "https://example.com/us"
    }
  ]
}
```

### Syncing Database to Edge

```typescript
// When link created/updated
async function syncToEdge(link: Link) {
  await bunnyKV.put(`link:${link.shortCode}`, {
    id: link.id,
    destination: link.destination,
    enabled: link.enabled,
    expiresAt: link.expiresAt,
    routingRules: link.routingRules,
  });
}

// Periodic full sync (every 5 minutes)
async function fullSync() {
  const links = await db.link.findMany({
    where: { enabled: true }
  });

  for (const link of links) {
    await syncToEdge(link);
  }
}
```

## AI Architecture

### 1. Slug Generation

```typescript
// Use GPT-4 for creative slug suggestions
const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{
    role: "system",
    content: "Generate 3 short (5-10 char), memorable URL slugs"
  }, {
    role: "user",
    content: `URL: ${url}\nTitle: ${title}`
  }],
  temperature: 0.8,  // More creative
  max_tokens: 100
});
```

### 2. Embedding Generation

```typescript
// Generate vector embedding
const response = await openai.embeddings.create({
  model: "text-embedding-3-small",  // 1536 dimensions, $0.02/1M tokens
  input: `${destination} ${title} ${description}`
});

const embedding = response.data[0].embedding;

// Store in PostgreSQL with pgvector
await db.link.create({
  data: {
    ...linkData,
    embedding: `[${embedding.join(',')}]`  // Array to pgvector
  }
});
```

### 3. Semantic Search

```typescript
// Find similar links
async function findSimilarLinks(query: string, userId: string) {
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // Vector similarity search
  const similar = await db.$queryRaw`
    SELECT
      id,
      short_code,
      destination,
      1 - (embedding <=> ${queryEmbedding}::vector) as similarity
    FROM links
    WHERE user_id = ${userId}
    ORDER BY similarity DESC
    LIMIT 10
  `;

  return similar;
}
```

## Caching Strategy

### Multi-Layer Cache

```
L1: Edge KV (100% hit rate for redirects)
    ↓
L2: Redis (hot data, analytics)
    ↓
L3: PostgreSQL (warm data)
    ↓
L4: Cold storage (historical analytics)
```

### Cache Invalidation

```typescript
// When link updated
async function updateLink(id: string, data: UpdateLinkData) {
  // 1. Update database
  const link = await db.link.update({
    where: { id },
    data
  });

  // 2. Invalidate Redis cache
  await redis.del(`link:${link.shortCode}`);

  // 3. Update Edge KV
  await syncToEdge(link);

  return link;
}
```

## Scalability Considerations

### Current Architecture (MVP)
- **Single Next.js instance** - Handles 1K-10K req/sec
- **Single PostgreSQL** - Handles 10K writes/sec
- **Bunny CDN Edge** - Handles millions of redirects

### Future Scaling (When Needed)

1. **Horizontal Scaling**
   - Multiple Next.js instances behind load balancer
   - PostgreSQL read replicas
   - Redis cluster

2. **Database Sharding**
   - Shard by user_id or geographic region
   - Separate analytics database (ClickHouse)

3. **Queue System**
   - RabbitMQ/SQS for async tasks
   - Separate workers for analytics processing

## Security Architecture

### API Layer
- Rate limiting (Redis)
- JWT authentication
- API key validation
- CORS configuration

### Edge Layer
- DDoS protection (Bunny CDN)
- Bot detection
- IP blacklisting
- Secret key validation

### Database Layer
- Encrypted connections (SSL)
- Row-level security (future)
- Audit logging

## Monitoring & Observability

### Metrics to Track
- **Redirects**: Count, latency, errors
- **API**: Response time, error rate
- **Database**: Query time, connection pool
- **Edge**: Cache hit rate, global latency
- **AI**: API calls, costs, response time

### Tools (Future)
- Sentry (error tracking)
- Grafana (metrics)
- Prometheus (time-series data)
- LogTail (log aggregation)

---

**This architecture is designed for:**
- ✅ Sub-10ms redirects (edge-first)
- ✅ AI-powered intelligence (GPT-4 + embeddings)
- ✅ Horizontal scalability (stateless design)
- ✅ Cost-effectiveness (efficient caching)
- ✅ Developer experience (TypeScript, type-safe)
