# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Development Commands

### Core Development

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint for code linting
- `npm run update-types` - Generate TypeScript types from Supabase database schema
- `npx prettier --write .` - Format all files using Prettier

**Package Management:** Use `npm install --legacy-peer-deps` for React 19 peer dependency issues.

### Supabase Commands

**Local Development:**
- `npx supabase start` - Start local Supabase stack
- `npx supabase stop` - Stop local Supabase stack
- `npx supabase db reset` - Reset local database and re-run migrations
- `npx supabase db push` - Push local migrations to local database
- `npx supabase functions serve` - Serve Edge Functions locally

**Cloud/Production:**
- `npx supabase link --project-ref YOUR_PROJECT_ID` - Link to cloud project
- `npx supabase db push --linked` - Push migrations to cloud database
- `npx supabase functions deploy [FUNCTION_NAME]` - Deploy Edge Functions

### Stripe CLI Commands

- `stripe login` - Authenticate with Stripe CLI
- `stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook` - Forward webhooks locally

**Product Management:**
- `npm run stripe:create-products` - Create all 3 NCAT products and prices
- `npm run stripe:sync` - Sync existing Stripe products from Stripe to database
- `npm run stripe:check` - Check Stripe setup and product configuration

### No-Code Architects Toolkit API

- `npm run ncat:start` - Start NCAT API Docker container
- `npm run ncat:stop` - Stop and remove NCAT API container
- `npm run ncat:restart` - Restart NCAT API container
- `npm run ncat:status` - Check if NCAT API is running
- `npm run ncat:logs` - View real-time NCAT API logs
- `npm run ncat:test` - Test NCAT API endpoint

### Mastra AI Agent Framework

- `npm run mastra:dev` - Start Mastra development playground on http://localhost:4111
- See `src/mastra/README.md` for detailed documentation on 9 agents and 17 NCAT tools

## ⚠️ Critical Patterns (Bug Prevention)

### 1. Service Startup Order

**ALWAYS start services in this exact order:**
```bash
npm run ncat:start           # 1. NCAT API first
npx supabase start          # 2. Then Supabase
npx supabase functions serve # 3. Then Edge Functions
npm run dev                 # 4. Finally dev server
```

Failure to follow this order will cause media processing failures and webhook issues.

### 2. Supabase Client Anti-Pattern ⚠️

**CRITICAL:** Never create Supabase clients at module level - always create inside functions/hooks.

**❌ BAD (Module Level):**
```typescript
import { createClient } from "@/lib/client";
const supabase = createClient(); // ❌ Stale auth tokens!

export function useData() {
  return useQuery({
    queryFn: async () => {
      const { data } = await supabase.from("table").select(); // Uses stale client
      return data;
    }
  });
}
```

**✅ GOOD (Function Level):**
```typescript
import { createClient } from "@/lib/client";

export function useData() {
  return useQuery({
    queryFn: async () => {
      const supabase = createClient(); // ✅ Fresh auth tokens
      const { data } = await supabase.from("table").select();
      return data;
    }
  });
}

useEffect(() => {
  const supabase = createClient(); // ✅ Fresh client
  const channel = supabase.channel("room");
  // ...
}, []);
```

### 3. React Query v5 Error Handling

**`onError` callback is DEPRECATED in React Query v5.** Use `useEffect` for error side effects:

```typescript
const { data, error } = useQuery({ /* ... */ });

useEffect(() => {
  if (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    });
  }
}, [error, toast]);
```

### 4. useUser Hook Pattern

The `useUser` hook returns React Query's `UseQueryResult` object. **ALWAYS destructure `data` and rename to `user`:**

```typescript
const { data: user, isLoading } = useUser();

if (isLoading) return <Skeleton />;
if (!user) return <div>Not logged in</div>;

return <div>Hello {user.email}</div>;
```

### 5. React Query Configuration

**ALWAYS use standardized constants from `lib/query-config.ts`:**

```typescript
import { useQuery } from "@tanstack/react-query";
import { STALE_TIMES, RETRY_CONFIG } from "@/lib/query-config";

const { data, isLoading, error } = useQuery({
  queryKey: ["unique-key", dependency],
  queryFn: async () => {
    const supabase = createClient(); // Create inside queryFn
    const { data, error } = await supabase.from("table").select();
    if (error) throw error;
    return data;
  },
  staleTime: STALE_TIMES.USER_DATA, // Use constants
  retry: RETRY_CONFIG.DEFAULT,
  enabled: !!dependency // Only run when dependency exists
});
```

