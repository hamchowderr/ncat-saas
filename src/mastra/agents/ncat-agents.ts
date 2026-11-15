import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { TokenLimiter, ToolCallFilter } from "@mastra/memory/processors";
import { PgVector } from "@mastra/pg";
import {
  // Media Processing Tools
  ncatMediaConvertTool,
  ncatMediaConvertMp3Tool,
  ncatMediaTranscribeTool,
  ncatMediaSilenceTool,
  ncatMediaMetadataTool,

  // Video Processing Tools
  ncatVideoCaptionTool,
  ncatVideoConcatenateTool,
  ncatVideoCutTool,
  ncatVideoSplitTool,
  ncatVideoTrimTool,
  ncatVideoThumbnailTool,
  ncatImageToVideoTool,

  // Audio Processing Tools
  ncatAudioConcatenateTool,

  // Storage Tools
  ncatS3UploadTool,

  // Advanced Tools
  ncatFfmpegComposeTool,
  ncatPythonExecuteTool,

  // Job Tracking Tools
  ncatJobStatusTool
} from "../tools";

/**
 * NCAT Media Expert Agent
 *
 * A comprehensive agent with deep knowledge of all NCAT API capabilities.
 * This agent understands media processing workflows, format conversions,
 * and can recommend optimal processing strategies.
 *
 * Capabilities:
 * - Media format conversion (video, audio, images)
 * - Audio/video transcription and translation
 * - Silence detection and audio analysis
 * - Metadata extraction and file analysis
 * - Video editing (caption, cut, trim, split, concatenate)
 * - Thumbnail generation
 * - Image-to-video conversion with effects
 * - Audio file operations
 * - Cloud storage integration
 * - Advanced FFmpeg compositions
 * - Custom Python processing
 * - Job status tracking
 */
export const ncatMediaExpertAgent = new Agent({
  name: "NCAT Media Expert",
  instructions: `
You are an expert in media processing using the No-Code Architects Toolkit (NCAT) API.

You have comprehensive knowledge of:
- Media file formats (MP4, AVI, MOV, MP3, WAV, PNG, JPG, WebM, etc.)
- Video codecs and compression (H.264, H.265, VP9, AV1)
- Audio formats and quality settings
- Image formats and optimization
- FFmpeg capabilities and advanced video effects
- Media workflow optimization
- Processing time and resource management

Your primary responsibilities:
1. Help users understand NCAT API capabilities
2. Recommend optimal workflows for media processing tasks
3. Execute media operations using NCAT tools
4. Explain technical concepts in simple terms
5. Suggest best practices for quality and performance
6. Track job progress and handle errors gracefully

When responding to requests:
- Ask clarifying questions if the user's needs are unclear
- Explain what operations you're performing and why
- Provide context about file formats, quality, and processing time
- Suggest alternatives if a better workflow exists
- Use the appropriate NCAT tools to execute operations
- Always track job IDs and provide status updates
- Explain any limitations or trade-offs

Available Tools:
- Media conversion (video/audio/image formats)
- Transcription and translation
- Silence detection and analysis
- Metadata extraction
- Video editing (caption, cut, trim, split, concatenate)
- Thumbnail extraction
- Image-to-video conversion with zoom effects
- Audio concatenation
- S3 cloud storage upload
- Advanced FFmpeg compositions
- Custom Python code execution
- Job status tracking

When handling file operations:
- Validate URLs and file formats before processing
- Explain expected processing times
- Recommend appropriate quality settings
- Suggest storage optimization strategies
- Track multiple jobs concurrently

Be helpful, technical when needed, but always keep explanations accessible.
`,
  model: openai("gpt-4o"),
  tools: {
    // Media Processing
    ncatMediaConvertTool,
    ncatMediaConvertMp3Tool,
    ncatMediaTranscribeTool,
    ncatMediaSilenceTool,
    ncatMediaMetadataTool,

    // Video Processing
    ncatVideoCaptionTool,
    ncatVideoConcatenateTool,
    ncatVideoCutTool,
    ncatVideoSplitTool,
    ncatVideoTrimTool,
    ncatVideoThumbnailTool,
    ncatImageToVideoTool,

    // Audio Processing
    ncatAudioConcatenateTool,

    // Storage
    ncatS3UploadTool,

    // Advanced
    ncatFfmpegComposeTool,
    ncatPythonExecuteTool,

    // Job Tracking
    ncatJobStatusTool
  },
  memory: new Memory({
    vector: new PgVector({
      connectionString: process.env.DATABASE_URL!,
      schemaName: "public", // Explicit schema for vector storage
    }),
    embedder: openai.embedding("text-embedding-3-small"),
    processors: [
      new ToolCallFilter(), // Remove tool calls to save tokens on large NCAT responses
      new TokenLimiter(10000), // Limit to 10k tokens for complex workflows
    ],
    options: {
      lastMessages: 15,
      semanticRecall: {
        topK: 4,
        messageRange: 2,
        scope: "resource",
        indexConfig: {
          type: "hnsw", // HNSW for fast, accurate search
          metric: "dotproduct", // Optimal for OpenAI embeddings (normalized vectors)
          m: 16, // Connections per node (balance speed/accuracy)
          efConstruction: 64, // Build quality (moderate)
        },
      },
      workingMemory: {
        enabled: true,
        scope: "resource",
        template: `# Media Processing Context

## User Preferences
- Preferred output formats:
- Quality settings:
- Common workflows:

## Active Jobs
- Current processing tasks:
- Pending operations:

## File Locations
- Frequently used URLs:
- Storage buckets:

## Notes
- Technical requirements:
- Processing history:
`,
      },
      threads: {
        generateTitle: true,
      },
    },
  }),
  defaultStreamOptions: {
    modelSettings: {
      temperature: 0.5,         // More focused for technical precision
      frequencyPenalty: 0.3,    // Reduce repetition in technical explanations
      presencePenalty: 0.2,     // Encourage varied media processing suggestions
      topP: 0.9,                // Nucleus sampling
      maxRetries: 2,            // Retry failed API calls
    },
    maxSteps: 10,               // Allow complex multi-tool workflows
    maxTokens: 3000,            // Higher limit for detailed technical responses
  },
});

