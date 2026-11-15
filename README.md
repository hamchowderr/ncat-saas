# NCAT SaaS Dashboard

A modern web interface for the [No-Code Architects Toolkit API](https://github.com/stephengpope/no-code-architects-toolkit). This dashboard provides an intuitive way to interact with the 100% FREE NCA Toolkit API that processes different types of media and eliminates monthly subscription fees by consolidating common API functionalities into a single API.

Built with Next.js 15 and React 19, this interface streamlines advanced media processing, including video editing and captioning, image transformations, cloud storage, and Python code execution.

## What Can It Do?

This application is a **multi-tenant SaaS platform** built around the No-Code Architects Toolkit (NCAT), powered by Stripe billing and Supabase infrastructure.

**Core Platform Features:**
- Multi-tenant workspace management with team collaboration
- Real-time team chat: 1-on-1 and group conversations
- Stripe-powered subscription billing (Free, Pro, Enterprise tiers)
- File management system with drag-and-drop uploads
- Job monitoring dashboard for background tasks
- AI-powered chat with 9 specialized agents using Mastra framework
- Encrypted cookie storage for social media authentication

**Media Processing Capabilities (via NCAT API):**
- Video editing: trim, cut, split, concatenate, caption generation, thumbnail extraction
- Audio processing: concatenate, convert to MP3, silence detection, transcription
- Image transformations and video generation
- Media format conversion and metadata extraction
- Cloud storage integration (S3, Google Drive, Dropbox, GCS)
- Python code execution for custom workflows

**Advanced Features:**
- Faceless video generation pipeline (stories → scenes → shots → assembly)
- Knowledge base system (KEDB) for content management
- Real-time job tracking with webhook notifications
- Content clips management with aspect ratio calculations
- AI memory system with semantic search across conversations

**Replaces paid services:** Whisper API, Cloud Convert, Createomate, JSON2Video, PDF.co, Placid, OCodeKit

## Prerequisites

Before installing this SaaS dashboard, ensure you have the following:

1. **Node.js**: Version 22.18.0 required (check `.nvmrc` for exact version)
2. **Docker Desktop**: Required for running Supabase locally. [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
3. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
4. **Stripe Account**: Set up a Stripe account for payment processing
5. **Stripe CLI**: Required for local webhook testing. [Install Stripe CLI](https://stripe.com/docs/stripe-cli)

## No-Code Architects Toolkit API Setup

**IMPORTANT:** This dashboard requires the [No-Code Architects Toolkit API](https://github.com/stephengpope/no-code-architects-toolkit) running locally via Docker for all media processing operations.

**First, pull the Docker image:**
```bash
docker pull stephengpope/no-code-architects-toolkit:latest
```

**Then choose one option to start the API:**

**Option 1: Use npm scripts (Recommended)**
```bash
npm run ncat:start  # Start container
npm run ncat:test   # Verify API is running
```

**Option 2: Manual Docker command**
```bash
docker run -d --name no-code-architects-toolkit \
  -p 8080:8080 \
  -e API_KEY=local-dev-api-key \
  -e S3_ENDPOINT_URL=http://host.docker.internal:54321/storage/v1/s3 \
  -e S3_ACCESS_KEY=625729a08b95bf1b7ff351a663f3a23c \
  -e S3_SECRET_KEY=850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907 \
  -e S3_REGION=local \
  -e S3_BUCKET_NAME=files \
  stephengpope/no-code-architects-toolkit:latest

# Verify
curl -H "X-API-Key: local-dev-api-key" http://localhost:8080/v1/toolkit/test
```

## Development Setup

Follow these steps **in the exact order** to get your project up and running locally:

### 1. Clone and Install

```bash
git clone https://github.com/hamchowderr/ncat-saas.git
cd ncat-saas
npm install --legacy-peer-deps
```

### 2. Start No-Code Architects Toolkit API

**This must be started first** as all media processing depends on it.

```bash
npm run ncat:start  # Starts Docker container
npm run ncat:test   # Verify API is running on http://localhost:8080
```

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and add your Stripe keys (Supabase and database values are already set for local development).

### 4. Start Supabase Services

```bash
npx supabase start
npx supabase functions serve  # Separate terminal
```

### 5. Database Setup

```bash
npx supabase db push
npm run update-types
```

### 6. Stripe Billing Setup

```bash
stripe login
stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook

# Copy webhook secret to .env.local

# Create products (choose one):
npm run stripe:create-products  # New setup
npm run stripe:sync             # Existing products
```

### 7. (Optional) Generate AI-Enhanced Seed Data

For more realistic test data, generate AI-enhanced seeds using Snaplet with OpenAI:

```bash
cd supabase
npm install  # First time only
npx tsx seed.ts > seeds/09_snaplet_generated.sql
cd ..
npx supabase db reset
```

**Requirements**: `OPENAI_API_KEY` in `.env.local`

**Note**: This is optional. The default handcrafted seeds provide all necessary test data.

### 8. Start Development Server

```bash
npm run dev  # http://localhost:3000
```

## Development Commands

### Core Development

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code linting
- `npm run update-types` - Generate TypeScript types from Supabase database schema

### Supabase Commands

#### Local Development Commands

- `npx supabase start` - Start local Supabase stack (Docker containers)
- `npx supabase stop` - Stop local Supabase stack
- `npx supabase status` - Check local services status
- `npx supabase db reset` - Reset local database (drop all data and re-run migrations)
- `npx supabase db push` - Push local migrations to local database
- `npx supabase functions serve` - Serve Edge Functions locally

#### Cloud/Production Commands

- `npx supabase link --project-ref YOUR_PROJECT_ID` - Link local project to cloud Supabase project
- `npx supabase db push --linked` - Push migrations to linked cloud database
- `npx supabase functions deploy` - Deploy all Edge Functions to cloud
- `npx supabase functions deploy FUNCTION_NAME` - Deploy specific Edge Function to cloud
- `npx supabase db pull` - Pull schema changes from cloud to local
- `npx supabase gen types typescript --linked` - Generate types from cloud database

### Stripe CLI Commands

- `stripe login` - Authenticate with Stripe CLI
- `stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook` - Forward webhooks to Supabase Edge Function
- `stripe logs tail` - View real-time API request logs

### Stripe Product Management (npm scripts)

- `npm run stripe:create-products` - Create all 3 NCAT products and prices from scratch
- `npm run stripe:sync` - Sync existing NCAT products from Stripe to database
- `npm run stripe:check` - Check Stripe setup and product configuration

### No-Code Architects Toolkit API (npm scripts)

- `npm run ncat:start` - Start NCAT API Docker container
- `npm run ncat:stop` - Stop and remove NCAT API container
- `npm run ncat:restart` - Restart NCAT API container
- `npm run ncat:status` - Check if NCAT API is running
- `npm run ncat:logs` - View real-time NCAT API logs
- `npm run ncat:test` - Test NCAT API endpoint

### Testing

- `npx playwright test` - Run all E2E tests
- `npx playwright test --ui` - Run tests with interactive UI
- `npx playwright install` - Install required browsers

## Development Workflow

Before committing:

```bash
npm run lint
npm run build
npx prettier --write .
npx supabase db push  # If database changed
npm run update-types  # If schema changed
```

## Troubleshooting

**NCAT API Issues:**
```bash
npm run ncat:status  # Check status
npm run ncat:logs    # View logs
npm run ncat:restart # Restart container
```

**Database Issues:**
```bash
npx supabase db push
npm run update-types
```

**Stripe Webhooks:**
- Ensure Edge Functions are running
- Check webhook secret in `.env.local`
- View logs: `stripe logs tail`

**Service Start Order:**
1. NCAT API
2. Supabase
3. Edge Functions
4. Stripe CLI
5. Dev server

## Documentation

- `CLAUDE.md` - AI assistant instructions
- `src/mastra/README.md` - Mastra AI agent framework
- `app/workspace/media-tools/components/tools/README.md` - Media tools guide

## Production Deployment

### Supabase Edge Function Secrets

```bash
npx supabase link --project-ref YOUR_PROJECT_ID
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...
npx supabase secrets set OPENAI_API_KEY=sk-...
npx supabase functions deploy
```

### Hosting Platform Variables (Vercel/Netlify)

Configure these environment variables in your hosting platform's dashboard:

**Public Variables (exposed to client):**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbG...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

**Private Variables (server-only):**
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SIGNING_SECRET=whsec_...
OPENAI_API_KEY=sk-proj-...
ELEVENLABS_API_KEY=sk_...
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-secret
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com
COOKIE_ENCRYPTION_KEY=your-32-byte-base64-key
```

**Note:** Generate `COOKIE_ENCRYPTION_KEY` using: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

### Stripe Webhooks

Add endpoint at [Stripe Dashboard](https://dashboard.stripe.com/webhooks):
- URL: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook`
- Events: `customer.*`, `invoice.*`, `product.*`, `price.*`, `subscription.*`
