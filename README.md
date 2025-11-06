# 🚀 WOS Links

**AI-Powered Link Management Platform with Revenue Attribution**

WOS Links is the first link shortener that tracks revenue, not just clicks. Built on edge infrastructure for sub-10ms redirects globally, powered by AI for intelligent link management.

## ✨ Features

### 🤖 AI-Powered
- **Smart Slug Suggestions** - AI generates memorable, SEO-friendly short URLs
- **Auto-SEO Optimization** - Automatically generates meta tags and Open Graph images
- **Semantic Duplicate Detection** - Find similar links using pgvector embeddings
- **Content Categorization** - AI automatically categorizes your links

### ⚡ Lightning Fast
- **Sub-10ms Redirects** - Edge computing with Bunny CDN
- **Global Distribution** - 100+ edge locations worldwide
- **Edge KV Storage** - Zero backend round-trips for redirects

### 📊 Revenue Attribution
- **Multi-Touch Attribution** - Track the entire customer journey
- **Conversion Tracking** - Know which links drive actual revenue
- **Cross-Device Tracking** - Follow users across devices
- **Stripe Integration** - Automatic revenue attribution

### 🎯 Smart Routing
- **Geo-Based Routing** - Different destinations per country
- **Device-Based Routing** - Mobile vs desktop routing
- **Time-Based Routing** - Route based on time of day
- **Referrer-Based Routing** - Different pages for different traffic sources

## 🏗️ Tech Stack

```
Frontend:    Next.js 14 (App Router), React, TypeScript, Tailwind CSS
Backend:     Next.js API Routes, Prisma ORM
Database:    PostgreSQL with pgvector extension
Cache:       Redis
Edge:        Bunny CDN Edge Scripts (or Cloudflare Workers)
AI:          OpenAI GPT-4, text-embedding-3-small
Deployment:  Docker, Docker Compose
```

## 📁 Project Structure

```
wos-links/
├── apps/
│   ├── web/              # Next.js dashboard & API
│   └── edge/             # Bunny CDN edge scripts
├── packages/
│   ├── database/         # Prisma schema & client
│   ├── types/            # Shared TypeScript types
│   └── ui/               # Shared UI components (future)
├── docker/
│   ├── docker-compose.yml
│   └── postgres/
└── docs/                 # Documentation (future)
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** 8+ (Install: `npm install -g pnpm`)
- **Docker** & Docker Compose
- **OpenAI API Key** (for AI features)

### 1. Clone & Install

```bash
# Clone the repository
cd wos-links

# Install dependencies
pnpm install
```

### 2. Start Database

```bash
# Start PostgreSQL + Redis with Docker
pnpm docker:up

# Wait for containers to be healthy (~10 seconds)
```

### 3. Configure Environment

```bash
# Copy environment files
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local
cp packages/database/.env.example packages/database/.env

# Edit .env files with your values
# At minimum, add your OPENAI_API_KEY
```

### 4. Setup Database

```bash
# Generate Prisma client
cd packages/database
pnpm db:generate

# Push schema to database
pnpm db:push

# (Optional) Open Prisma Studio to view data
pnpm db:studio
```

### 5. Start Development Server

```bash
# From root directory
pnpm dev

# Access the app at http://localhost:3000
```

## 🔧 Development Commands

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# Build all apps
pnpm build

# Lint code
pnpm lint

# Format code
pnpm format

# Clean build artifacts
pnpm clean

# Database commands
pnpm db:studio    # Open Prisma Studio
pnpm db:push      # Push schema changes
pnpm db:migrate   # Create migration

# Docker commands
pnpm docker:up    # Start containers
pnpm docker:down  # Stop containers
```

## 📊 Database Schema

The database uses **pgvector** for AI-powered semantic search:

```sql
-- Links table with vector embeddings
CREATE TABLE links (
  id TEXT PRIMARY KEY,
  short_code TEXT UNIQUE,
  destination TEXT,
  embedding vector(1536),  -- OpenAI embeddings
  -- ... other fields
);

-- Create vector index for fast similarity search
CREATE INDEX ON links USING ivfflat (embedding vector_cosine_ops);
```

### Key Models:
- **User** - Authentication & subscription management
- **Link** - Core short links with AI embeddings
- **Click** - Analytics & click tracking
- **Conversion** - Revenue attribution
- **CustomDomain** - White-label domains
- **ApiKey** - API access management

## 🤖 AI Features Implementation

