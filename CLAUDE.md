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

### API Integration

- **NCA Toolkit API**: Primary external API for media processing
- **Stripe**: Payment processing and subscription management
- **OpenAI**: AI chat and content generation features

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

### Required Environment Variables

```bash
# Supabase Configuration (required for authentication and database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key

# Additional variables may be required for:
# - NCA Toolkit API integration
# - Stripe payment processing
# - Cloud storage providers (S3, GCS, etc.)
```

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
**Note**: No testing framework is currently configured in this project.

## Important Development Notes

### Authentication Flow
All routes are protected by default except authentication routes. The middleware automatically handles session validation and redirects unauthenticated users.

**Middleware Flow:**
1. `middleware.ts` intercepts all requests except static files and API routes
2. `lib/middleware.ts` creates Supabase SSR client and validates session
3. Unauthenticated users redirected to `/auth/login`
4. Session cookies automatically managed for seamless authentication

### Development Workflow

**Initial Setup:**
1. Ensure Node.js 22.18.0 is installed (check `.nvmrc`)
2. Run `npm install --legacy-peer-deps`
3. Set up environment variables in `.env.local`
4. Start Supabase local stack: `npx supabase start`
5. Run development server: `npm run dev`

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

**Important Notes:**
- Always test authentication flows when modifying middleware
- File uploads require proper Edge Function deployment
- Real-time features depend on Supabase subscriptions
- Media processing functions require NCA Toolkit API access

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
- Various settings and configuration tables