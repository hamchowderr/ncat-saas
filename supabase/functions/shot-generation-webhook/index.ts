// @ts-nocheck - This is a Deno Edge Function, Deno types are available at runtime
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
// Try both variable names (custom and auto-provided)
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  // Fallback: hardcoded for local development (temporary workaround)
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

console.log("Shot Generation Webhook Handler started!");
console.log(`🔑 SERVICE_ROLE_KEY from env: ${Deno.env.get("SERVICE_ROLE_KEY") ? "YES" : "NO"}`);
console.log(`🔑 SUPABASE_SERVICE_ROLE_KEY from env: ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ? "YES" : "NO"}`);
console.log(`🔑 Final SERVICE_ROLE_KEY value: ${SERVICE_ROLE_KEY ? "YES (length: " + SERVICE_ROLE_KEY.length + ")" : "NO"}`);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface WebhookPayload {
  type: "shot_image_generation" | "shot_audio_generation" | "shot_video_generation" | "shot_mixing" | "scene_assembly" | "story_assembly";
  shot_id?: string;
  scene_id?: string;
  story_id?: string;
  user_id: string;
  image_prompt?: string;
  shot_script?: string;
  image_url?: string;
  video_prompt?: string;
  duration_seconds?: number;
  audio_url?: string;
  video_url?: string;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
  try {
    console.log(`📨 Received ${req.method} request`);
    console.log(`🔑 Token available for downstream calls: ${SERVICE_ROLE_KEY ? "YES (length: " + SERVICE_ROLE_KEY.length + ")" : "NO"}`);

    // Only accept POST requests
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Parse webhook payload
    const payload: WebhookPayload = await req.json();
    console.log(`📋 Webhook type: ${payload.type} for shot ${payload.shot_id}`);

    // Return immediately (asynchronous processing pattern)
    const response = new Response(
      JSON.stringify({ received: true, shot_id: payload.shot_id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

    // Process generation in background (fire and forget)
    processGeneration(payload).catch((error) => {
      console.error(`💥 Background processing error for shot ${payload.shot_id}:`, error);
    });

    return response;
  } catch (error) {
    console.error("💥 Webhook handler error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});

// ============================================================================
// BACKGROUND PROCESSING FUNCTION
// ============================================================================

async function processGeneration(payload: WebhookPayload) {
  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

  try {
    // Update status to 'generating' (only for shot-level operations)
    if (payload.shot_id && payload.type.startsWith('shot_')) {
      console.log(`📝 Updating shot ${payload.shot_id} status to 'generating'`);
      const { error: statusError } = await supabase
        .from('shots')
        .update({ status: 'generating' })
        .eq('id', payload.shot_id);

      if (statusError) {
        console.warn(`⚠️ Failed to update status: ${statusError.message}`);
      }
    }

    // Use service role key for internal Edge Function calls (database webhooks are trusted)
    const token = SERVICE_ROLE_KEY!;

    let resultUrl: string | null = null;
    let updateField: string | null = null;

    // Route to appropriate generation service
    switch (payload.type) {
      case "shot_image_generation":
        console.log(`🎨 Generating image for shot ${payload.shot_id}`);
        resultUrl = await generateImage(payload.image_prompt!, payload.user_id, token);
        updateField = "image_url";
        break;

      case "shot_audio_generation":
        console.log(`🎵 Generating audio for shot ${payload.shot_id}`);

        // Get voice settings from story type
        const { data: shotData, error: shotError } = await supabase
          .from("shots")
          .select(
            `
            scenes!inner(
              stories!inner(
                story_types!inner(voice_id, voice_settings)
              )
            )
          `
          )
          .eq("id", payload.shot_id)
          .single();

        if (shotError || !shotData) {
          throw new Error(`Failed to fetch shot data: ${shotError?.message}`);
        }

        const voiceId = shotData.scenes.stories.story_types.voice_id;
        const voiceSettings = shotData.scenes.stories.story_types.voice_settings;

        resultUrl = await generateAudio(payload.shot_script!, voiceId, voiceSettings, payload.user_id, token);
        updateField = "audio_url";
        break;

      case "shot_video_generation":
        console.log(`🎬 Generating video for shot ${payload.shot_id}`);
        resultUrl = await generateVideo(
          payload.image_url!,
          payload.duration_seconds || 5,
          payload.user_id,
          token
        );
        updateField = "video_url";
        break;

      case "shot_mixing":
        console.log(`🎞️ Mixing audio + video for shot ${payload.shot_id}`);
        resultUrl = await mixShot(payload.audio_url!, payload.video_url!, payload.user_id, token);
        updateField = "final_shot_url";
        break;

      case "scene_assembly":
        console.log(`🎬 Assembling scene ${payload.scene_id}`);
        resultUrl = await assembleScene(payload.scene_id!, payload.user_id, token, supabase);
        updateField = "final_scene_url";
        break;

      case "story_assembly":
        console.log(`📽️ Assembling story ${payload.story_id}`);
        resultUrl = await assembleStory(payload.story_id!, payload.user_id, token, supabase);
        updateField = "final_story_url";
        break;
    }

    // Update database with result
    if (resultUrl && updateField) {
      if (payload.type.startsWith('shot_')) {
        // Update shot
        const { error: updateError } = await supabase
          .from("shots")
          .update({
            [updateField]: resultUrl,
            status: "completed"
          })
          .eq("id", payload.shot_id!);

        if (updateError) {
          throw new Error(`Failed to update shot: ${updateError.message}`);
        }

        console.log(`✅ Updated shot ${payload.shot_id}: ${updateField} = ${resultUrl}`);
      } else if (payload.type === 'scene_assembly') {
        // Update scene
        const { error: updateError } = await supabase
          .from("scenes")
          .update({
            [updateField]: resultUrl
          })
          .eq("id", payload.scene_id!);

        if (updateError) {
          throw new Error(`Failed to update scene: ${updateError.message}`);
        }

        console.log(`✅ Updated scene ${payload.scene_id}: ${updateField} = ${resultUrl}`);
      } else if (payload.type === 'story_assembly') {
        // Update story
        const { error: updateError } = await supabase
          .from("stories")
          .update({
            [updateField]: resultUrl
          })
          .eq("id", payload.story_id!);

        if (updateError) {
          throw new Error(`Failed to update story: ${updateError.message}`);
        }

        console.log(`✅ Updated story ${payload.story_id}: ${updateField} = ${resultUrl}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${payload.type}:`, error);

    // Mark as failed
    if (payload.shot_id && payload.type.startsWith('shot_')) {
      // Mark shot as failed
      await supabase
        .from("shots")
        .update({
          status: "failed",
          error_message: error.message
        })
        .eq("id", payload.shot_id);
    } else if (payload.scene_id && payload.type === 'scene_assembly') {
      // Mark scene as failed (no status field, just log)
      console.error(`❌ Scene ${payload.scene_id} assembly failed: ${error.message}`);
    } else if (payload.story_id && payload.type === 'story_assembly') {
      // Mark story as failed (no status field, just log)
      console.error(`❌ Story ${payload.story_id} assembly failed: ${error.message}`);
    }
  }
}

// ============================================================================
// GENERATION FUNCTIONS WITH RETRY LOGIC
// ============================================================================

/**
 * Generate image using DALL-E 3 via existing Edge Function
 */
async function generateImage(prompt: string, userId: string, token: string): Promise<string> {
  return retryWithBackoff(async () => {
    console.log(`🎨 Calling generate-image with prompt: ${prompt.substring(0, 50)}...`);

    const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, user_id: userId })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Image generation failed (${res.status}): ${errorText}`);
    }

    const data = await res.json();

    if (!data.imageUrl) {
      throw new Error("Image generation response missing imageUrl");
    }

    console.log(`✅ Image generated: ${data.imageUrl}`);
    return data.imageUrl;
  }, 3);
}

/**
 * Generate audio using ElevenLabs via existing Edge Function
 */
async function generateAudio(
  text: string,
  voiceId: string,
  voiceSettings: any,
  userId: string,
  token: string
): Promise<string> {
  return retryWithBackoff(async () => {
    console.log(
      `🎵 Calling generate-audio with voice: ${voiceId}, text length: ${text.length}`
    );

    const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-audio`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        voice_id: voiceId,
        voice_settings: voiceSettings,
        user_id: userId
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Audio generation failed (${res.status}): ${errorText}`);
    }

    const data = await res.json();

    if (!data.url) {
      throw new Error("Audio generation response missing url");
    }

    console.log(`✅ Audio generated: ${data.url}`);
    return data.url;
  }, 3);
}

/**
 * Generate video from image using NCAT image-to-video
 */
async function generateVideo(
  imageUrl: string,
  duration: number,
  userId: string,
  token: string
): Promise<string> {
  return retryWithBackoff(async () => {
    console.log(`🎬 Calling image-convert-video with image: ${imageUrl.substring(0, 50)}...`);

    const res = await fetch(`${SUPABASE_URL}/functions/v1/image-convert-video`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image_url: imageUrl,
        length: duration,
        zoom_speed: 10, // Default zoom speed
        user_id: userId
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Video generation failed (${res.status}): ${errorText}`);
    }

    const data = await res.json();

    if (!data.nca_job_id) {
      throw new Error("Video generation response missing nca_job_id");
    }

    console.log(`✅ Video generation started with job ID: ${data.nca_job_id}`);

    // Poll for job completion (NCAT image-to-video is async via webhook)
    return await pollJobCompletion(data.nca_job_id, token);
  }, 3);
}

/**
 * Mix audio and video using FFmpeg
 */
async function mixShot(audioUrl: string, videoUrl: string, userId: string, token: string): Promise<string> {
  return retryWithBackoff(async () => {
    console.log(`🎞️ Calling ffmpeg-compose to mix audio and video`);

    const res = await fetch(`${SUPABASE_URL}/functions/v1/ffmpeg-compose`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: [
          { file_url: videoUrl },
          { file_url: audioUrl }
        ],
        outputs: [
          {
            options: [
              { option: "-c:v", argument: "copy" },
              { option: "-c:a", argument: "aac" },
              { option: "-shortest", argument: "" }
            ]
          }
        ],
        user_id: userId
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Shot mixing failed (${res.status}): ${errorText}`);
    }

    const data = await res.json();

    if (!data.job_id) {
      throw new Error("Shot mixing response missing job_id");
    }

    console.log(`✅ Shot mixing started with job ID: ${data.job_id}`);

    // Poll for job completion
    return await pollJobCompletion(data.job_id, token);
  }, 3);
}

/**
 * Assemble scene from all completed shots
 */
async function assembleScene(
  sceneId: string,
  userId: string,
  token: string,
  supabase: any
): Promise<string> {
  return retryWithBackoff(async () => {
    console.log(`🎬 Assembling scene ${sceneId}`);

    // Fetch all shots for this scene, ordered by sequence_number
    const { data: shots, error: shotsError } = await supabase
      .from("shots")
      .select("id, sequence_number, final_shot_url")
      .eq("scene_id", sceneId)
      .order("sequence_number", { ascending: true });

    if (shotsError) {
      throw new Error(`Failed to fetch shots: ${shotsError.message}`);
    }

    if (!shots || shots.length === 0) {
      throw new Error(`No shots found for scene ${sceneId}`);
    }

    // Check if all shots have final_shot_url
    const incompleteShots = shots.filter(shot => !shot.final_shot_url);
    if (incompleteShots.length > 0) {
      throw new Error(`Scene has ${incompleteShots.length} incomplete shot(s)`);
    }

    console.log(`📹 Concatenating ${shots.length} shot(s) for scene ${sceneId}`);

    // Build inputs array for ffmpeg-compose
    const inputs = shots.map(shot => ({
      file_url: shot.final_shot_url
    }));

    // Call ffmpeg-compose to concatenate all shots
    const res = await fetch(`${SUPABASE_URL}/functions/v1/ffmpeg-compose`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs,
        outputs: [
          {
            options: [
              { option: "-c:v", argument: "copy" },
              { option: "-c:a", argument: "copy" }
            ]
          }
        ],
        user_id: userId
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Scene assembly failed (${res.status}): ${errorText}`);
    }

    const data = await res.json();

    if (!data.job_id) {
      throw new Error("Scene assembly response missing job_id");
    }

    console.log(`✅ Scene assembly started with job ID: ${data.job_id}`);

    // Poll for job completion
    return await pollJobCompletion(data.job_id, token);
  }, 3);
}

/**
 * Assemble story from all completed scenes
 */
async function assembleStory(
  storyId: string,
  userId: string,
  token: string,
  supabase: any
): Promise<string> {
  return retryWithBackoff(async () => {
    console.log(`📽️ Assembling story ${storyId}`);

    // Fetch all scenes for this story, ordered by sequence_number
    const { data: scenes, error: scenesError } = await supabase
      .from("scenes")
      .select("id, sequence_number, final_scene_url")
      .eq("story_id", storyId)
      .order("sequence_number", { ascending: true });

    if (scenesError) {
      throw new Error(`Failed to fetch scenes: ${scenesError.message}`);
    }

    if (!scenes || scenes.length === 0) {
      throw new Error(`No scenes found for story ${storyId}`);
    }

    // Check if all scenes have final_scene_url
    const incompleteScenes = scenes.filter(scene => !scene.final_scene_url);
    if (incompleteScenes.length > 0) {
      throw new Error(`Story has ${incompleteScenes.length} incomplete scene(s)`);
    }

    console.log(`🎞️ Concatenating ${scenes.length} scene(s) for story ${storyId}`);

    // Build inputs array for ffmpeg-compose
    const inputs = scenes.map(scene => ({
      file_url: scene.final_scene_url
    }));

    // Call ffmpeg-compose to concatenate all scenes
    const res = await fetch(`${SUPABASE_URL}/functions/v1/ffmpeg-compose`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs,
        outputs: [
          {
            options: [
              { option: "-c:v", argument: "copy" },
              { option: "-c:a", argument: "copy" }
            ]
          }
        ],
        user_id: userId
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Story assembly failed (${res.status}): ${errorText}`);
    }

    const data = await res.json();

    if (!data.job_id) {
      throw new Error("Story assembly response missing job_id");
    }

    console.log(`✅ Story assembly started with job ID: ${data.job_id}`);

    // Poll for job completion
    return await pollJobCompletion(data.job_id, token);
  }, 3);
}

/**
 * Poll job status until completion
 * NCAT jobs are async and complete via webhook
 */
async function pollJobCompletion(ncaJobId: string, token: string): Promise<string> {
  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);
  const maxAttempts = 60; // 60 attempts * 5 seconds = 5 minutes max wait
  const pollInterval = 5000; // 5 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    console.log(`📊 Polling job ${ncaJobId} (attempt ${attempt + 1}/${maxAttempts})`);

    const { data: job, error } = await supabase
      .from("jobs")
      .select("processing_status, nca_result_files, error_message, nca_message")
      .eq("nca_job_id", ncaJobId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch job status: ${error.message}`);
    }

    if (!job) {
      throw new Error(`Job not found: ${ncaJobId}`);
    }

    // Extract result URL from nca_result_files JSONB
    let resultUrl: string | null = null;
    if (job.nca_result_files && typeof job.nca_result_files === 'object') {
      const files = job.nca_result_files as any;
      // NCAT API returns files array with url field
      if (Array.isArray(files) && files.length > 0 && files[0].url) {
        resultUrl = files[0].url;
      }
    }

    if (job.processing_status === "completed" && resultUrl) {
      console.log(`✅ Job ${ncaJobId} completed: ${resultUrl}`);
      return resultUrl;
    }

    if (job.processing_status === "failed") {
      const errorMsg = job.error_message || job.nca_message || "Unknown error";
      throw new Error(`Job ${ncaJobId} failed: ${errorMsg}`);
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error(`Job ${ncaJobId} timed out after ${maxAttempts * pollInterval / 1000} seconds`);
}

// ============================================================================
// RETRY HELPER (MAKE.COM-STYLE ERROR HANDLING)
// ============================================================================

/**
 * Retry function with exponential backoff
 * Mimics Make.com behavior: waits for API recovery before giving up
 */
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on non-transient errors
      const nonTransientErrors = [
        "Invalid prompt",
        "Content policy violation",
        "Unauthorized",
        "response missing"
      ];

      const isNonTransient = nonTransientErrors.some((msg) => lastError.message.includes(msg));

      if (isNonTransient) {
        console.log(`❌ Non-transient error detected, not retrying: ${lastError.message}`);
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      console.log(
        `⏳ Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms (error: ${lastError.message})`
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries exhausted
  console.log(`❌ All ${maxRetries} retry attempts exhausted`);
  throw lastError!;
}
