// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { experimental_generateImage as generateImage } from "ai";
import { openai } from "@ai-sdk/openai";

interface ImageRequest {
  prompt: string;
  chatId?: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      }
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization header missing" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Extract JWT token
    const token = authHeader.replace("Bearer ", "");

    // Create supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify the user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Parse request body
    const { prompt, chatId } = (await req.json()) as ImageRequest;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Generate image with DALL-E 3
    const { image } = await generateImage({
      model: openai.image("dall-e-3", { apiKey: openaiApiKey }),
      prompt,
      size: "1024x1024"
    });

    // Convert base64 to blob
    const imageBuffer = Uint8Array.from(atob(image.base64), (c) => c.charCodeAt(0));

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `generated_${timestamp}.png`;
    const filePath = `uploads/${user.id}/${fileName}`;

    // Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("files")
      .upload(filePath, imageBuffer, {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: false
      });

    if (storageError) {
      console.error("Storage upload error:", storageError);
      return new Response(
        JSON.stringify({ error: `Storage upload failed: ${storageError.message}` }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        }
      );
    }

    // Get public URL for the image
    const {
      data: { publicUrl }
    } = supabase.storage.from("files").getPublicUrl(filePath);

    // Insert file metadata into database
    const { data: fileRecord, error: dbError } = await supabase
      .from("files")
      .insert({
        user_id: user.id,
        file_name: fileName,
        original_name: `${prompt.slice(0, 50)}.png`,
        file_path: filePath,
        file_size: imageBuffer.length,
        mime_type: "image/png",
        bucket: "files"
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      // Clean up the uploaded file if database insert fails
      await supabase.storage.from("files").remove([filePath]);

      return new Response(
        JSON.stringify({ error: `Database insert failed: ${dbError.message}` }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        }
      );
    }

    // Return the image URL and file ID
    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: publicUrl,
        fileId: fileRecord.id,
        prompt
      }),
      {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      }
    );
  } catch (error) {
    console.error("Image generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate image" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      }
    );
  }
});
