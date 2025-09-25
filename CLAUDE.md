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

- `npx supabase start` - Start local Supabase stack
- `npx supabase stop` - Stop local Supabase stack
- `npx supabase status` - Check local services status
- `npx supabase db push` - Push migrations to database
- `npx supabase functions serve` - Serve Edge Functions locally

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

1. **Install Stripe CLI** from [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. **Login to Stripe**: `stripe login`
3. **Start Supabase locally**: `npx supabase start`
4. **Serve Edge Functions**: `npx supabase functions serve`
5. **Forward webhooks**: `stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook`
6. **Copy webhook signing secret** and add to `.env.local` as `STRIPE_WEBHOOK_SIGNING_SECRET`

#### Testing Product and Price Creation

```bash
# Create a test product
stripe trigger product.created

# Create a test price for that product
stripe trigger price.created

# Verify in Supabase Studio at http://localhost:54323
# Check billing_products and billing_prices tables
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

### Database Integration

- **Supabase**: Primary database and auth provider
- **Migrations**: Database migrations stored in `/supabase/migrations` (25+ migration files)
- **Admin Panel**: Built-in database management interface
- **Real-time**: Leverages Supabase real-time subscriptions for live updates
- **Edge Functions**: 20+ Supabase Edge Functions for media processing and file operations

### Supabase Edge Functions Architecture

The application uses extensive Supabase Edge Functions for media processing:

**Media Processing Functions:**

- `media-convert` - General media format conversion
- `media-convert-mp3` - Specialized MP3 audio conversion
- `media-transcribe` - Audio/video transcription
- `media-silence` - Audio silence detection and processing
- `video-caption` - Video captioning
- `video-cut`, `video-split`, `video-trim` - Video editing operations
- `video-thumbnail` - Thumbnail generation
- `image-convert-video` - Image to video conversion
- `audio-concatenate`, `video-concatenate` - Media concatenation

**File Operations:**

- `file-upload` - Secure file upload handling
- `s3-upload` - Cloud storage integration
- `media-download` - File download management
- `media-metadata` - Metadata extraction

**Utility Functions:**

- `ffmpeg-compose` - Advanced video composition
- `code-execute-python` - Remote Python code execution
- `ncat-webhook` - NCA Toolkit API webhook handler
- `stripe-webhook` - Payment processing webhooks
- `send-email` - Email delivery system (supports custom templates)

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

# Free plan price ID (create in Stripe Dashboard with metadata: sync_to_app: "true")
STRIPE_FREE_PRICE_ID=price_1SAgo7CCFNRAwpJserQa3BZG

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
STRIPE_FREE_PRICE_ID=price_your_live_price_id
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

The project uses Prettier for code formatting with these settings:

- Semi-colons: enabled
- Tab width: 2 spaces
- Print width: 100 characters
- Single quotes: disabled (uses double quotes)
- Trailing commas: disabled
- JSX brackets on same line: enabled
- Tailwind CSS plugin: enabled for class sorting

### ESLint Configuration

Uses Next.js default ESLint configuration with custom plugins:

- ESLint plugin for readable Tailwind CSS classes
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
- Free plan assignment (Price ID: `price_1SAgo7CCFNRAwpJserQa3BZG`)
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
