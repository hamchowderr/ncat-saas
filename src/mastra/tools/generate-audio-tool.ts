import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Audio Generation Tool
 * Calls the generate-audio Edge Function to create voiceovers using ElevenLabs
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Generate Audio Tool
 * Generate high-quality voiceover audio using ElevenLabs text-to-speech
 */
export const generateAudioTool = createTool({
  id: "generate-audio",
  description:
    "Generate high-quality voiceover audio from text using ElevenLabs text-to-speech. Supports multiple voices, languages, and customizable voice settings. Returns a URL to the generated audio file.",
  inputSchema: z.object({
    text: z.string().describe("The text to convert to speech"),
    voiceId: z
      .string()
      .optional()
      .describe(
        "ElevenLabs voice ID (default: Rachel - 21m00Tcm4TlvDq8ikWAM). Check ElevenLabs dashboard for available voices."
      ),
    modelId: z
      .string()
      .optional()
      .describe(
        "ElevenLabs model ID (default: eleven_multilingual_v2). Options: eleven_multilingual_v2, eleven_turbo_v2, eleven_turbo_v2_5"
      ),
    voiceSettings: z
      .object({
        stability: z
          .number()
          .min(0)
          .max(1)
          .optional()
          .describe("Voice stability (0-1, default: 0.5). Higher = more consistent, lower = more variable"),
        similarityBoost: z
          .number()
          .min(0)
          .max(1)
          .optional()
          .describe(
            "Similarity boost (0-1, default: 0.75). Higher = closer to original voice, lower = more creative"
          ),
        style: z
          .number()
          .min(0)
          .max(1)
          .optional()
          .describe("Style exaggeration (0-1, default: 0). Higher = more expressive, lower = more neutral"),
        useSpeakerBoost: z
          .boolean()
          .optional()
          .describe("Enable speaker boost for better audio quality (default: true)")
      })
      .optional()
      .describe("Voice customization settings"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    url: z.string().optional(),
    filePath: z.string().optional(),
    fileId: z.string().optional(),
    error: z.string().optional(),
    warning: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      if (context.userToken) {
        headers["Authorization"] = `Bearer ${context.userToken}`;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-audio`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          text: context.text,
          voice_id: context.voiceId,
          model_id: context.modelId,
          voice_settings: context.voiceSettings
            ? {
                stability: context.voiceSettings.stability,
                similarity_boost: context.voiceSettings.similarityBoost,
                style: context.voiceSettings.style,
                use_speaker_boost: context.voiceSettings.useSpeakerBoost
              }
            : undefined
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Generate audio failed: ${error}`);
      }

      const result = await response.json();

      return {
        success: result.success || true,
        url: result.url,
        filePath: result.file_path,
        fileId: result.file_id,
        warning: result.warning
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate audio: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});
