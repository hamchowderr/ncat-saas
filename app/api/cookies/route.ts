import { createClient } from "@/lib/server";
import { encryptCookies, validateCookieFormat, getCookieExpiration } from "@/lib/encryption";
import { NextResponse } from "next/server";
import type { CreateCookieRequest } from "@/lib/types/cookies";

/**
 * GET /api/cookies
 * List all cookies for the authenticated user
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch cookies (without encrypted_cookies field)
    const { data: cookies, error } = await supabase
      .from("user_cookies")
      .select("id, platform, label, created_at, last_used_at, expires_at, is_active")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cookies:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ cookies: cookies || [] });
  } catch (error) {
    console.error("Unexpected error in GET /api/cookies:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/cookies
 * Create a new cookie entry
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateCookieRequest = await req.json();
    const { platform, label, cookies: cookieString } = body;

    // Validate required fields
    if (!platform || !cookieString) {
      return NextResponse.json(
        { error: "Missing required fields: platform, cookies" },
        { status: 400 }
      );
    }

    // Validate cookie format
    if (!validateCookieFormat(cookieString)) {
      return NextResponse.json(
        {
          error:
            "Invalid Netscape cookie format. Please ensure your cookie file starts with '# Netscape HTTP Cookie File' and has valid tab-separated values."
        },
        { status: 400 }
      );
    }

    // Encrypt cookies
    let encrypted: string;
    try {
      encrypted = await encryptCookies(cookieString);
    } catch (error) {
      console.error("Encryption error:", error);
      return NextResponse.json({ error: "Failed to encrypt cookies" }, { status: 500 });
    }

    // Determine expiration (use earliest cookie expiration or default 30 days)
    const cookieExpiration = getCookieExpiration(cookieString);
    const expiresAt =
      cookieExpiration && cookieExpiration > new Date()
        ? cookieExpiration
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Insert into database
    const { data, error } = await supabase
      .from("user_cookies")
      .insert({
        user_id: user.id,
        platform,
        label: label || null,
        encrypted_cookies: encrypted,
        expires_at: expiresAt.toISOString()
      })
      .select("id, platform, label, created_at, last_used_at, expires_at, is_active")
      .single();

    if (error) {
      console.error("Error inserting cookie:", error);

      // Check for unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          {
            error:
              "A cookie with this platform and label already exists. Please use a different label or delete the existing cookie first."
          },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create audit log
    const { error: auditError } = await supabase.from("cookie_audit_logs").insert({
      user_id: user.id,
      cookie_id: data.id,
      action: "created",
      ip_address: req.headers.get("x-forwarded-for"),
      user_agent: req.headers.get("user-agent")
    });

    if (auditError) {
      console.error("Error creating audit log:", auditError);
      // Don't fail the request if audit log fails
    }

    return NextResponse.json({ success: true, cookie: data }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/cookies:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
