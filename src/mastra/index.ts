import { Mastra } from "@mastra/core";
import { PostgresStore, PgVector } from "@mastra/pg";
import {
  // NCAT Agents (Production)
  ncatMediaExpertAgent,
  videoProductionAgent,
  jobMonitorAgent,

  // Faceless Video Agents
  storyArchitectAgent,
  mediaGenerationAgent,
  videoAssemblyAgent,
  storyTypeAgent,

  // General Chat Agent
  generalChatAgent
} from "./agents";

/**
 * Main Mastra Configuration
 *
 * This is the central configuration for all Mastra agents, tools, and workflows
 * in the NCAT SaaS application.
 *
 * Storage: PostgreSQL (Supabase) with PgStore for conversations and PgVector for semantic recall
 *
 * Registered Agents (8 total):
 *
 * NCAT AGENTS (Production-Ready):
 * - ncatMediaExpertAgent: Comprehensive media expert with full NCAT API integration
 * - videoProductionAgent: Video editing and production specialist
 * - jobMonitorAgent: Tracks and monitors NCAT processing jobs
 *
 * FACELESS VIDEO AGENTS (Automated Video Generation):
 * - storyArchitectAgent: Transforms stories into scene/shot breakdowns with prompts
 * - mediaGenerationAgent: Orchestrates AI generation (images, audio, video)
 * - videoAssemblyAgent: Assembles all assets into final video with captions
 * - storyTypeAgent: Manages story type configurations and templates
 *
 * GENERAL CHAT AGENT:
 * - generalChatAgent: Default conversational AI with DALL-E image generation
 *
 * Usage:
 * ```typescript
 * import { getMastra } from "@/src/mastra";
 *
 * // Use NCAT Media Expert
 * const mastra = getMastra();
 * const ncatAgent = mastra.getAgent("ncatMediaExpertAgent");
 * const result = await ncatAgent.generate("Convert this video to MP4", {
 *   context: { userToken: "..." }
 * });
 *
 * // Use Story Architect for faceless videos
 * const storyAgent = mastra.getAgent("storyArchitectAgent");
 * const breakdown = await storyAgent.generate("Create a 90-second video about AI");
 * ```
 */

/**
 * Lazy initialization to prevent database connections during build.
 *
 * This pattern ensures that the Mastra instance and PostgresStore are only
 * created when actually needed at runtime, not during the Next.js build process.
 *
 * IMPORTANT: Always use getMastra() function instead of importing mastra directly.
 *
 * Uses globalThis to survive Next.js hot reloads in development mode.
 */
const globalForMastra = globalThis as unknown as {
  mastra: Mastra | undefined;
  storage: PostgresStore | undefined;
};

export function getMastra(): Mastra {
  if (!globalForMastra.mastra) {
    // Reuse PostgresStore singleton to prevent duplicate database connections
    if (!globalForMastra.storage) {
      globalForMastra.storage = new PostgresStore({
        connectionString: process.env.DATABASE_URL!,
        schemaName: "public", // Explicit schema for Mastra tables
      });
    }

    globalForMastra.mastra = new Mastra({
      // Supabase PostgreSQL storage for conversations and memory
      storage: globalForMastra.storage,

      // Disable observability to prevent "AI Tracing instance already registered" errors
      // during Next.js hot reloads in development mode
      // observability: {
      //   default: { enabled: true }
      // },

      // Disable deprecated telemetry warnings
      telemetry: {
        serviceName: "ncat-saas",
        enabled: false
      },

      // Server configuration for mastra dev playground
      server: {
        port: 4111,
        host: 'localhost'
      },

      agents: {
        // NCAT Agents (Production)
        ncatMediaExpertAgent,
        videoProductionAgent,
        jobMonitorAgent,

        // Faceless Video Agents
        storyArchitectAgent,
        mediaGenerationAgent,
        videoAssemblyAgent,
        storyTypeAgent,

        // General Chat Agent
        generalChatAgent
      }
    });
  }

  return globalForMastra.mastra;
}

// Direct export for Mastra CLI compatibility
// The CLI requires full access to all Mastra instance methods
export const mastra = getMastra();