**Available staleTime presets:**
- `REALTIME` (10s) - Messages, notifications
- `FREQUENT` (30s) - Chats, recent activity
- `NORMAL` (1m) - Default for most queries
- `USER_DATA` (2m) - Profile, workspaces, cookies
- `STATIC` (5m) - Products, plans, admin status
- `VERY_STATIC` (10m) - Rarely changing data

### 6. React Best Practices

**Data Fetching:**
- ✅ Use `@tanstack/react-query` for all data fetching
- ❌ Never use `useEffect` for data fetching
- ✅ Use `useEffect` only for: external system sync, DOM manipulation, event listeners

**Dependent Queries:**
```typescript
const { data: user } = useQuery({ queryKey: ["user"], queryFn: fetchUser });

const { data: posts } = useQuery({
  queryKey: ["posts", user?.id],
  queryFn: () => fetchUserPosts(user!.id),
  enabled: !!user // Only fetch when user exists
});
```

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **UI:** Radix UI components with shadcn/ui design system
- **Styling:** Tailwind CSS with custom theming system
- **Authentication:** Supabase Auth with SSR middleware
- **Database:** Supabase (PostgreSQL)
- **State Management:** Zustand, TanStack Query for server state
- **Forms:** React Hook Form with Zod validation
- **Payments:** Stripe integration
- **AI Integration:** OpenAI (chat, DALL-E), Mastra for AI agents
- **Animations:** anime.js v4 (see `lib/animations.ts`)
- **Media Integration:** ElevenLabs (voice), HeyGen (avatar videos)
- **Testing:** Playwright for E2E tests

## Key Directory Structure

```
app/
├── api/               # API routes (billing, chat, cookies, jobs, mastra, workspace)
├── auth/              # Authentication pages (login, callback, onboarding)
├── billing/           # Billing and subscription management
├── settings/          # User settings (profile, display, integrations)
├── workspace/         # Core workspace functionality
│   ├── ai-chat/             # AI chat interface (AI SDK 5)
│   ├── ai-chat-mastra/      # Mastra AI agent chat interface
│   ├── content-clips/       # Video clip management
│   ├── file-manager/        # File operations dashboard
│   ├── files/               # File browser with pagination
│   ├── jobs/                # Job/task monitoring table
│   ├── kedb/                # Knowledge base system
│   ├── media-tools/         # NCAT media processing tools
│   ├── members/             # Workspace member management
│   └── video-generation/    # Faceless video generation (stories, scenes, shots)
└── admin/             # Admin panel

components/
├── ui/               # shadcn/ui base components
├── billing/          # Billing components (plan comparison, subscription status)
├── file-upload-dialog.tsx  # Unified file upload component
└── layout/           # Layout components (header, sidebar)

lib/
├── client.ts         # Supabase client configuration (ALWAYS create in functions!)
├── server.ts         # Supabase server client
├── middleware.ts     # Session management for protected routes
├── animations.ts     # anime.js animation utilities
├── query-config.ts   # React Query constants (STALE_TIMES, RETRY_CONFIG)
├── database.types.ts # Generated TypeScript types from Supabase
└── types/            # TypeScript type definitions

hooks/
├── use-infinite-query.ts   # Infinite scroll pagination
├── use-media-files.ts      # Media file filtering and search
├── use-file-url.ts         # File URL management
├── use-supabase-upload.ts  # File upload to Supabase Storage
└── use-user.ts            # Current user data

supabase/
├── functions/        # Edge Functions (21 functions)
├── migrations/       # Database migrations (36 migrations)
└── config.toml       # Supabase configuration

src/mastra/           # Mastra AI Agent Framework
├── agents/           # 9 AI agents (legacy, NCAT, faceless video)
├── tools/            # 17 NCAT API tools + legacy tools
└── index.ts          # Mastra configuration
```

## Authentication & Authorization

**Auth Flow:**
1. Sign Up → Email Confirmation → Email Verification (`/auth/callback`)
2. Onboarding (`/auth/onboarding`) → Free subscription auto-created
3. Dashboard Access (`/workspace/file-manager`)

**Protected Routes:** All routes except `/auth/*` require authentication (redirects to `/auth/login`)

**RBAC:** Use `isUserAdmin()` from `lib/admin.ts` for admin checks. Always check asynchronously in `useEffect`.

## Database & Migrations

**Migration Naming Convention:**
- Format: `YYYYMMDD######_description.sql`
- Core system: `20240101000000` through `20240101000027`
- Feature migrations: `YYYYMMDD` with actual date (e.g., `20250129210000`)
- Location: `supabase/migrations/`

