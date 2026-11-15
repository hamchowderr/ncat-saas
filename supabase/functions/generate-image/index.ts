// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const PUBLIC_SUPABASE_URL = "http://host.docker.internal:54321"; // Public URL accessible from Docker containers

interface ImageRequest {
  prompt: string;
  chatId?: string;
  user_id?: string; // For internal webhook calls
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
    // Create supabase client with service role key (for internal webhook calls)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const { prompt, chatId, user_id } = (await req.json()) as ImageRequest;

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

    console.log("Generating image with DALL-E 3:", prompt.substring(0, 50));

    // Call OpenAI API directly using fetch
    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({
          error: "Image generation failed",
          details: errorText
        }),
        {
          status: openaiResponse.status,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const base64Image = openaiData.data[0].b64_json;

    console.log("Image generated successfully");

    // Convert base64 to blob
    const imageBuffer = Uint8Array.from(atob(base64Image), (c) => c.charCodeAt(0));

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `generated_${timestamp}.png`;
    const userId = user_id || "system"; // Use provided user_id or fallback to system
    const filePath = `uploads/${userId}/${fileName}`;

    // Upload to Supabase Storage with explicit content-type
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

    // CRITICAL FIX: Update storage object metadata to ensure correct content-type
    // Supabase Storage sometimes doesn't respect contentType in upload()
    // This ensures the file is served with image/png when accessed via public URL
    const { error: updateError } = await supabase.storage
      .from("files")
      .update(filePath, imageBuffer, {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: true
      });

    if (updateError) {
      console.warn("⚠️ Failed to update storage object metadata:", updateError.message);
      // Don't fail the entire request - the file was uploaded successfully
    } else {
      console.log("✅ Storage object metadata updated with correct content-type");

      // CRITICAL: Wait for metadata propagation in Supabase Storage
      // Local development storage needs time to propagate content-type changes
      // Without this delay, NCAT may download the file with application/octet-stream
      // Increased to 2000ms (2 seconds) due to persistent caching issues with auto-run video generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("✅ Waited 2000ms for metadata propagation");
    }

    // Get public URL for the image
    const { data: { publicUrl: rawPublicUrl } } = supabase.storage.from("files").getPublicUrl(filePath);
    // Replace internal kong URL with public URL for browser access
    const publicUrl = rawPublicUrl.replace("http://kong:8000", PUBLIC_SUPABASE_URL);

    // Insert file metadata into database
    const { data: fileRecord, error: dbError } = await supabase
      .from("files")
      .insert({
        user_id: userId,
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

      return new Response(JSON.stringify({ error: `Database insert failed: ${dbError.message}` }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    console.log("Image generation complete:", publicUrl);

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
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate image"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      }
    );
  }
});