### 1. Smart Slug Suggestions

```typescript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateSlugSuggestions(url: string, title: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "Generate 3 short, memorable URL slugs (5-10 chars)"
    }, {
      role: "user",
      content: `URL: ${url}\nTitle: ${title}`
    }]
  });

  return response.choices[0].message.content;
}
```

### 2. Semantic Duplicate Detection

```typescript
// Generate embedding for new link
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: destination + title + description
});

// Find similar links using pgvector
const similar = await db.$queryRaw`
  SELECT id, short_code, destination,
         1 - (embedding <=> ${embedding}::vector) as similarity
  FROM links
  WHERE user_id = ${userId}
    AND 1 - (embedding <=> ${embedding}::vector) > 0.85
  ORDER BY similarity DESC
  LIMIT 5
`;
```

## 🌐 Edge Deployment (Bunny CDN)

### Why Bunny CDN?
- ✅ **5x cheaper** than Cloudflare ($1/TB vs $5/TB)
- ✅ **100+ edge locations** globally
- ✅ **Sub-10ms redirects** with Edge Scripts
- ✅ **Built-in DDoS protection**

### Deployment Steps:

1. **Create Bunny Pull Zone**
   - Go to Bunny Dashboard → Pull Zones
   - Create new zone pointing to your API

2. **Enable Edge Scripting**
   - Pull Zone → Edge Scripts
   - Upload `apps/edge/bunny-edge-script.js`

3. **Configure Edge KV**
   - Create namespace: `wos-links`
   - Sync links from database to KV

4. **Update DNS**
   - Point `wos.link` to Bunny Pull Zone
   - Enable SSL

See `apps/edge/README.md` for detailed instructions.

## 📈 Roadmap

### Phase 1: MVP (Weeks 1-8) ✅
- [x] Project structure & monorepo
- [x] Database schema with pgvector
- [x] Basic link shortening
- [ ] AI slug suggestions
- [ ] Analytics dashboard
- [ ] Custom domains

### Phase 2: AI Features (Weeks 9-12)
- [ ] Semantic duplicate detection
- [ ] Auto-SEO metadata generation
- [ ] Smart routing (geo, device)
- [ ] A/B testing framework

### Phase 3: Attribution (Weeks 13-16)
- [ ] Conversion tracking
- [ ] Revenue attribution
- [ ] Multi-touch attribution
- [ ] Stripe integration

### Phase 4: Growth (Weeks 17+)
- [ ] Landing page builder
- [ ] White label program
- [ ] API marketplace
- [ ] Mobile apps

## 🎯 Competitive Advantages

### vs Bitly
- ✅ AI-powered features
- ✅ 5x faster redirects
- ✅ Revenue attribution (not just clicks)
- ✅ Similar pricing with more features

### vs Rebrandly
- ✅ Better AI features
- ✅ More comprehensive attribution
- ✅ Faster edge infrastructure

### vs Short.io
- ✅ AI-first approach
- ✅ Revenue tracking
- ✅ Better developer experience

## 💰 Business Model

```
FREE:       100 links/month, basic analytics
PRO ($49):  5K links, AI features, custom domain, A/B testing
BUSINESS ($99): Unlimited links, white label, team features
ENTERPRISE: Custom pricing, SLA, SSO, dedicated support
```

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

```bash
# Database
DATABASE_URL=postgresql://...

# AI
OPENAI_API_KEY=sk-...

# Bunny CDN (optional for development)
BUNNY_API_KEY=...
BUNNY_STORAGE_API_KEY=...

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
```

## 🧪 Testing

```bash
# Run tests (coming soon)
pnpm test

# Run E2E tests (coming soon)
pnpm test:e2e
```

## 📚 Documentation

- [Edge Deployment Guide](apps/edge/README.md)
- [API Documentation](#) (coming soon)
- [Database Schema](packages/database/prisma/schema.prisma)

## 🤝 Contributing

This is currently a solo project, but contributions are welcome!

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org) - React framework
- [Prisma](https://prisma.io) - Database ORM
- [pgvector](https://github.com/pgvector/pgvector) - Vector database
- [OpenAI](https://openai.com) - AI features
- [Bunny CDN](https://bunny.net) - Edge computing
- [shadcn/ui](https://ui.shadcn.com) - UI components

---

**Built by Chris | [Website](#) | [Twitter](#) | [GitHub](#)**

*Turning every link into an intelligent conversion machine* 🚀
