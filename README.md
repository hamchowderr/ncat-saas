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

- **Media Tools** - NCA Toolkit API endpoints for content creation

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

## Installation

Follow these steps to get your project up and running locally:

1. Clone the repository:

    ```sh
    git clone https://github.com/bundui/shadcn-ui-kit-dashboard.git
    cd shadcn-ui-kit-dashboard
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