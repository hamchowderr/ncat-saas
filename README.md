# NCAT SaaS Dashboard

A modern web interface for the [No-Code Architects Toolkit API](https://github.com/stephengpope/no-code-architects-toolkit). This dashboard provides an intuitive way to interact with the 100% FREE NCA Toolkit API that processes different types of media and eliminates monthly subscription fees by consolidating common API functionalities into a single API.

Built with Next.js 15 and React 19, this interface streamlines advanced media processing, including video editing and captioning, image transformations, cloud storage, and Python code execution.

## What Can It Do?

The dashboard provides easy access to all NCA Toolkit capabilities:
- Convert and process audio files
- Create transcriptions of content
- Add captions to videos
- Perform complex media processing for content creation
- Manage files across multiple cloud services (Google Drive, Amazon S3, Google Cloud Storage, Dropbox)
- Execute Python code remotely
- Advanced image processing and transformations

Easily replace services like ChatGPT Whisper, Cloud Convert, Createomate, JSON2Video, PDF(dot)co, Placid and OCodeKit.

## Dashboard Pages

The NCAT SaaS Dashboard includes the following pages and features:

### Core Dashboard
- **File Manager** - Main dashboard for file management and storage operations
- **Files** - File access and organization interface
- **Jobs** - Task management and job monitoring

### NCA Toolkit Interface
- **Workflows** - Predefined automation workflows including:
  - AI Podcast Creation
  - YouTube ChapterBot
  - Viral Clips from Podcast
  - Reaction Video Creator
  - Content Repurposing Suite

- **Media Tools** - Direct access to NCA Toolkit API endpoints for:
  - Audio/Video conversion and processing
  - Image transformations and editing
  - Media transcription and captioning
  - File format conversions
  - Python code execution

### Communication & AI
- **Chat** - Team communication interface
- **AI Chat** - AI assistance and interaction
- **Image Generator** - AI-powered image creation

### Administration
- **Users List** - User management and administration
- **API Keys** - API key management for NCA Toolkit integration
- **Profile** - User profile management
- **Account** - Account settings and configuration
- **Appearance** - Theme and display customization
- **Notifications** - Alert and notification preferences
- **Display** - Display options and settings

## Prerequisites

Before installing this SaaS dashboard, ensure you have the following:

1. **Docker Desktop**: Required for running Supabase locally. [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. **Deploy the NCAT API**: Follow the installation guide for the [No-Code Architects Toolkit API](https://github.com/stephengpope/no-code-architects-toolkit)
3. **Get your API credentials**: Obtain your NCAT API URL and API key from your deployed instance
4. **Stripe Account**: Set up a Stripe account for payment processing (optional for basic functionality)

## Installation

Follow these steps to get your project up and running locally:

1. Clone the repository:

    ```sh
    git clone https://github.com/hamchowderr/ncat-saas.git
    cd ncat-saas
    ```

2. Install dependencies:

    ```sh
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

   If you encounter any problems installing packages, try adding the `--legacy-peer-deps` or `--force` flag:

    ```sh
    npm install --legacy-peer-deps
    ```

3. Run the development server:

    ```sh
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to view the result.

4. To edit the project, you can examine the files under the app folder and components folder.

## Minimum system requirements

- Node.js version 20 and above.

Note: If you experience problems with versions above Node.js v20, please replace with version v20.

## Production Configuration

### Edge Function Secrets

For production deployment, you need to configure environment variables as Edge Function Secrets in your Supabase Dashboard. Go to your [Supabase Dashboard Functions Settings](https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/functions) and add the following secrets:

#### Required Secrets:

**NCAT API Configuration:**
```
NCAT_API_URL=https://api.nocodearchs.com
NCAT_API_KEY=your_ncat_api_key_here
```

**Stripe Configuration:**
```
STRIPE_API_KEY=sk_live_your_stripe_secret_key_here
STRIPE_WEBHOOK_SIGNING_SECRET=whsec_your_webhook_signing_secret_here
```

#### How to Add Secrets:

1. Go to your Supabase Dashboard: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/functions`
2. Click "Add new secret" for each environment variable
3. Enter the secret name and value
4. Save the configuration

### Stripe Webhook Configuration

You'll also need to configure webhooks in your Stripe Dashboard:

1. Go to your [Stripe Dashboard Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set the endpoint URL: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook`
4. Select the following events to send:
   - `customer.created`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret and add it to your Edge Function Secrets as `STRIPE_WEBHOOK_SIGNING_SECRET`

### Environment Setup Notes:

- **Development**: Use test API keys and webhook secrets
- **Production**: Use live API keys and webhook secrets
- **Security**: Never commit actual API keys to your repository
- **Local Development**: Environment variables can be set in `supabase/functions/.env` for local testing