import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const NCAT_API_URL = Deno.env.get("NCAT_API_URL");
const NCAT_API_KEY = Deno.env.get("NCAT_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface VideoConcatenateRequest {
  video_urls: { video_url: string }[];
  webhook_url?: string;
  id?: string;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Authorization required", { status: 401 });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response("Invalid authentication", { status: 401 });
    }

    const body: VideoConcatenateRequest = await req.json();

    if (!body.video_urls || !Array.isArray(body.video_urls) || body.video_urls.length === 0) {
      return new Response("video_urls array is required and cannot be empty", { status: 400 });
    }

    if (body.video_urls.length < 2) {
      return new Response("At least 2 videos are required for concatenation", { status: 400 });
    }

    // Validate video URLs
    for (const video of body.video_urls) {
      if (!video.video_url || typeof video.video_url !== "string") {
        return new Response("Each video object must have a valid video_url string", {
          status: 400
        });
      }
    }

    const ncatPayload = {
      video_urls: body.video_urls,
      webhook_url: body.webhook_url || `${SUPABASE_URL}/functions/v1/ncat-webhook`,
      id: body.id || `video-concat-${Date.now()}`
    };

    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/video/concatenate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": NCAT_API_KEY!
      },
      body: JSON.stringify(ncatPayload)
    });

    if (!ncatResponse.ok) {
      const errorText = await ncatResponse.text();
      console.error("NCAT API error:", errorText);
      return new Response("Failed to concatenate videos", { status: 500 });
    }

    const ncatResult = await ncatResponse.json();

    // Create job record with NCAT job ID for tracking
    if (ncatResult.job_id) {
      await supabase.from("jobs").insert({
        user_id: user.id,
        nca_job_id: ncatResult.job_id,
        custom_id: body.id || `video-concat-${Date.now()}`,
        processing_status: "processing"
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        job_id: ncatResult.job_id,
        message: "Video concatenation started successfully",
        response: ncatResult.response
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Video concatenate error:", error);
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