/**
 * Video Production Assistant Agent
 *
 * Specialized agent for guiding users through complex video production workflows.
 * Focuses on multi-step video creation, editing, and optimization processes.
 *
 * Best for:
 * - Video editing projects
 * - Multi-clip productions
 * - Subtitle and caption workflows
 * - Video optimization and compression
 * - Format conversions for specific platforms
 */
export const videoProductionAgent = new Agent({
  name: "Video Production Assistant",
  instructions: `
You are a video production specialist focused on helping users create and edit videos efficiently.

Your expertise includes:
- Professional video editing workflows
- Platform-specific video requirements (YouTube, Instagram, TikTok, etc.)
- Video compression and quality optimization
- Subtitle and caption best practices
- Multi-clip editing and assembly
- Video format selection for different use cases
- Audio synchronization and mixing
- Thumbnail creation and optimization

Your role is to:
1. Guide users through video production workflows
2. Recommend optimal video settings for their target platform
3. Execute video editing operations step-by-step
4. Ensure high-quality output with efficient processing
5. Help troubleshoot video-related issues
6. Suggest creative solutions for video projects

When working with users:
- Understand their target platform and audience
- Ask about desired quality, file size, and format requirements
- Explain trade-offs between quality and processing time
- Break complex projects into manageable steps
- Use appropriate NCAT video tools for each operation
- Track multiple video processing jobs
- Provide clear status updates and ETAs

Common workflows you help with:
- Converting videos for different platforms
- Adding captions and subtitles
- Trimming and cutting video segments
- Combining multiple video clips
- Creating video thumbnails
- Optimizing video file sizes
- Extracting audio from videos
- Converting images to video clips

Always prioritize:
- Video quality and clarity
- Efficient processing workflows
- Platform compatibility
- User-friendly explanations
- Professional results

Be conversational, helpful, and guide users to create amazing videos.
`,
  model: openai("gpt-4o-mini"),
  tools: {
    // Video-focused tools
    ncatVideoCaptionTool,
    ncatVideoConcatenateTool,
    ncatVideoCutTool,
    ncatVideoSplitTool,
    ncatVideoTrimTool,
    ncatVideoThumbnailTool,
    ncatImageToVideoTool,

    // Supporting tools
    ncatMediaConvertTool,
    ncatMediaMetadataTool,
    ncatAudioConcatenateTool,
    ncatJobStatusTool
  },
  memory: new Memory({
    vector: new PgVector({
      connectionString: process.env.DATABASE_URL!,
      schemaName: "public", // Explicit schema for vector storage
    }),
    embedder: openai.embedding("text-embedding-3-small"),
    processors: [
      new ToolCallFilter(), // Remove tool calls to save tokens
      new TokenLimiter(8000), // Limit to 8k tokens for video workflows
    ],
    options: {
      lastMessages: 15,
      semanticRecall: {
        topK: 4,
        messageRange: 2,
        scope: "resource",
        indexConfig: {
          type: "hnsw", // HNSW for fast, accurate search
          metric: "dotproduct", // Optimal for OpenAI embeddings (normalized vectors)
          m: 16, // Connections per node (balance speed/accuracy)
          efConstruction: 64, // Build quality (moderate)
        },
      },
      workingMemory: {
        enabled: true,
        scope: "resource",
        template: `# Video Production Context

## Project Details
- Target platform:
- Video dimensions/format:
- Quality requirements:

## Common Operations
- Typical video workflows:
- Preferred caption styles:
- Platform specifications:

## Active Projects
- Current video edits:
- Pending operations:

## Notes
- Platform-specific requirements:
- Quality preferences:
`,
      },
      threads: {
        generateTitle: true,
      },
    },
  }),
  defaultStreamOptions: {
    modelSettings: {
      temperature: 0.6,         // Balanced for video production guidance
      frequencyPenalty: 0.2,    // Reduce repetitive suggestions
      presencePenalty: 0.1,     // Slight topic diversity
      topP: 0.9,                // Nucleus sampling
      maxRetries: 2,            // Retry failed API calls
    },
    maxSteps: 8,                // Allow video editing tool chains
    maxTokens: 2500,            // Medium limit for workflow explanations
  },
});

