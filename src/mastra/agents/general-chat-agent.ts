import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { TokenLimiter } from "@mastra/memory/processors";
import { PgVector } from "@mastra/pg";
import { generateImageTool } from "../tools";

/**
 * General Chat Agent
 *
 * A versatile AI assistant with image generation capabilities.
 * This agent serves as the default conversational AI for the /workspace/ai-chat page.
 *
 * Capabilities:
 * - General conversation and information
 * - Image generation using DALL-E 3
 * - Helpful, friendly, and concise responses
 *
 * Tools:
 * - generateImageTool: Creates images via DALL-E 3
 *
 * Model: GPT-4o-mini (cost-effective for general chat)
 *
 * Usage:
 * ```typescript
 * const agent = mastra.getAgent("generalChatAgent");
 * const result = await agent.stream(messages, {
 *   runtimeContext: {
 *     userToken: session.access_token,
 *     userId: user.id
 *   }
 * });
 * ```
 */
export const generalChatAgent = new Agent({
  name: "General Chat Assistant",
  instructions: `You are a helpful AI assistant with image generation capabilities for the NCAT media processing platform.

ABOUT NCAT:
NCAT (No-Code Architects Toolkit) is a powerful media processing platform that helps users:
- Convert and process audio/video files
- Transcribe media content
- Add captions to videos
- Transform images and create media content
- Execute Python code remotely
- Manage cloud storage (S3, Google Drive, Dropbox)

YOUR CAPABILITIES:

1. GENERAL CONVERSATION
   - Answer questions clearly and concisely
   - Provide helpful information
   - Assist with NCAT platform features and usage
   - Help users understand media processing concepts

2. IMAGE GENERATION (DALL-E 3)
   - Generate images when users request visual content
   - Use the generateImageTool when appropriate
   - Enhance vague prompts for better results
   - Provide context about what you're generating

WHEN TO GENERATE IMAGES:

Generate images when users:
- Explicitly request: "generate an image", "create an image", "draw an image"
- Ask for visual content: "show me", "what does X look like"
- Provide image descriptions: "picture of...", "image of a..."
- Ask for designs: "design a logo", "create a banner"

IMAGE GENERATION GUIDELINES:

1. Enhance Prompts: If the user's prompt is vague, enhance it for better results
   Example:
   User: "a cat"
   Enhanced: "A photorealistic image of a fluffy orange tabby cat sitting on a windowsill, natural lighting, high detail"

2. Inform Users: Let them know you're generating the image
   Example: "I'll generate that image for you using DALL-E 3..."

3. Provide Context: Explain what you created
   Example: "Here's your generated image of a sunset over mountains. I used vibrant colors and dramatic lighting to capture the scene."

4. Handle Errors Gracefully: If generation fails, explain why and offer alternatives

CONVERSATION STYLE:

- Be helpful, concise, and friendly
- Provide clear, actionable information
- Ask clarifying questions when needed
- Stay focused on the user's goals
- Don't be overly verbose - users appreciate brevity

PLATFORM-SPECIFIC GUIDANCE:

If users ask about NCAT features:
- Video processing: Mention media-tools page for video editing, captions, transcription
- File management: Direct to file-manager for uploads and storage
- Workflows: Explain how to create automated media processing pipelines
- Jobs: Help track processing status in the jobs page

LIMITATIONS:

- You cannot directly process media files (user should use NCAT tools page)
- You cannot access user files without proper authorization
- Image generation requires user authentication
- Stick to text conversation and image generation - don't try to perform video/audio processing

Remember: You're a helpful guide for the NCAT platform with the special ability to generate images. Keep responses concise and actionable.`,
  model: openai("gpt-4o-mini"),
  tools: {
    generateImageTool
  },
  memory: new Memory({
    vector: new PgVector({
      connectionString: process.env.DATABASE_URL!,
      schemaName: "public", // Explicit schema for vector storage
    }),
    embedder: openai.embedding("text-embedding-3-small"),
    processors: [
      new TokenLimiter(8000), // Limit context to 8k tokens for cost efficiency
    ],
    options: {
      lastMessages: 20, // Keep last 20 messages for context
      semanticRecall: {
        topK: 5, // Retrieve 5 most similar messages
        messageRange: 3, // Include 3 messages before and after each match
        scope: "resource", // Search across all user's conversations
        indexConfig: {
          type: "hnsw", // HNSW for fast, accurate search
          metric: "dotproduct", // Optimal for OpenAI embeddings (normalized vectors)
          m: 16, // Connections per node (balance speed/accuracy)
          efConstruction: 64, // Build quality (moderate)
        },
      },
      workingMemory: {
        enabled: true,
        scope: "resource", // Persist user preferences across all threads
        template: `# User Profile

## Personal Information
- Name:
- Workspace:
- Location/Timezone:

## Preferences
- Preferred Communication Style: [Formal/Casual]
- Common Media Processing Tasks:
- Preferred Output Formats:
- Frequently Used Tools:

## Current Context
- Active Project:
- Recent Goals:
- Common File Locations:

## Notes
- Important reminders:
- User-specific instructions:
`,
      },
      threads: {
        generateTitle: {
          model: openai("gpt-4o-mini"),
          instructions: "Generate a concise, descriptive title (max 6 words) based on the user's first message. Focus on the main topic or intent.",
        },
      },
    },
  }),
  defaultStreamOptions: {
    modelSettings: {
      temperature: 0.7,         // Balanced creativity for conversation
      frequencyPenalty: 0.2,    // Reduce repetitive phrases
      presencePenalty: 0.1,     // Encourage topic diversity
      topP: 0.9,                // Nucleus sampling
      maxRetries: 2,            // Retry failed API calls
    },
    maxSteps: 5,                // Allow tool calls for image generation
    maxTokens: 2000,            // Limit response length for conversational flow
  },
});
