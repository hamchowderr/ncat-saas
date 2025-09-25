import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const NCAT_API_URL = Deno.env.get("NCAT_API_URL");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface MediaSilenceRequest {
  media_url: string;
  duration: number;
  start?: number;
  end?: number;
  noise?: number;
  mono?: boolean;
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

    const body: MediaSilenceRequest = await req.json();

    if (!body.media_url || typeof body.media_url !== "string") {
      return new Response("media_url is required", { status: 400 });
    }

    if (!body.duration || typeof body.duration !== "number") {
      return new Response("duration is required", { status: 400 });
    }

    const ncatPayload = {
      media_url: body.media_url,
      duration: body.duration,
      start: body.start,
      end: body.end,
      noise: body.noise,
      mono: body.mono,
      webhook_url: `${SUPABASE_URL}/functions/v1/ncat-webhook`,
      id: body.custom_id || `media-silence-${Date.now()}`
    };

    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/media/silence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ncatPayload)
    });

    if (!ncatResponse.ok) {
      const errorText = await ncatResponse.text();
      console.error("NCAT API error:", errorText);
      return new Response("Failed to detect silence", { status: 500 });
    }

    const ncatResult = await ncatResponse.json();

    if (ncatResult.job_id) {
      await supabase.from("jobs").insert({
        user_id: user.id,
        nca_job_id: ncatResult.job_id,
        custom_id: body.custom_id || `media-silence-${Date.now()}`,
        processing_status: "processing"
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        nca_job_id: ncatResult.job_id,
        message: "Silence detection started successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Media silence error:", error);
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
