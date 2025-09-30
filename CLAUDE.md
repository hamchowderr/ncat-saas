# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code linting
- `npm run update-types` - Generate TypeScript types from Supabase database schema
- `npx prettier --write .` - Format all files using Prettier

### Package Management

If encountering package installation issues (common with React 19 and peer dependencies), use:

```bash
npm install --legacy-peer-deps
```

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
- `stripe trigger product.created` - Create test product for billing
- `stripe trigger price.created` - Create test price for billing
- `stripe trigger customer.created` - Test customer creation
- `stripe trigger customer.subscription.created` - Test subscription creation
- `stripe logs tail` - View real-time API request logs

### Supabase Edge Functions Commands

- `npx supabase functions new stripe-webhook` - Create new Edge Function for Stripe webhooks
- `npx supabase functions serve stripe-webhook` - Serve specific Edge Function locally
- `npx supabase functions serve` - Serve all Edge Functions locally
- `npx supabase functions deploy stripe-webhook` - Deploy specific Edge Function to production

### Stripe Integration Testing Workflow

#### Setup Webhooks for Local Testing

**CRITICAL: Services must be started in this exact order:**

1. **Install Stripe CLI** from [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. **Login to Stripe**: `stripe login`
3. **Start Supabase locally**: `npx supabase start`
4. **Serve Edge Functions**: `npx supabase functions serve` (REQUIRED - keep running in separate terminal)
5. **Forward webhooks**: `stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook` (keep running in separate terminal)
6. **Copy webhook signing secret** and add to `.env.local` as `STRIPE_WEBHOOK_SIGNING_SECRET`

**Important Notes:**
- Edge Functions MUST be running (`npx supabase functions serve`) before Stripe webhooks will sync
- Stripe CLI MUST be forwarding webhooks for product/price sync to work
- Keep both terminals running during development

#### Syncing Existing Stripe Products to Database

**CRITICAL: Follow these exact steps to sync products and prices:**

```bash
# Step 1: Add sync metadata to products (this enables filtering)
stripe products update YOUR_PRODUCT_ID -d "metadata[sync_to_app]=true" -d "metadata[app_name]=ncat-saas"

# Example for NCAT products:
stripe products update prod_T8JMLAOjYY3fVV -d "metadata[sync_to_app]=true" -d "metadata[app_name]=ncat-saas"  # Free Plan
stripe products update prod_T8JMB6xPmiHq7f -d "metadata[sync_to_app]=true" -d "metadata[app_name]=ncat-saas"  # Pro Plan
stripe products update prod_T8JM2tfJbN0viA -d "metadata[sync_to_app]=true" -d "metadata[app_name]=ncat-saas"  # Business Plan

# Step 2: Trigger price webhooks to sync prices
stripe prices update YOUR_PRICE_ID -d "metadata[tier]=free"

# Example for NCAT prices:
stripe prices update price_1SCQNWCCFNRAwpJsa20Nj8Mj -d "metadata[plan]=free"     # Free Plan - $0/month
stripe prices update price_1SCAlRCCFNRAwpJsKhicPvU7 -d "metadata[tier]=pro"     # Pro Plan - $25/month
stripe prices update price_1SCAmWCCFNRAwpJsmdHZ3wZK -d "metadata[tier]=business" # Business Plan - $50/month

# Step 3: Verify sync in Supabase Studio
# Open http://localhost:54323
# Check billing_products table (should have 3 products)
# Check billing_prices table (should have 3 prices including $0 free plan)
```

**Verification Commands:**

```bash
# List your Stripe products
stripe products list --limit 10

# List prices for a specific product
stripe prices list --product YOUR_PRODUCT_ID

# Check recent Stripe events
stripe events list --limit 5
```

**Webhook Handler Logs:**

When Edge Functions are running, you'll see logs like:
```
[Info] 🔔 Event received: evt_XXX - price.updated
[Info] ✅ Price price_1SCQNWCCFNRAwpJsa20Nj8Mj synced
[Info] ✅ Product prod_T8JMLAOjYY3fVV synced
```

#### Testing Customer and Subscription Flow

```bash
# Create test customer
stripe trigger customer.created

# Create test subscription (automatically creates free subscription)
stripe trigger customer.subscription.created

# Check billing_customers and billing_subscriptions tables in Supabase
```

#### Customer Portal Integration

- Users can access Stripe Customer Portal via `/billing` page
- Portal allows users to upgrade, downgrade, or cancel subscriptions
- All changes sync automatically via webhooks to Supabase database

## Architecture Overview

### Tech Stack

This is a **Next.js 15 + React 19** application that serves as a SaaS dashboard for the No-Code Architects Toolkit API. The project uses:

- **Framework**: Next.js 15 with App Router
- **UI**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom theming system
- **Authentication**: Supabase Auth with SSR middleware
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand, TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Rich Text**: Tiptap editor with syntax highlighting (Shiki)
- **Code Editor**: Monaco Editor for code editing
- **Charts**: Recharts for data visualization
- **Calendar**: FullCalendar for scheduling
- **Drag & Drop**: Multiple libraries (@dnd-kit, @hello-pangea/dnd)
- **Payments**: Stripe integration
- **AI Integration**: OpenAI for chat and content generation

### Key Directory Structure

```
app/                    # Next.js 15 App Router pages
├── api/               # API routes
│   ├── ai/           # AI-related endpoints (SQL generation)
│   ├── notifications/ # Notification management APIs
│   ├── stripe/       # Payment webhook handling
│   └── supabase-proxy/ # Supabase proxy for secure access
├── auth/              # Authentication pages (login, callback)
├── dashboard/         # Main dashboard pages
├── settings/          # User settings and profile
├── workspace/         # Core workspace functionality
│   ├── file-manager/  # File management interface
│   ├── files/         # File listing and operations
│   └── jobs/          # Job/task monitoring
├── admin/             # Admin panel
└── protected/         # Protected route wrappers

components/            # Reusable UI components
├── ui/               # shadcn/ui base components
├── layout/           # Layout components (header, sidebar, etc.)
└── theme-customizer/ # Theme customization components

lib/                   # Utility libraries and configurations
├── auth.ts           # Supabase auth configuration
├── middleware.ts     # Session management for protected routes
├── themes.ts         # Custom theme system
└── utils.ts          # General utilities

contexts/             # React contexts for global state
hooks/                # Custom React hooks
```

### Authentication & Security

The app uses **Supabase Auth** with SSR middleware for session management:

- `middleware.ts` - Handles authentication state across all routes
- `lib/middleware.ts` - Core session update logic with Supabase SSR
- **Protected routes**: All routes except `/auth/*` require authentication
- **Auto-redirect**: Unauthenticated users are redirected to `/auth/login`

### Role-Based Access Control (RBAC)

**Admin Detection Pattern:**

The application implements role-based access control using the `isUserAdmin()` function from `lib/admin.ts`:

```typescript
import { isUserAdmin } from "@/lib/admin";

// Component-level admin checking
const [isAdmin, setIsAdmin] = useState<boolean>(false);

useEffect(() => {
  const checkAdminStatus = async () => {
    const adminStatus = await isUserAdmin();
    setIsAdmin(adminStatus);
  };
  checkAdminStatus();
}, []);

// Conditional rendering based on admin status
if (route.title === "Admin" && !isAdmin) {
  return false; // Hide admin sections from non-admin users
}
```

**Implementation Examples:**

1. **Command Palette Filtering** (`components/layout/header/search.tsx:78-84`):
   - Admin navigation sections hidden from non-admin users
   - Uses async admin status checking with state management

2. **Database-level Security** (`supabase/migrations/20240101000015_helper_functions.sql`):
   - `is_application_admin(user_id)` - Check if user has app-level admin role
   - `is_workspace_admin(user_id, workspace_id)` - Check workspace-specific admin rights
   - `is_workspace_member(user_id, workspace_id)` - Verify workspace membership

**RBAC Best Practices:**

- Always check admin status asynchronously in `useEffect`
- Filter UI components client-side for better UX
- Enforce permissions server-side via RLS policies
- Use database helper functions for consistent permission checking

### Theme System

Custom theming system supporting:

- Multiple color presets
- Scale variations
- Border radius settings
- Content layout options
- Persistent theme settings via cookies

### File Management Architecture

The workspace includes sophisticated file management:

- **File Manager**: Main dashboard for file operations and storage
- **File Upload**: Drag-and-drop interface with progress tracking
- **Job Monitoring**: Track file processing and background tasks
- **Multi-cloud support**: Integration with Google Drive, S3, GCS, Dropbox

### Notification System Architecture

Real-time notification system with comprehensive management:

- **Type-safe notifications**: Three types supported (info, warning, error)
- **Real-time updates**: Supabase subscriptions for instant notifications
- **API endpoints**: Complete CRUD operations via `/api/notifications`
- **Custom hooks**: `useNotifications`, `useRealtimeNotifications`, `useCreateNotification`
- **Optimistic updates**: Immediate UI feedback with rollback on failure
- **Bulk operations**: Mark all as read, bulk delete functionality
- **Schema enhancements**: Recent migration adds type, message, and link fields

### AI Chat Persistence System

**Complete Implementation (AI SDK 5 Compatible):**

The application includes a full-featured chat persistence system that automatically saves conversations to the database:

**Architecture:**
- **Database Table**: `chats` table stores conversation history with UIMessage[] format
- **Auto-save**: Messages automatically saved after each AI response via `onFinish` callback
- **Chat Sessions**: Each conversation has a unique ID generated with AI SDK's `generateId()`
- **Metadata Tracking**: Stores model info, token counts, message counts, and timestamps

**Key Files:**
- `lib/types/chat.ts` - TypeScript interfaces for chat persistence
- `app/api/chat/sessions/route.ts` - Create and list chat sessions (POST/GET)
- `app/api/chat/sessions/[id]/route.ts` - Load, update, delete individual chats (GET/PUT/DELETE)
- `app/api/chat/route.ts` - Main chat endpoint with auto-save via `onFinish`
- `components/chat/chat-history-sidebar.tsx` - UI for browsing and loading past conversations
- `app/workspace/ai-chat/app-render.tsx` - Main chat interface with session management

**Database Schema (`chats` table):**
```sql
- id (text) - Unique chat session ID
- user_id (uuid) - Owner of the chat
- project_id (uuid, nullable) - Optional project association
- title (text) - Chat session title (auto-generated from first message)
- messages (jsonb) - Array of UIMessage objects from AI SDK 5
- metadata (jsonb) - {model, totalTokens, promptTokens, completionTokens, messageCount}
- created_at (timestamp) - Session creation time
- updated_at (timestamp) - Last message time (auto-updated via trigger)
```

**Features:**
- ✅ Automatic chat creation on first message
- ✅ Real-time message persistence after each response
- ✅ Chat history sidebar with delete functionality
- ✅ Load previous conversations
- ✅ New chat button to start fresh sessions
- ✅ Support for text + image generation messages
- ✅ Token usage tracking and metadata
- ✅ Row Level Security (RLS) policies for user data isolation

**Usage Pattern:**
```typescript
// Chat component automatically handles persistence
const { messages, sendMessage } = useChat({
  api: "/api/chat",
  body: { chatId: currentChatId } // Pass chat ID for auto-save
});

// Create new chat session
const response = await fetch("/api/chat/sessions", {
  method: "POST",
  body: JSON.stringify({ messages, metadata })
});

// Load existing chat
const response = await fetch(`/api/chat/sessions/${chatId}`);
const { messages } = await response.json();
setMessages(messages);
```

**Migration File:**
- `20240101000006_ai_chat_system_tables.sql` - Complete chat table with AI SDK 5 support (consolidated)

### Database Integration

- **Supabase**: Primary database and auth provider
- **Migrations**: Database migrations stored in `/supabase/migrations` (23 migration files with consolidated schema)
- **Admin Panel**: Built-in database management interface
- **Real-time**: Leverages Supabase real-time subscriptions for live updates
- **Edge Functions**: 21 Supabase Edge Functions for media processing and file operations
- **Schema Organization**: Migrations are numbered 000-022 covering core system, billing, storage, and AI chat persistence

### Supabase Edge Functions Architecture

The application uses 21 Supabase Edge Functions for comprehensive media processing and system operations:

**Media Processing Functions:**

- `media-convert` - General media format conversion
- `media-convert-mp3` - Specialized MP3 audio conversion
- `media-transcribe` - Audio/video transcription
- `media-silence` - Audio silence detection and processing
- `video-caption` - Video captioning and subtitle generation
- `video-cut`, `video-split`, `video-trim` - Video editing operations
- `video-thumbnail` - Thumbnail generation from video content
- `image-convert-video` - Convert images to video format
- `audio-concatenate`, `video-concatenate` - Media file concatenation

**File Operations:**

- `file-upload` - Secure file upload handling with progress tracking
- `s3-upload` - Cloud storage integration for external providers
- `media-download` - File download management and serving
- `media-metadata` - Extract metadata from media files

**System Functions:**

- `ffmpeg-compose` - Advanced video composition and effects
- `code-execute-python` - Remote Python code execution environment
- `ncat-webhook` - NCA Toolkit API webhook handler for processing jobs
- `stripe-webhook` - Payment processing and subscription webhooks
- `send-email` - Email delivery system with custom template support

**Function Development Notes:**

- All functions integrate with NCA Toolkit API for processing
- Edge Functions handle authentication via JWT tokens
- Real-time job status updates via Supabase subscriptions
- Error handling and retry logic built into each function

**Webhook Handler Improvements (`stripe-webhook` function):**

1. **Duplicate Event Prevention**:
   - Tracks processed events in `stripe_webhook_events` table
   - Prevents duplicate processing of same Stripe event
   - Returns early with success status for already-processed events

2. **Race Condition Handling**:
   - Built-in retry logic for foreign key constraint failures
   - Automatic 1-2 second delays when products/customers don't exist yet
   - Graceful handling of webhook event ordering issues

3. **Robust Date Handling**:
   - Safe timestamp conversion with null checks and validation
   - Fallback date generation for invalid Stripe timestamps
   - Proper monthly period calculation for subscription billing cycles

4. **Error Recovery Patterns**:
   ```typescript
   // Example: Price sync with product dependency retry
   if (error.code === "23503" && error.details?.includes("billing_products")) {
     console.warn("Product not found, retrying after delay...");
     await new Promise(resolve => setTimeout(resolve, 1000));
     // Retry the operation once
   }
   ```

5. **upsert() Best Practices**:
   - Always specify `onConflict` parameter for proper upsert behavior
   - Use appropriate conflict resolution columns for each table
   - Handle both insert and update scenarios gracefully

### API Integration

- **NCA Toolkit API**: Primary external API for media processing
- **Stripe**: Payment processing and subscription management
- **OpenAI**: AI chat and content generation features
- **Resend**: Email delivery service for transactional emails (confirmation, notifications)

## Environment Requirements

- **Node.js**: Version 22.18.0 required (see `.nvmrc` for exact version)
- **Environment files**:
  - `.env.local` for development
  - `.env.test` for testing

### Next.js Configuration

Key configuration details in `next.config.ts`:

- **Image domains**: Configured for localhost and bundui-images.netlify.app
- **Environment loading**: Automatic dotenv configuration
- **Production optimizations**: Environment-specific settings

## Environment Configuration

### Local Testing Environment Variables

For local development, create a `.env.local` file in the project root:

```bash
# ================================
# SUPABASE CONFIGURATION (REQUIRED)
# ================================
# Your Supabase project URL (Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Supabase anonymous key (Project Settings > API)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase service role key (Project Settings > API) - KEEP SECRET!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ================================
# STRIPE CONFIGURATION (REQUIRED FOR BILLING)
# ================================
# Stripe TEST keys (Developers > API Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...

# Stripe webhook signing secret (generated by Stripe CLI)
# Get this by running: stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook
STRIPE_WEBHOOK_SIGNING_SECRET=whsec_...

# No hardcoded price IDs needed - system uses dynamic database queries

# ================================
# LOCAL DEVELOPMENT SETTINGS
# ================================
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres

# ================================
# OPTIONAL - FOR ADDITIONAL FEATURES
# ================================
# OpenAI for AI features
OPENAI_API_KEY=sk-...

# Resend for custom emails
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com

# NCAT API for media processing
NCAT_API_URL=https://your-ncat-api-url.com
NCAT_API_KEY=your-ncat-api-key
```

### Local Testing Requirements

**What you need for local development:**

1. **Local Supabase Stack**:

   ```bash
   npx supabase start  # Starts local PostgreSQL, Studio, Edge Functions
   ```

2. **Stripe CLI** (for webhook testing):

   ```bash
   stripe login
   stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook
   ```

3. **Development Server**:
   ```bash
   npm run dev  # Runs on port 3000
   ```

**Local Testing Services:**

- **Supabase Studio**: http://localhost:54323 (database management)
- **Edge Functions**: http://localhost:54321 (webhook endpoints)
- **Dev Server**: http://localhost:3000 (application)

### Production Environment Variables

For production deployment, you need to configure variables in **TWO** places:

#### 1. Supabase Edge Function Secrets

Go to your [Supabase Dashboard Functions Settings](https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/functions):

```bash
# Edge Function Secrets (for webhook processing)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SIGNING_SECRET=whsec_your_production_webhook_secret
NCAT_API_URL=https://your-production-ncat-api.com
NCAT_API_KEY=your_production_ncat_api_key
OPENAI_API_KEY=sk-your_openai_key
RESEND_API_KEY=re_your_resend_key
FROM_EMAIL=noreply@yourdomain.com
```

#### 2. Hosting Platform Environment Variables

**For Netlify/Vercel** (client-side and API routes):

```bash
# Public variables (exposed to client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Server-side secrets
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
OPENAI_API_KEY=sk-your_openai_key
RESEND_API_KEY=re_your_resend_key
```

### Production Webhook Configuration

**Stripe Webhook Setup:**

1. Go to [Stripe Dashboard Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook`
3. Select events: `customer.*`, `invoice.*`, `product.*`, `price.*`, `customer.subscription.*`
4. Copy the signing secret to both Edge Function Secrets AND hosting platform variables

### Environment Variable Notes

**🔑 Key Points:**

- **Local**: Use TEST keys (pk*test*, sk*test*)
- **Production**: Use LIVE keys (pk*live*, sk*live*)
- **Webhook Secret**: Different for local (Stripe CLI) vs production (Dashboard)
- **Service Role Key**: Same for local and production (handle with extreme care)
- **NCAT API**: Only URL and key needed, no complex configuration required

## Code Quality & Standards

### Prettier Configuration

The project uses Prettier for code formatting with these settings in `.prettierrc`:

- Semi-colons: enabled
- Tab width: 2 spaces
- Print width: 100 characters
- Single quotes: disabled (uses double quotes)
- Trailing commas: disabled
- JSX brackets on same line: enabled
- Tailwind CSS plugin: enabled for class sorting

### ESLint Configuration

Uses Next.js default ESLint configuration with custom plugins:

- ESLint plugin for readable Tailwind CSS classes (`eslint-plugin-readable-tailwind`)
- Standard Next.js rules with some customizations
- Configuration managed through Next.js built-in ESLint setup

### Testing

The project uses **Playwright** for end-to-end testing:

- `npx playwright test` - Run all E2E tests
- `npx playwright test --ui` - Run tests with interactive UI
- `npx playwright test --debug` - Run tests in debug mode
- `npx playwright test --headed` - Run tests with visible browser
- `npx playwright install` - Install required browsers

**Test Configuration:**

- Tests located in `tests/e2e/` directory
- Configuration in `playwright.config.js`
- Default test server runs on `http://localhost:3000`
- Supports video recording and screenshots on failure
- HTML reports generated in `playwright-report/`

**Running Single Test:**

```bash
npx playwright test tests/e2e/user-signup-flow.spec.js
```

## Important Development Notes

### Authentication Flow

All routes are protected by default except authentication routes. The middleware automatically handles session validation and redirects unauthenticated users.

**Complete Authentication Flow:**

1. **Sign Up**: User creates account via `/auth/login` (unified form)
2. **Email Confirmation**: User receives email with confirmation link
3. **Email Verification**: User clicks link, redirected to `/auth/callback`
4. **Onboarding**: New users directed to `/auth/onboarding` for organization setup
5. **Billing Setup**: Free subscription automatically created during onboarding
6. **Dashboard Access**: User redirected to `/workspace/file-manager`

**Middleware Protection:**

1. `middleware.ts` intercepts all requests except static files and API routes
2. `lib/middleware.ts` creates Supabase SSR client and validates session
3. **Unconfirmed users** redirected to `/auth/sign-up-success`
4. **Unauthenticated users** redirected to `/auth/login`
5. **New users** (with default workspace names) redirected to onboarding
6. Session cookies automatically managed for seamless authentication

**Email Confirmation System:**

- Custom email templates in `lib/email-templates/`
- Resend functionality built into confirmation page
- 24-hour expiration for confirmation links
- Automatic routing to onboarding after confirmation

**CRITICAL: Email Confirmation URL Configuration**

The `supabase/config.toml` file MUST be configured correctly for email confirmations to work:

```toml
[auth]
site_url = "http://localhost:3000"  # For local development
additional_redirect_urls = ["http://localhost:3000"]  # Match site_url
```

**Common Issues & Solutions:**

1. **Issue**: Email links use `127.0.0.1:3000` instead of `localhost:3000`
   - **Cause**: `site_url` in `config.toml` set to `127.0.0.1`
   - **Fix**: Change to `localhost:3000` and restart Supabase (`npx supabase stop && npx supabase start`)

2. **Issue**: Confirmation code appears in URL on homepage (`/?code=...`)
   - **Cause**: `emailRedirectTo` pointing to wrong route (e.g., `/auth/confirm` instead of `/auth/callback`)
   - **Fix**: Ensure `unified-auth-form.tsx` uses `/auth/callback`:
     ```typescript
     emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/onboarding`
     ```

3. **Issue**: Authenticated users see homepage instead of workspace
   - **Cause**: Homepage not checking authentication status
   - **Fix**: Already implemented - middleware and server-side checks redirect authenticated users

**After changing `supabase/config.toml`:**
```bash
npx supabase stop
npx supabase start
# Wait for services to fully start before testing
```

### Development Workflow

**Initial Setup (CRITICAL ORDER):**

1. Ensure Node.js 22.18.0 is installed (check `.nvmrc`)
2. Run `npm install --legacy-peer-deps`
3. Set up all required environment variables in `.env.local` (see Environment Variables section)
4. **Start Supabase local stack**: `npx supabase start`
5. **Serve Edge Functions**: `npx supabase functions serve`
6. **Apply database migrations**: `npx supabase db push`
7. **Generate TypeScript types**: `npm run update-types`
8. **Install and authenticate Stripe CLI**: `stripe login`
9. **Forward Stripe webhooks**: `stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook`
10. **Sync Stripe products to database**: `stripe trigger product.created` (repeat as needed)
11. **Run development server**: `npm run dev` (on port 3000)

⚠️ **IMPORTANT**: Steps 4-5 must complete successfully before step 9, or webhooks will fail!

**Database Workflow:**

1. Migrations are stored in `/supabase/migrations/` with numbered prefixes
2. Apply migrations: `npx supabase db push`
3. Generate types after schema changes: `npm run update-types`
4. Database changes should always include proper RLS policies

**Common Development Tasks:**

- Format code: `npx prettier --write .`
- Lint code: `npm run lint`
- Build project: `npm run build`
- Start production: `npm run start`

### Development Workflow for New Features/Changes

**⚠️ CRITICAL: Follow this exact sequence when making changes to ensure code quality and database consistency:**

#### 1. Pre-Development Setup

```bash
# Ensure all services are running
npx supabase start
npx supabase functions serve
stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook
npm run dev
```

#### 2. Code Quality Checks (Before Making Changes)

```bash
# 1. Lint check - Fix any linting errors before proceeding
npm run lint

# 2. Build check - Ensure current codebase builds successfully
npm run build

# 3. Type check - Verify TypeScript types are correct
npm run update-types
```

#### 3. Make Your Changes

- Edit files as needed
- Follow existing code conventions and patterns
- Test changes locally in the browser

#### 4. Database Changes (If Applicable)

If you modified database schema or migrations:

```bash
# Push database changes to local Supabase
npx supabase db push

# Update TypeScript types after schema changes
npm run update-types

# Verify database structure in Supabase Studio
# Open http://localhost:54323 to check tables and relationships
```

#### 5. Code Quality Validation (After Changes)

```bash
# 1. Format code to ensure consistent styling
npx prettier --write .

# 2. Run linting and fix any issues
npm run lint

# 3. Build project to catch compilation errors
npm run build

# 4. Run tests (if applicable)
npx playwright test
```

#### 6. Final Verification

```bash
# Start fresh development server to test changes
npm run dev

# Test functionality in browser at http://localhost:3000
# Verify all features work as expected
```

#### 7. Edge Function Development (If Applicable)

If you're working on Supabase Edge Functions:

```bash
# Serve functions locally
npx supabase functions serve

# Deploy specific function for testing
npx supabase functions deploy function-name

# Monitor function logs
npx supabase functions logs function-name
```

#### 8. Stripe Integration Testing (If Applicable)

If changes affect billing or subscriptions:

```bash
# Test product sync
stripe trigger product.created

# Test subscription creation
stripe trigger customer.subscription.created

# Monitor webhook processing
stripe logs tail

# Verify data in Supabase Studio billing tables
```

### Pre-Commit Checklist

Before committing any changes, ensure:

- [ ] `npm run lint` passes without errors
- [ ] `npm run build` completes successfully
- [ ] `npx prettier --write .` has been run
- [ ] Database migrations are applied (`npx supabase db push`)
- [ ] TypeScript types are updated (`npm run update-types`)
- [ ] All tests pass (`npx playwright test` if applicable)
- [ ] Local development server runs without errors
- [ ] Browser testing confirms features work as expected
- [ ] Stripe webhooks process correctly (if billing changes made)

### Database Migration Workflow

When creating or modifying database schema:

```bash
# 1. Create migration file (if needed)
# Edit existing migration files in /supabase/migrations/
# Current schema includes 23 migrations (000-022)

# 2. Apply migrations locally
npx supabase db push

# 3. Update TypeScript types
npm run update-types

# 4. Test in Supabase Studio
# Visit http://localhost:54323 to verify schema

# 5. Test RLS policies
# Ensure Row Level Security policies work correctly

# 6. Test with application
# Verify frontend components work with schema changes
```

**Migration Organization:**
- `000-001`: Core Supabase setup and extensions
- `002-008`: Core system tables (enums, users, workspaces, projects, AI chat, marketing, feedback)
- `009`: Billing system tables with Stripe integration
- `010-014`: Settings, storage, and security policies
- `015-022`: Helper functions, RLS policies, and job tracking

### Edge Function Development Workflow

For Supabase Edge Functions:

```bash
# 1. Create new function
npx supabase functions new function-name

# 2. Develop locally
npx supabase functions serve function-name

# 3. Test function endpoint
# Use curl, Postman, or frontend to test

# 4. Deploy to production (when ready)
npx supabase functions deploy function-name

# 5. Monitor logs
npx supabase functions logs function-name
```

**Important Notes:**

- Always test authentication flows when modifying middleware
- Test email confirmation flow end-to-end during development
- File uploads require proper Edge Function deployment
- Real-time features depend on Supabase subscriptions
- Media processing functions require NCA Toolkit API access
- Billing operations require service role client for security
- Email templates should be tested across different clients

**Critical Development Considerations:**

- **Authentication State**: Middleware handles multiple user states (unconfirmed, new, authenticated)
- **Email Delivery**: Confirmation emails are critical path - ensure SMTP/Resend configuration
- **Onboarding Flow**: Organization setup is required before workspace access
- **Billing Integration**: Free subscription creation is part of user onboarding
- **Error Handling**: Graceful fallbacks for billing failures during onboarding

### Key Development Lessons Learned

**Database Migration Best Practices:**
- **ALWAYS fix migration files directly** for local development (never use workarounds)
- RLS policy column name mismatches should be corrected in helper functions
- Use `npx supabase db push` after every migration file change
- Test migration changes in Supabase Studio before proceeding

**Stripe Integration Patterns:**
- Create customers during onboarding, NOT in billing portal access
- Always sync products before prices to avoid foreign key constraints
- Use MCP tools to create $0 prices for free plans
- Filter products using metadata (`sync_to_app: true`) to prevent unrelated data sync

**Webhook Development Approach:**
- Implement duplicate event prevention for all webhook handlers
- Add retry logic for race conditions (foreign key constraints)
- Use proper `onConflict` parameters in all upsert operations
- Handle invalid timestamps with fallback date generation

**Component Development Philosophy:**
- Filter technical metadata from user-facing components
- Implement role-based filtering using async admin status checks
- Always divide Stripe amounts by 100 for proper currency display
- Use existing design patterns and components rather than creating new ones

**Error Resolution Methodology:**
1. Read error messages carefully - they usually indicate exactly what's wrong
2. For RLS/database errors, check migration files first
3. For billing errors, verify Stripe product/price sync status
4. For foreign key errors, ensure proper data creation order
5. For UI issues, check if technical metadata is leaking to user interface

**Development Environment Standards:**
- Always run services in correct order: Supabase → Edge Functions → Stripe CLI → Dev Server
- Use consistent port 3000 for all development
- Verify webhook forwarding is working before testing billing features
- Check database tables in Supabase Studio after webhook events

### Component Architecture

- Uses shadcn/ui as the base component library
- Custom components extend Radix UI primitives
- Consistent styling through Tailwind CSS and CSS variables
- Theme customization through data attributes and CSS custom properties

### State Management

- Server state managed through Supabase real-time subscriptions
- Client state through Zustand stores
- Form state via React Hook Form with Zod schema validation

### File Processing

The application handles complex file processing workflows:

- File uploads with progress tracking
- Background job processing and monitoring
- Multi-format media processing through NCA Toolkit API
- Cloud storage integration for file management

### Media Processing Workflow

1. **File Upload**: Files uploaded via drag-and-drop interface to `file-upload` Edge Function
2. **Job Creation**: Processing jobs tracked in `jobs` table with real-time status updates
3. **NCA Toolkit Processing**: Media processed through specialized Edge Functions that call NCA Toolkit API
4. **Storage Integration**: Processed files stored in Supabase Storage or external cloud providers
5. **Real-time Updates**: Job status and file availability updated via Supabase real-time subscriptions

### Database Schema Overview

Key tables include:

- `users` - User accounts and profiles
- `files` - File metadata and storage references
- `jobs` - Background job tracking and status
- `workspaces` - User workspace organization
- `projects` - Project management and organization
- `ai_chats` - AI conversation history
- **Billing tables:**
  - `billing_customers` - Stripe customer records linked to workspaces
  - `billing_subscriptions` - Subscription status and metadata
  - `billing_products` - Product catalog synced from Stripe
  - `billing_prices` - Pricing information synced from Stripe
- Various settings and configuration tables

### Billing System Architecture

**Subscription Management:**

- **Free Plan Integration**: Automatic free subscription creation during onboarding
- **Stripe Integration**: Full webhook synchronization for real-time updates
- **Customer Portal**: Users can manage subscriptions via `/billing` page
- **API Endpoint**: `/api/billing/subscription` handles subscription creation

**Key Features:**

- Automatic Stripe customer creation during onboarding
- Dynamic price resolution: System automatically finds free plan ($0 price) from database
- Workspace-based billing (one subscription per workspace)
- Service role client for secure database operations
- Comprehensive error handling and rollback logic

**Testing Billing:**

1. Use Stripe CLI for local webhook forwarding
2. Trigger test events: `stripe trigger customer.subscription.created`
3. Monitor webhook logs: `stripe logs tail`
4. Verify database sync in Supabase Studio

### Email Template System

**Template Architecture:**

- Email templates located in `lib/email-templates/`
- Separate functions for HTML and plain text versions
- Responsive design with inline CSS for compatibility
- Consistent branding and styling across all emails

**Available Templates:**

- `confirmation.ts` - Email confirmation template with branded styling
- Supports dynamic content injection (URLs, user data)
- Mobile-responsive design with fallback support

**Usage Pattern:**

```typescript
import {
  generateConfirmationEmailHtml,
  generateConfirmationEmailText
} from "@/lib/email-templates/confirmation";

const htmlContent = generateConfirmationEmailHtml({
  confirmationUrl,
  userEmail
});
```

## Troubleshooting Guide

### Critical Billing System Issues

#### "Free plan not available" Error During Onboarding

**Problem**: User signup fails with "Free plan not available. Please contact support."

**Root Cause**: Missing $0 price in database for free plan product

**Solution**:
1. Check if free plan product exists: Use Stripe MCP to list products
2. Create $0 price for free plan:
   ```bash
   # Use Stripe MCP to create price with amount: 0, currency: "usd"
   # Or use Stripe CLI: stripe prices create --unit-amount=0 --currency=usd --product=prod_xxx
   ```
3. Verify webhook sync: Check `billing_prices` table has amount=0 entry

#### Foreign Key Constraint Violations in Billing

**Problem**: `foreign key constraint fails...billing_products` during webhook processing

**Root Cause**: Race condition - prices syncing before products exist

**Solution**:
1. Always sync products before prices:
   ```bash
   stripe trigger product.created
   stripe trigger price.created
   ```
2. Webhook handler has built-in retry logic for this issue
3. Verify products exist in `billing_products` table before testing subscriptions

#### "Column 'role' does not exist" RLS Policy Error

**Problem**: Database queries fail with role column reference error

**Root Cause**: RLS policy using incorrect column name `role` instead of `workspace_member_role`

**Solution**:
1. **ALWAYS fix in migration files** (best practice for local development)
2. Edit `supabase/migrations/20240101000015_helper_functions.sql`
3. Change `role` to `workspace_member_role` in all helper functions
4. Apply with `npx supabase db push`

**CRITICAL**: Never use workarounds - fix migration files directly for local development

#### Billing Portal Access Issues

**Problem**: "No valid Stripe customer found" when accessing billing portal

**Root Cause**: Customer creation should happen during onboarding, not portal access

**Best Practice**:
- Create Stripe customers during user onboarding in `/api/billing/subscription`
- Billing portal should only lookup existing customers
- Use service role client to bypass RLS when needed for existing customer queries

### Subscription Not Showing Issue

If subscriptions exist in Stripe but don't display in the application:

1. **Check Products Sync**: Ensure `billing_products` table has data

   ```bash
   stripe trigger product.created
   ```

2. **Check Webhook Logs**: Monitor Stripe webhook forwarding for errors

   ```bash
   stripe logs tail
   ```

3. **Verify RLS Policies**: Ensure billing tables have proper Row Level Security policies

4. **Common Error**: `Foreign key constraint violation` means products aren't synced
   - Sync products first, then subscriptions will work

### Product Filtering Strategy

To prevent syncing unrelated Stripe products to your database:

1. **Add metadata to products you want to sync** in Stripe Dashboard:

   ```json
   {
     "sync_to_app": "true",
     "app_name": "ncat-saas"
   }
   ```

2. **Webhook handler automatically filters** products without this metadata

3. **For existing products**: Update them with the metadata to enable sync

### Stripe Prices Not Syncing to Database

**Problem**: Products are synced but prices aren't appearing in `billing_prices` table

**Root Cause**: Edge Functions not running when webhook events are triggered

**Solution**:

1. **Ensure Edge Functions are running**:
   ```bash
   npx supabase functions serve
   # Keep this terminal running - DO NOT close it
   ```

2. **Verify Stripe CLI is forwarding webhooks**:
   ```bash
   stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook
   # Keep this terminal running in a separate window
   ```

3. **Trigger price sync webhooks**:
   ```bash
   # Update each price to trigger price.updated webhook
   stripe prices update price_YOUR_PRICE_ID -d "metadata[tier]=free"
   stripe prices update price_YOUR_PRICE_ID -d "metadata[tier]=pro"
   ```

4. **Check Edge Function logs** for sync confirmation:
   ```
   [Info] 🔔 Event received: evt_XXX - price.updated
   [Info] ✅ Price price_1SCQNWCCFNRAwpJsa20Nj8Mj synced
   ```

5. **Verify in database**:
   - Open Supabase Studio: http://localhost:54323
   - Check `billing_prices` table
   - Should see prices with correct `amount` values (in cents)

**CRITICAL REMINDERS**:
- Edge Functions (`npx supabase functions serve`) MUST be running BEFORE triggering webhooks
- Both Stripe CLI and Edge Functions must stay running during development
- If you restart Supabase, you must also restart Edge Functions

### Syncing Existing Stripe Products

If you have existing products in Stripe that need to be synced:

#### Method 1: Add Metadata and Trigger Webhooks
1. **Add sync metadata to existing products** in Stripe Dashboard:
   - Go to Products in Stripe Dashboard
   - Edit each product you want to sync
   - Add metadata: `sync_to_app` = `true`, `app_name` = `ncat-saas`

2. **Trigger webhook events** to sync existing products:
   ```bash
   # For each existing product, trigger update event
   stripe products update prod_YOUR_PRODUCT_ID --metadata[sync_to_app]=true --metadata[app_name]=ncat-saas

   # This automatically triggers product.updated webhook
   # Repeat for each price associated with the product
   stripe prices update price_YOUR_PRICE_ID --metadata[tier]=free
   ```

#### Method 2: Use Stripe MCP (Recommended)
1. **List existing products**: Use Stripe MCP to see what products exist
2. **Update metadata**: Use Stripe MCP to add sync metadata to desired products
3. **Verify sync**: Check `billing_products` and `billing_prices` tables in Supabase Studio

### UI/UX Issues in Billing Components

#### Technical Metadata Showing in Plan Features

**Problem**: Raw technical data like `sync_to_app` showing in subscription status

**Solution**: Filter technical metadata in billing components:
```typescript
// Filter out technical metadata
const filteredFeatures = Object.entries(features).filter(([key]) =>
  !key.startsWith('sync_') &&
  !key.includes('_to_') &&
  !key.includes('app') &&
  key !== 'tier'
);
```

#### Duplicate Dollar Signs and Date Formatting

**Problem**: Price display shows "$$10.00" and dates show same month twice

**Solutions**:
1. **Price formatting**: Remove DollarSign icon when using formatPrice function that already includes $
2. **Stripe amounts**: Always divide by 100 (Stripe uses cents)
3. **Date handling**: Ensure webhook creates proper monthly periods, not duplicate fallback dates

### Port Configuration Issues

All development should use **port 3000** consistently:

- Dev server: `npm run dev` (defaults to 3000)
- Playwright tests: configured for localhost:3000
- No need for PORT=3001 or similar overrides

### Webhook Setup Problems

1. **Ensure services are running in this order:**

   ```bash
   npx supabase start
   npx supabase functions serve
   stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook
   npm run dev
   ```

2. **If webhooks fail**, check Supabase function logs for specific errors

### Database Migration Issues

- Always run `npx supabase db push` after pulling changes
- Regenerate types: `npm run update-types`
- Check migration order and dependencies
