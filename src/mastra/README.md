# Mastra AI Agent Framework - Implementation Guide

This directory contains the complete Mastra agent framework integration for the NCAT SaaS application, providing AI-powered media processing and automated video generation capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Available Agents](#available-agents)
- [Available Tools](#available-tools)
- [Development Workflow](#development-workflow)
- [Integration Patterns](#integration-patterns)
- [API Usage](#api-usage)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

Mastra v0.20.2 - TypeScript agent framework with 8 production AI agents and 17 NCAT tools integrated with Supabase Edge Functions. Playground at http://localhost:4111.

## Architecture

### Directory Structure

```
src/mastra/
├── agents/
│   ├── index.ts              # Central agent exports
│   ├── general-chat-agent.ts # General chat agent (1 agent)
│   ├── ncat-agents.ts        # NCAT API agents (3 agents)
│   └── faceless-agents.ts    # Faceless video agents (4 agents)
├── tools/
│   ├── index.ts              # Centralized tool exports
│   ├── ncat-tools.ts         # 17 production NCAT API tools
│   ├── generate-image-tool.ts # DALL-E 3 image generation
│   └── generate-audio-tool.ts # ElevenLabs audio generation
├── workflows/
│   └── (future workflow implementations)
├── index.ts                  # Main Mastra configuration
└── README.md                 # This file
```

### Integration

Frontend → `/api/chat` → Mastra agents → Edge Functions → NCAT API → Webhooks → Database

## Available Agents (8 Total)

### 1. General Chat Agent

**General Chat** (`generalChatAgent`)
- Model: GPT-4o | Tools: DALL-E 3 image generation
- Default conversational AI for /workspace/ai-chat
- Supports text chat and image generation via generateImageTool

### 2. NCAT Agents (Production-Ready)

**NCAT Media Expert** (`ncatMediaExpertAgent`)
- Model: GPT-4o | Tools: All 17 NCAT tools
- Comprehensive media processing (convert, transcribe, edit, metadata)

**Video Production** (`videoProductionAgent`)
- Model: GPT-4o-mini | Tools: 7 video tools
- Video editing workflows and platform optimization

**Job Monitor** (`jobMonitorAgent`)
- Model: GPT-4o-mini | Tools: Job status tracking
- Real-time NCAT job monitoring

### 3. Faceless Video Generation Agents

**Story Architect** (`storyArchitectAgent`)
- Model: GPT-4o
- Transforms content into structured video plans (scenes, shots, AI prompts)
- Supports YouTube, TikTok, Instagram, LinkedIn formats

**Media Generation** (`mediaGenerationAgent`)
- Model: GPT-4o-mini | Tools: Image-to-video, job status
- Generates images (DALL-E), audio (ElevenLabs), converts to video

**Video Assembly** (`videoAssemblyAgent`)
- Model: GPT-4o-mini | Tools: Concatenate, captions, job status
- Assembles shots → scenes → final video with captions

**Story Type Manager** (`storyTypeAgent`)
- Model: GPT-4o-mini
- Manages platform templates and configurations

## Available Tools

### NCAT API Tools (17 Production Tools)

**Media (5):** Convert, MP3 convert, transcribe, silence detection, metadata
**Video (7):** Caption, concatenate, cut, split, trim, thumbnail, image-to-video
**Audio (1):** Concatenate
**Storage (1):** S3 upload
**Advanced (2):** FFmpeg compose, Python execution
**Tracking (1):** Job status

All tools integrate with Supabase Edge Functions.

## Development Workflow

```bash
npm run mastra:dev  # Start playground at http://localhost:4111
```

**Usage:**
```typescript
const agent = mastra.getAgent("ncatMediaExpertAgent");
const result = await agent.generate("prompt", { context: { userToken } });
const stream = await agent.stream(messages, { context: { userToken } });
```

### Adding New Tools/Agents

Create tool → Export from `tools/index.ts` → Add to agent
Create agent → Register in `index.ts` → Use via `mastra.getAgent(name)`

See existing tools/agents for reference patterns.

## Integration Patterns

**Chat Interface:** `/workspace/ai-chat-mastra` uses AI SDK `useChat` hook
**API Route:** `/api/chat` selects agent based on `agentName` parameter
**Edge Functions:** All tools call Supabase Edge Functions with user token

## API Usage

```typescript
// Generate
const agent = mastra.getAgent("ncatMediaExpertAgent");
const result = await agent.generate("prompt", { context: { userToken } });

// Stream
const stream = await agent.stream(messages, { context: { userToken } });
return stream.toDataStreamResponse();
```

**HTTP:** POST `/api/chat` with `messages`, `agentName`, `chatId`

## Database Schema

**Faceless Video Tables:**
- `story_types` - Platform templates (YouTube, TikTok, Instagram, LinkedIn)
- `stories` - Main video projects with status tracking
- `scenes` - Scene breakdown within stories
- `shots` - Individual shots with AI prompts and asset URLs

**Relationships:** story_types → stories → scenes → shots

All tables have RLS policies for user/workspace access.

## Deployment

```bash
npx supabase db push           # Apply migrations
npx supabase functions deploy  # Deploy Edge Functions
npx supabase secrets set OPENAI_API_KEY=sk-...
```

Set `OPENAI_API_KEY` in `.env.local` for development and hosting platform for production.

## Troubleshooting

**Agent Not Found:** Check `src/mastra/index.ts` registration
**Tool Fails:** Ensure Edge Functions running (`npx supabase functions serve`)
**Port 4111 in Use:** Kill existing process or change port
**TypeScript Errors:** Run `npm install --legacy-peer-deps`
**Streaming Issues:** Use `stream()` method and return `toDataStreamResponse()`

**Test:** `npm run mastra:dev` → http://localhost:4111

---

Production-Ready: 9 Agents | 17 Tools | Full Edge Function Integration
