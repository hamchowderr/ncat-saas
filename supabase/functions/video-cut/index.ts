import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const NCAT_API_URL = Deno.env.get("NCAT_API_URL");
const NCAT_API_KEY = Deno.env.get("NCAT_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface CutSegment {
  start: string; // Format: hh:mm:ss.ms
  end: string; // Format: hh:mm:ss.ms
}

interface VideoCutRequest {
  video_url: string;
  cuts: CutSegment[];
  video_codec?: string;
  video_preset?: string;
  video_crf?: number;
  audio_codec?: string;
  audio_bitrate?: string;
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

    const body: VideoCutRequest = await req.json();

    // Validate required parameters
    if (!body.video_url || typeof body.video_url !== "string") {
      return new Response("video_url is required", { status: 400 });
    }

    if (!body.cuts || !Array.isArray(body.cuts) || body.cuts.length === 0) {
      return new Response("cuts array is required and cannot be empty", { status: 400 });
    }

    // Validate cut segments
    const timeRegex = /^\d{2}:\d{2}:\d{2}\.\d{2}$/;
    for (const cut of body.cuts) {
      if (!cut.start || !cut.end) {
        return new Response("Each cut must have start and end times", { status: 400 });
      }
      if (!timeRegex.test(cut.start) || !timeRegex.test(cut.end)) {
        return new Response("Cut times must be in hh:mm:ss.ms format", { status: 400 });
      }
    }

    // Validate optional parameters
    if (
      body.video_crf !== undefined &&
      (typeof body.video_crf !== "number" || body.video_crf < 0 || body.video_crf > 51)
    ) {
      return new Response("video_crf must be a number between 0 and 51", { status: 400 });
    }

    const ncatPayload = {
      video_url: body.video_url,
      cuts: body.cuts,
      video_codec: body.video_codec || "libx264",
      video_preset: body.video_preset || "medium",
      video_crf: body.video_crf || 23,
      audio_codec: body.audio_codec || "aac",
      audio_bitrate: body.audio_bitrate || "128k",
      webhook_url: body.webhook_url || `${SUPABASE_URL}/functions/v1/ncat-webhook`,
      id: body.id || `video-cut-${Date.now()}`
    };

    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/video/cut`, {
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
      return new Response("Failed to cut video", { status: 500 });
    }

    const ncatResult = await ncatResponse.json();

    // Create job record with NCAT job ID for tracking
    if (ncatResult.job_id) {
      await supabase.from("jobs").insert({
        user_id: user.id,
        nca_job_id: ncatResult.job_id,
        custom_id: body.id || `video-cut-${Date.now()}`,
        processing_status: "processing"
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        job_id: ncatResult.job_id,
        message: "Video cutting started successfully",
        response: ncatResult.response
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Video cut error:", error);
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
