# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code linting

### Package Management
If encountering package installation issues, use:
```bash
npm install --legacy-peer-deps
```

## Architecture Overview

### Tech Stack
This is a **Next.js 15 + React 19** application that serves as a SaaS dashboard for the No-Code Architects Toolkit API. The project uses:

- **Framework**: Next.js 15 with App Router
- **UI**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom theming system
- **Authentication**: Supabase Auth with SSR middleware
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Rich Text**: Tiptap editor
- **Charts**: Recharts
- **Payments**: Stripe integration

### Key Directory Structure

```
app/                    # Next.js 15 App Router pages
├── api/               # API routes
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

### Database Integration

- **Supabase**: Primary database and auth provider
- **Migrations**: Database migrations stored in `/migrations`
- **Admin Panel**: Built-in database management interface
- **Real-time**: Leverages Supabase real-time subscriptions for live updates

### API Integration

- **NCA Toolkit API**: Primary external API for media processing
- **Stripe**: Payment processing and subscription management
- **OpenAI**: AI chat and content generation features

## Environment Requirements

- **Node.js**: Version 20+ required
- **Environment files**:
  - `.env.local` for development
  - `.env.test` for testing

## Important Development Notes

### Authentication Flow
All routes are protected by default except authentication routes. The middleware automatically handles session validation and redirects unauthenticated users.

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