/**
 * Job Monitor Agent
 *
 * Specialized agent for tracking and monitoring NCAT processing jobs.
 * Provides real-time updates, handles errors, and manages job queues.
 *
 * Best for:
 * - Tracking multiple concurrent jobs
 * - Monitoring long-running operations
 * - Handling job failures and retries
 * - Providing progress updates
 * - Managing job priorities
 */
export const jobMonitorAgent = new Agent({
  name: "Job Monitor",
  instructions: `
You are a job monitoring specialist for the NCAT API processing system.

Your responsibilities:
- Track the status of media processing jobs
- Provide real-time progress updates
- Notify users of job completion or failures
- Explain job statuses and processing stages
- Help troubleshoot failed jobs
- Manage job queues and priorities

You understand:
- NCAT job lifecycle (pending, processing, completed, failed)
- Processing time estimates for different operations
- Common failure reasons and solutions
- Queue management and job prioritization
- Webhook delivery and notification systems

When monitoring jobs:
- Check job status using job IDs
- Explain current processing stage
- Provide estimated completion times
- Alert users to any errors or issues
- Suggest next steps when jobs complete
- Help retry failed operations

Job statuses you track:
- pending: Job queued, waiting to start
- processing: Job actively being processed
- completed: Job finished successfully, results available
- failed: Job encountered an error

When jobs fail:
- Identify the failure reason
- Explain what went wrong in simple terms
- Suggest solutions or alternative approaches
- Help users retry with corrected parameters

When jobs succeed:
- Confirm completion
- Provide result URLs or data
- Suggest next steps in the workflow
- Offer to start related operations

Be proactive:
- Monitor jobs without being asked
- Alert users to important status changes
- Anticipate potential issues
- Suggest optimizations for future jobs

Keep responses:
- Clear and concise
- Focused on actionable information
- Helpful for decision-making
- Timely and relevant

You are the reliable assistant that ensures users never lose track of their processing jobs.
`,
  model: openai("gpt-4o-mini"),
  tools: {
    ncatJobStatusTool
  },
  memory: new Memory({
    vector: new PgVector({
      connectionString: process.env.DATABASE_URL!,
      schemaName: "public", // Explicit schema for vector storage
    }),
    embedder: openai.embedding("text-embedding-3-small"),
    processors: [
      new ToolCallFilter(), // Remove tool call history for job status
      new TokenLimiter(6000), // Limit to 6k tokens for high-volume job tracking
    ],
    options: {
      lastMessages: 25, // More context for job tracking
      semanticRecall: {
        topK: 6,
        messageRange: 2,
        scope: "resource",
        indexConfig: {
          type: "hnsw", // HNSW for fast, accurate search
          metric: "dotproduct", // Optimal for OpenAI embeddings (normalized vectors)
          m: 16, // Connections per node (balance speed/accuracy)
          efConstruction: 64, // Build quality (moderate)
        },
      },
      workingMemory: {
        enabled: true,
        scope: "resource",
        template: `# Job Tracking Context

## Active Jobs
- Current job IDs:
- Job statuses:
- Expected completion times:

## Recent Jobs
- Recently completed:
- Failed jobs (for retry):

## Patterns
- Common processing types:
- Typical wait times:
- Recurring issues:

## Notes
- Important job alerts:
- Job priorities:
`,
      },
      threads: {
        generateTitle: true,
      },
    },
  }),
  defaultStreamOptions: {
    modelSettings: {
      temperature: 0.3,         // Very focused for factual job status
      frequencyPenalty: 0.1,    // Minimal penalty for status updates
      presencePenalty: 0,       // No topic diversity needed
      topP: 0.9,                // Nucleus sampling
      maxRetries: 2,            // Retry failed API calls
    },
    maxSteps: 3,                // Simple status check tool calls
    maxTokens: 1000,            // Concise updates only
  },
});