**Key Migration Categories:**
- `000-001`: Core Supabase extensions (including pgvector for AI embeddings)
- `002-008`: Core tables (users, workspaces, projects, Mastra AI chat with memory)
- `009`: Billing system with Stripe
- `022`: Jobs and file relationships
- `023`: NCAT endpoint tables
- `024`: User cookie storage
- `025-027`: Workspace team chat system (human-to-human messaging)
- `20250129210000-210003`: Faceless video generator with webhooks
- `20250129213000`: Knowledge base (KEDB)
- `20250129213100`: Content clips (videos, clips)

**Note:** Migration 006 now contains Mastra tables (`mastra_threads`, `mastra_messages`, `mastra_resources`, `mastra_working_memory`) instead of the legacy `chats` table.

## Workspace Features (Overview)

- **File Management:** File manager, file browser, drag-and-drop upload, media files sidebar
- **Job Monitoring:** Track file processing and background tasks with real-time updates
- **Team Collaboration:** Member management, email invitations, role-based access
- **Media Processing:** 17 production tools for video, audio, image processing via NCAT API
- **Content Clips:** Video clip management with aspect ratio calculations
- **Faceless Video Generation:** Automated story → scenes → shots → final video pipeline
- **AI Chat:** Unified Mastra system with 9 specialized agents, memory, and semantic recall
- **Cookie Storage:** Encrypted browser cookies for YouTube, Vimeo, Instagram, TikTok

## Supabase Edge Functions

**21 Edge Functions for media processing and system operations:**

**Media:** media-convert, media-convert-mp3, media-transcribe, media-silence, media-metadata

**Video:** video-caption, video-cut, video-split, video-trim, video-thumbnail, video-concatenate, image-convert-video

**Audio:** audio-concatenate

**System:** ffmpeg-compose, code-execute-python, ncat-webhook, stripe-webhook, heygen-webhook, generate-audio

**All functions integrate with NCAT API and handle authentication via JWT tokens.**

## Mastra AI Agent System

**Architecture:** Unified AI chat system using Mastra with Supabase PostgreSQL storage

**Storage:** PgStore (Supabase) with PgVector for semantic recall and memory persistence

**8 Production Agents:**
- **General Chat:** generalChatAgent (default conversational AI with DALL-E image generation)
- **NCAT:** ncatMediaExpertAgent, videoProductionAgent, jobMonitorAgent (production-ready)
- **Faceless Video:** storyArchitectAgent, mediaGenerationAgent, videoAssemblyAgent, storyTypeAgent

**Memory Features:**
- **Working Memory:** Resource-scoped persistent user context (preferences, common tasks)
- **Semantic Recall:** Vector search across past conversations (pgvector with HNSW index)
- **Thread Titles:** Auto-generated from first message for easy organization
- **Cross-Thread Memory:** Agents remember user preferences across all conversations

**17 Production Tools:** Media processing, video editing, audio processing, storage, Python execution, job tracking

**Access:** `npm run mastra:dev` (http://localhost:4111) or `/workspace/ai-chat`

**API Endpoint:** `/api/chat` - Unified chat endpoint for all agents with memory

**Documentation:** See `src/mastra/README.md` for complete details

## Development Workflow

### Initial Setup

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Copy environment file
cp .env.local.example .env.local

# 3. Start services (IN ORDER!)
npm run ncat:start
npx supabase start
npx supabase functions serve

# 4. Apply migrations and generate types
npx supabase db push
npm run update-types

# 5. Setup Stripe (in separate terminal)
stripe login
stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook

# 6. Create Stripe products
npm run stripe:create-products

# 7. Start dev server
npm run dev
```

### Before Committing

```bash
npm run lint
npm run build
npx prettier --write .
npx supabase db push      # If DB changed
npm run update-types      # If schema changed
```

## Common Issues & Solutions

1. **Services not starting:** Check start order (NCAT → Supabase → Edge Functions → Dev)
2. **Media processing failing:** Verify NCAT API running (`npm run ncat:test`), check logs (`npm run ncat:logs`)
3. **Database connection issues:** Run `npx supabase db push` and `npm run update-types`
4. **Stripe webhooks not syncing:** Ensure Edge Functions running, verify Stripe CLI forwarding
5. **Build errors:** Run `npm install --legacy-peer-deps`, clear `.next` cache, regenerate types
6. **Files download instead of displaying:** Webhook handler auto-fixes Content-Type on upload

