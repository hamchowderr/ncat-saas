import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const NCAT_API_URL = Deno.env.get("NCAT_API_URL");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface ImageToVideoRequest {
  image_url: string;
  length?: number;
  frame_rate?: number;
  zoom_speed?: number;
  custom_id?: string;
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
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response("Invalid authentication", { status: 401 });
    }

    const body: ImageToVideoRequest = await req.json();

    if (!body.image_url || typeof body.image_url !== "string") {
      return new Response("image_url is required", { status: 400 });
    }

    if (
      body.length !== undefined &&
      (typeof body.length !== "number" || body.length < 1 || body.length > 60)
    ) {
      return new Response("length must be between 1 and 60 seconds", { status: 400 });
    }

    if (
      body.frame_rate !== undefined &&
      (typeof body.frame_rate !== "number" || body.frame_rate < 15 || body.frame_rate > 60)
    ) {
      return new Response("frame_rate must be between 15 and 60 fps", { status: 400 });
    }

    if (
      body.zoom_speed !== undefined &&
      (typeof body.zoom_speed !== "number" || body.zoom_speed < 0 || body.zoom_speed > 100)
    ) {
      return new Response("zoom_speed must be between 0 and 100", { status: 400 });
    }

    const ncatPayload = {
      image_url: body.image_url,
      length: body.length,
      frame_rate: body.frame_rate,
      zoom_speed: body.zoom_speed,
      webhook_url: `${SUPABASE_URL}/functions/v1/ncat-webhook`,
      id: body.custom_id || `image-to-video-${Date.now()}`
    };

    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/image/convert/video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(ncatPayload)
    });

    if (!ncatResponse.ok) {
      const errorText = await ncatResponse.text();
      console.error("NCAT API error:", errorText);
      return new Response("Failed to convert image to video", { status: 500 });
    }

    const ncatResult = await ncatResponse.json();

    if (ncatResult.job_id) {
      await supabase.from("jobs").insert({
        user_id: user.id,
        nca_job_id: ncatResult.job_id,
        custom_id: body.custom_id || `image-to-video-${Date.now()}`,
        processing_status: "processing"
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        nca_job_id: ncatResult.job_id,
        message: "Image to video conversion started successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Image to video error:", error);
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
