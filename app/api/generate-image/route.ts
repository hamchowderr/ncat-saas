import { openai } from "@ai-sdk/openai";
import { experimental_generateImage as generateImage } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const { image } = await generateImage({
      model: openai.image("dall-e-3"),
      prompt,
      size: "1024x1024"
    });

    // Return the base64 image
    return Response.json({
      image: `data:image/png;base64,${image.base64}`,
      prompt
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
}