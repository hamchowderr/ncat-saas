// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { randomUUID } from "node:crypto";

interface UploadResponse {
  success: boolean;
  data?: any;
  error?: string;
  fileName?: string;
  originalName?: string;
  filePath?: string;
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
    return new Response("Method not allowed", {
      status: 405,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Authorization header missing" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    // Extract JWT token from Bearer token
    const token = authHeader.replace("Bearer ", "");

    // Create supabase client with service role for storage operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create supabase client with anon key for database operations (respects RLS)
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    // Verify the user is authenticated using admin client
    const {
      data: { user },
      error: authError
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: "Invalid or expired token" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ success: false, error: "No file provided" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${file.name.replace(/\.[^/.]+$/, "")}_${timestamp}${file.name.substring(file.name.lastIndexOf("."))}`;
    const userPath = `${user.id}/${uniqueFileName}`;
    const uploadPath = `uploads/${userPath}`;

    // Upload to Supabase Storage using admin client
    const { data: storageData, error: storageError } = await supabaseAdmin.storage
      .from("files")
      .upload(uploadPath, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false
      });

    if (storageError) {
      console.error("Storage upload error:", storageError);
      return new Response(
        JSON.stringify({ success: false, error: `Storage upload failed: ${storageError.message}` }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    // Insert file metadata into database using admin client (we already verified auth above)
    const { error: dbError } = await supabaseAdmin.from("files").insert({
      user_id: user.id,
      file_name: uniqueFileName,
      original_name: file.name,
      file_path: uploadPath,
      file_size: file.size,
      mime_type: file.type,
      bucket: "files" // Explicitly set bucket to match storage bucket
    });

    if (dbError) {
      console.error("Database insert error:", dbError);

      // Clean up the uploaded file if database insert fails
      await supabaseAdmin.storage.from("files").remove([uploadPath]);

      return new Response(
        JSON.stringify({ success: false, error: `Database insert failed: ${dbError.message}` }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    const response: UploadResponse = {
      success: true,
      data: storageData,
      fileName: uniqueFileName,
      originalName: file.name,
      filePath: uploadPath
    };

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});
