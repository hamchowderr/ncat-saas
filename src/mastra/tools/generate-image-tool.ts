import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Generate Image Tool
 *
 * Generates images using DALL-E 3 via the existing Supabase Edge Function.
 * This tool wraps the generate-image Edge Function to make it available to Mastra agents.
 *
 * Usage:
 * - User requests image generation
 * - Agent calls this tool with a prompt
 * - Tool calls the generate-image Edge Function
 * - Edge Function generates image with DALL-E 3
 * - Returns image URL and file ID
 *
 * Authentication:
 * - Requires user token passed via runtimeContext
 * - Tool retrieves token using runtimeContext.get('userToken')
 * - Passes token to Edge Function via Authorization header
 */
export const generateImageTool = createTool({
  id: "generate-image",
  description:
    "Generate images using DALL-E 3. Provide a detailed image description prompt. Returns the generated image URL and file ID. Use this when users ask to 'generate', 'create', or 'draw' an image.",
  inputSchema: z.object({
    prompt: z
      .string()
      .describe(
        "Detailed description of the image to generate. Be specific about style, composition, lighting, and subject matter."
      )
  }),
  outputSchema: z.object({
    success: z.boolean(),
    imageUrl: z.string().optional(),
    fileId: z.string().optional(),
    prompt: z.string(),
    message: z.string()
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // Get user authentication token from runtime context
      const userToken = runtimeContext?.get("userToken") as string | undefined;
      const userId = runtimeContext?.get("userId") as string | undefined;

      if (!userToken) {
        return {
          success: false,
          prompt: context.prompt,
          message:
            "Authentication required. Please ensure you are logged in to generate images."
        };
      }

      // Call the existing generate-image Edge Function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({
          prompt: context.prompt,
          user_id: userId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Image generation failed: ${errorText}`);
      }

      const data = await response.json();

      return {
        success: true,
        imageUrl: data.imageUrl,
        fileId: data.fileId,
        prompt: context.prompt,
        message: `Successfully generated image: ${data.imageUrl}`
      };
    } catch (error) {
      return {
        success: false,
        prompt: context.prompt,
        message: `Failed to generate image: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});
