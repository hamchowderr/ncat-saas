import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY") || "";
const PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321"; // Public URL for browser access

interface GenerateAudioRequest {
  text: string;
  voice_id?: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  model_id?: string;
  user_id?: string; // For internal webhook calls
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      }
    });
  }

  try {
    // Verify ElevenLabs API key is configured
    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY not configured");
      return new Response(JSON.stringify({ error: "ElevenLabs API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Parse request body
    const body: GenerateAudioRequest = await req.json();
    const {
      text,
      voice_id = "21m00Tcm4TlvDq8ikWAM",
      voice_settings,
      model_id = "eleven_multilingual_v2",
      user_id
    } = body;

    if (!text) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log("Generating audio with ElevenLabs:", {
      textLength: text.length,
      voiceId: voice_id,
      modelId: model_id
    });

    // Call ElevenLabs API directly using fetch
    const elevenlabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings: voice_settings || {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      }
    );

    if (!elevenlabsResponse.ok) {
      const errorText = await elevenlabsResponse.text();
      console.error("ElevenLabs API error:", errorText);
      return new Response(
        JSON.stringify({
          error: "Audio generation failed",
          details: errorText
        }),
        {
          status: elevenlabsResponse.status,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Get audio as buffer
    const audioBuffer = await elevenlabsResponse.arrayBuffer();
    console.log("Audio generated successfully, size:", audioBuffer.byteLength);

    // Create Supabase client with service role key (for internal webhook calls)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `audio-${timestamp}.mp3`;
    const userId = user_id || "system"; // Use provided user_id or fallback to system
    const filePath = `uploads/${userId}/${filename}`;

    // Upload audio buffer to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("files")
      .upload(filePath, new Uint8Array(audioBuffer), {
        contentType: "audio/mpeg",
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Failed to upload audio" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // CRITICAL FIX: Update storage object metadata to ensure correct content-type
    // Supabase Storage sometimes doesn't respect contentType in upload()
    // This ensures the file is served with audio/mpeg when accessed via public URL
    const { error: updateError } = await supabase.storage
      .from("files")
      .update(filePath, new Uint8Array(audioBuffer), {
        contentType: "audio/mpeg",
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
      await new Promise((resolve) => setTimeout(resolve, 200));
      console.log("✅ Waited 200ms for metadata propagation");
    }

    // Get public URL
    const { data: { publicUrl: rawPublicUrl } } = supabase.storage.from("files").getPublicUrl(filePath);
    // Replace internal kong URL with public URL for browser access
    const publicUrl = rawPublicUrl.replace("http://kong:8000", PUBLIC_SUPABASE_URL);

    // Create file record in database
    const { data: fileRecord, error: fileError } = await supabase
      .from("files")
      .insert({
        user_id: userId,
        file_name: filename,
        original_name: `${text.slice(0, 50)}.mp3`,
        file_path: filePath,
        file_size: audioBuffer.byteLength,
        mime_type: "audio/mpeg",
        bucket: "files"
      })
      .select()
      .single();

    if (fileError) {
      console.error("Database error:", fileError);
      // File is uploaded but DB record failed - still return success with URL
      return new Response(
        JSON.stringify({
          success: true,
          url: publicUrl,
          file_path: filePath,
          warning: "Audio generated but database record creation failed"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    console.log("Audio generation complete:", publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        file_path: filePath,
        file_id: fileRecord.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error generating audio:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate audio",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
