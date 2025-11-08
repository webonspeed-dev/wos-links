# 🚀 WOS Links - Setup & Deployment Guide

**Last Updated:** 2025-01-07
**Status:** Ready for Database Setup & Testing

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Configuration](#database-configuration)
4. [Authentication Setup](#authentication-setup)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **pnpm** v8+ (Install: `npm install -g pnpm`)
- **PostgreSQL** v14+ ([Download](https://www.postgresql.org/) or use cloud service)
- **Redis** v7+ (Optional for rate limiting, [Download](https://redis.io/))
- **Git** ([Download](https://git-scm.com/))

### Recommended Cloud Services

- **Database:** [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or [Railway](https://railway.app/)
- **Redis:** [Upstash](https://upstash.com/) (free tier available)
- **Hosting:** [Vercel](https://vercel.com/), [Railway](https://railway.app/), or [Fly.io](https://fly.io/)

---

## Local Development Setup

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd wos-links

# Install dependencies
pnpm install

# This will install all packages in the monorepo
```

### 2. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your configuration
nano .env  # or use your preferred editor
```

**Required environment variables:**

```bash
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@host:5432/wos_links"

# NextAuth (REQUIRED)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generated-secret>"  # Already set in .env

# App Config (REQUIRED)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_DEFAULT_DOMAIN="wos.link"
```

**Optional but recommended:**

```bash
# AI Providers (for AI features)
OPENROUTER_API_KEY="sk-or-v1-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_API_KEY="AIza..."
OPENAI_API_KEY="sk-..."

# OAuth Providers (for social login)
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret"
GITHUB_CLIENT_ID="your-github-id"
GITHUB_CLIENT_SECRET="your-github-secret"

# Redis (for rate limiting)
REDIS_URL="redis://localhost:6379"
```

---

## Database Configuration

### Option 1: Cloud Database (Recommended for Quick Start)

**Using Neon (Free Tier):**

1. Go to [https://neon.tech/](https://neon.tech/)
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Paste it in `.env` as `DATABASE_URL`

**Using Supabase (Free Tier):**

1. Go to [https://supabase.com/](https://supabase.com/)
2. Create a free account
3. Create a new project
4. Go to Settings → Database
5. Copy the connection string (Transaction pooler)
6. Paste it in `.env` as `DATABASE_URL`

### Option 2: Local PostgreSQL

**Using Docker:**

```bash
# Start PostgreSQL and Redis
cd docker
docker compose up -d

# Your DATABASE_URL is already configured for this in .env
```

**Manual PostgreSQL Installation:**

```bash
# macOS (with Homebrew)
brew install postgresql@14
brew services start postgresql@14
createdb wos_links

# Ubuntu/Debian
sudo apt install postgresql-14
sudo systemctl start postgresql
sudo -u postgres createdb wos_links

# Update .env with your local connection string
DATABASE_URL="postgresql://localhost:5432/wos_links"
```

### 3. Database Migration

**Generate Prisma Client:**

```bash
pnpm --filter @wos/database db:generate
```

**Push Schema to Database:**

```bash
pnpm --filter @wos/database db:push
```

**Verify Migration:**

```bash
# Optional: Open Prisma Studio to view your database
pnpm --filter @wos/database db:studio
# Opens at http://localhost:5555
```

---

## Authentication Setup

### Email/Password Authentication

✅ **Already configured!** Users can sign up with email and password.

No additional setup needed. The system uses bcrypt for secure password hashing.

### OAuth Setup (Optional)

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

```bash
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret"
```

#### GitHub OAuth

1. Go to [GitHub Settings → Developer settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: WOS Links
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env`

```bash
GITHUB_CLIENT_ID="your-github-id"
GITHUB_CLIENT_SECRET="your-github-secret"
```

---

## Running the Application

### Development Mode

```bash
# Start all apps in development mode
pnpm dev

# The web app will be available at:
# http://localhost:3000
```

### Build for Production

```bash
# Build all packages
pnpm build

# Start in production mode
pnpm start
```

### Individual Packages

```bash
# Run specific workspace
pnpm --filter @wos/web dev
pnpm --filter @wos/database db:push
```

---

## Testing

### 1. Test Authentication

```bash
# Start the app
pnpm dev

# In your browser:
# 1. Go to http://localhost:3000/auth/signup
# 2. Create an account
# 3. Sign in
# 4. You should be redirected to /dashboard
```

### 2. Test AI Services

```bash
# Make sure you have at least one AI API key in .env

# Visit the test endpoint:
curl http://localhost:3000/api/test/ai

# Or run tests directly:
cd apps/web
node --loader ts-node/esm run-ai-tests.mjs
```

### 3. Test Link Creation

```bash
# After signing in, test link creation:
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-session-cookie>" \
  -d '{
    "destination": "https://example.com",
    "title": "Test Link"
  }'
```

---

## Deployment

### Deploy to Vercel (Recommended)

**Quick Deploy:**

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Click "Import Project"
4. Select your repository
5. Vercel will auto-detect Next.js

**Environment Variables:**

Add all variables from `.env` to Vercel:

```bash
# In Vercel Dashboard → Settings → Environment Variables
DATABASE_URL=<your-cloud-database-url>
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<same-as-local>
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
# ... add all other variables
```

**Build Settings:**

- Framework Preset: Next.js
- Build Command: `pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`

### Deploy to Railway

1. Go to [Railway](https://railway.app/)
2. Create new project
3. Add PostgreSQL database
4. Deploy from GitHub
5. Add environment variables
6. Railway auto-detects Next.js and builds

### Deploy to Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Deploy
flyctl launch

# Follow prompts to configure
```

---

## Troubleshooting

### Database Connection Issues

**Error:** `Can't reach database server`

```bash
# Check if DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# If using Prisma with pgvector, ensure extension is enabled
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS vector"
```

### Prisma Client Not Found

**Error:** `Cannot find module '@prisma/client'`

```bash
# Generate Prisma client
pnpm --filter @wos/database db:generate

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### NextAuth Session Issues

**Error:** `NEXTAUTH_SECRET` or session not persisting

```bash
# Generate a new secret
openssl rand -base64 32

# Add to .env
NEXTAUTH_SECRET="<generated-secret>"

# Restart dev server
```

### AI Features Not Working

**Error:** AI completion failures

```bash
# Check if you have API keys set
env | grep API_KEY

# Test a single provider
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# AI features are optional - app works without them
```

### Build Errors

**Error:** TypeScript or build errors

```bash
# Clean build cache
pnpm clean  # if script exists
rm -rf .next apps/web/.next

# Rebuild
pnpm build
```

### Port Already in Use

**Error:** `Port 3000 is already in use`

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

---

## Next Steps After Setup

### Immediate Tasks

1. **Test the full flow:**
   - Sign up → Create link → View in dashboard

2. **Configure AI features:**
   - Add at least one AI API key
   - Test slug suggestions

3. **Set up rate limiting:**
   - Add Redis URL
   - Configure rate limits

### Short-term (This Week)

1. **Connect dashboard forms:**
   - Update forms to use new APIs
   - Add loading states
   - Add toast notifications

2. **Add rate limiting:**
   - Implement @upstash/ratelimit
   - Add to all API routes

3. **Deploy to staging:**
   - Test with real users
   - Collect feedback

### Medium-term (This Month)

1. **Analytics implementation:**
   - Click tracking API
   - Dashboard charts
   - Export functionality

2. **Billing integration:**
   - Stripe setup
   - Plan upgrades
   - Usage tracking

3. **Public launch:**
   - Marketing site
   - Documentation
   - Beta users

---

## Useful Commands Reference

```bash
# Development
pnpm dev                              # Start all apps
pnpm --filter @wos/web dev           # Start web app only

# Database
pnpm --filter @wos/database db:generate  # Generate Prisma client
pnpm --filter @wos/database db:push      # Push schema to DB
pnpm --filter @wos/database db:studio    # Open Prisma Studio
pnpm --filter @wos/database db:migrate   # Create migration

# Build
pnpm build                           # Build all packages
pnpm start                           # Start in production mode

# Testing
curl http://localhost:3000/api/test/ai   # Test AI services
pnpm test                                 # Run tests (when added)

# Deployment
vercel                               # Deploy to Vercel
flyctl deploy                        # Deploy to Fly.io
git push railway main                # Deploy to Railway
```

---

## Getting Help

- **Documentation:** Check [AUDIT_REPORT.md](/AUDIT_REPORT.md) for detailed technical info
- **Testing Guide:** See [TESTING.md](/TESTING.md) for testing instructions
- **Architecture:** Review [ARCHITECTURE.md](/ARCHITECTURE.md) for system design

---

**Ready to launch! 🚀**

Follow this guide step-by-step and you'll have WOS Links running in under 30 minutes.
