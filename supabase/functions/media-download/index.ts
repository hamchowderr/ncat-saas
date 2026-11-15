import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { decryptCookies } from "../_shared/encryption.ts";

const NCAT_API_URL = Deno.env.get("NCAT_API_URL");
const NCAT_API_KEY = Deno.env.get("NCAT_API_KEY");
const WEBHOOK_URL = Deno.env.get("WEBHOOK_URL");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface MediaDownloadRequest {
  media_url: string;
  format?: any;
  audio?: any;
  thumbnails?: any;
  subtitles?: any;
  max_filesize?: number;
  rate_limit?: string;
  retries?: number;
  custom_id?: string;
  source_file_id?: string;
  use_cookies?: boolean;
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

    const body: MediaDownloadRequest = await req.json();

    if (!body.media_url || typeof body.media_url !== "string") {
      return new Response("media_url is required", { status: 400 });
    }

    // Fetch and decrypt user cookies (only if user explicitly requested it)
    let cookieString: string | undefined;
    if (body.use_cookies === true) {
      try {
        console.log(`🔍 User requested cookies - attempting to fetch for user: ${user.id}`);
        const { data: userCookie, error: cookieError } = await supabase
          .from("user_cookies")
          .select("id, encrypted_cookies, expires_at, is_active")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (cookieError) {
          console.log("⚠️ No cookies found in database:", cookieError.message);
        } else if (userCookie) {
          console.log(`✅ Found cookie record: ${userCookie.id}, encrypted length: ${userCookie.encrypted_cookies.length}`);

          // Decrypt cookies
          cookieString = await decryptCookies(userCookie.encrypted_cookies);
          console.log(`🔓 Successfully decrypted cookies, length: ${cookieString.length}`);

          // Update last_used_at timestamp
          await supabase
            .from("user_cookies")
            .update({ last_used_at: new Date().toISOString() })
            .eq("id", userCookie.id);

          // Create audit log (no sensitive data)
          await supabase.from("cookie_audit_logs").insert({
            user_id: user.id,
            cookie_id: userCookie.id,
            action: "used",
            ip_address: req.headers.get("x-forwarded-for"),
            user_agent: req.headers.get("user-agent"),
            metadata: { media_url: body.media_url }
          });

          console.log("✅ Using stored cookies for media download");
        } else {
          console.log("ℹ️ No active cookies found for this user");
        }
      } catch (error) {
        console.error("❌ Failed to retrieve/decrypt cookies:", error);
        console.error("Error details:", error.message, error.stack);
        // Continue without cookies - don't fail the request
      }
    } else {
      console.log(`ℹ️ User did not request cookies (use_cookies: ${body.use_cookies}) - skipping cookie retrieval`);
    }

    // Build minimal payload - only include optional parameters if they exist
    const ncatPayload: any = {
      media_url: body.media_url,
      webhook_url: replaceLocalhostUrl(`${WEBHOOK_URL}/functions/v1/ncat-webhook`),
      id: body.custom_id || `media-download-${Date.now()}`,
      cloud_upload: true
    };

    // Only add optional parameters if they're provided and supported by NCAT API
    if (body.format) ncatPayload.format = body.format;
    if (body.audio) ncatPayload.audio = body.audio;
    if (body.thumbnails) ncatPayload.thumbnails = body.thumbnails;
    if (body.subtitles) ncatPayload.subtitles = body.subtitles;
    if (cookieString) ncatPayload.cookie = cookieString;

    // Note: max_filesize, rate_limit, and retries are NOT supported by NCAT API
    // These would need to be implemented in a future version of the API

    console.log(`📤 Payload being sent to NCAT API:`, {
      has_cookie: !!ncatPayload.cookie,
      cookie_length: ncatPayload.cookie?.length,
      cookie_first_line: ncatPayload.cookie?.split('\n')[0],
      cookie_starts_with_netscape: ncatPayload.cookie?.startsWith('# Netscape'),
      cloud_upload: ncatPayload.cloud_upload,
      webhook_url: ncatPayload.webhook_url,
      media_url: ncatPayload.media_url,
      id: ncatPayload.id
    });

    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/BETA/media/download`, {
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
      return new Response("Failed to download media", { status: 500 });
    }

    const ncatResult = await ncatResponse.json();

    if (ncatResult.job_id) {
      await supabase.from("jobs").insert({
        user_id: user.id,
        nca_job_id: ncatResult.job_id,
        custom_id: body.custom_id || `media-download-${Date.now()}`,
        processing_status: "processing"
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        nca_job_id: ncatResult.job_id,
        message: "Media download started successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Media download error:", error);
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
