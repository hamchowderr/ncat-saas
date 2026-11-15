/**
 * Shared validation utilities for NCAT API Edge Functions
 *
 * This module provides consistent validation and error handling patterns
 * across all Edge Functions that interact with the NCAT API.
 */

// ============================================================================
// TIME FORMAT VALIDATORS
// ============================================================================

/**
 * Validates time format for video/audio operations
 * Accepts: hh:mm:ss or hh:mm:ss.ms or hh:mm:ss.mmm
 * Examples: "00:10:30", "00:10:30.5", "00:10:30.500"
 */
export function validateTimeFormat(time: string): boolean {
  return /^\d{2}:\d{2}:\d{2}(\.\d{1,3})?$/.test(time);
}

/**
 * Validates simple time format (mm:ss or hh:mm:ss)
 * Used for trim/cut operations
 */
export function validateSimpleTimeFormat(time: string): boolean {
  return /^(\d{1,2}:\d{2}:\d{2}|\d{1,2}:\d{2})$/.test(time);
}

// ============================================================================
// URL VALIDATORS
// ============================================================================

/**
 * Validates HTTP/HTTPS URL format
 */
export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validates required string field (not empty, not just whitespace)
 */
export function validateRequiredString(value: unknown, fieldName: string): string | null {
  if (typeof value !== "string") {
    return `${fieldName} must be a string`;
  }
  if (!value.trim()) {
    return `${fieldName} cannot be empty`;
  }
  return null;
}

// ============================================================================
// NUMERIC VALIDATORS
// ============================================================================

/**
 * Validates CRF (Constant Rate Factor) for video encoding
 * Valid range: 0-51 (lower = better quality, higher file size)
 */
export function validateCrf(crf: number): boolean {
  return typeof crf === "number" && crf >= 0 && crf <= 51;
}

/**
 * Validates positive integer
 */
export function validatePositiveInteger(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

/**
 * Validates numeric range
 */
export function validateRange(value: number, min: number, max: number): boolean {
  return typeof value === "number" && value >= min && value <= max;
}

// ============================================================================
// ARRAY VALIDATORS
// ============================================================================

/**
 * Validates that value is a non-empty array
 */
export function validateNonEmptyArray(value: unknown, fieldName: string): string | null {
  if (!Array.isArray(value)) {
    return `${fieldName} must be an array`;
  }
  if (value.length === 0) {
    return `${fieldName} cannot be empty`;
  }
  return null;
}

// ============================================================================
// RESPONSE BUILDERS
// ============================================================================

/**
 * Builds a consistent error response
 */
export function buildErrorResponse(error: string, message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({ error, message }),
    {
      status,
      headers: { "Content-Type": "application/json" }
    }
  );
}

/**
 * Builds a success response
 */
export function buildSuccessResponse(data: Record<string, unknown>, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { "Content-Type": "application/json" }
    }
  );
}

// ============================================================================
// NCAT API RESPONSE PARSER
// ============================================================================

/**
 * Safely parses NCAT API response with error handling
 * Returns either the parsed JSON or an error response
 */
export async function parseNcatResponse(response: globalThis.Response): Promise<{
  success: boolean;
  data?: any;
  error?: Response;
}> {
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`NCAT API error (${response.status}):`, errorText);
    return {
      success: false,
      error: buildErrorResponse(
        "NCAT API request failed",
        errorText || `HTTP ${response.status}`,
        response.status >= 500 ? 500 : 400
      )
    };
  }

  // Try to parse as JSON
  const responseText = await response.text();

  try {
    const data = JSON.parse(responseText);
    return { success: true, data };
  } catch (parseError) {
    // NCAT API returned plain text error instead of JSON
    console.error("NCAT API returned non-JSON response:", responseText);
    return {
      success: false,
      error: buildErrorResponse(
        "Invalid API response",
        responseText || "API returned non-JSON response",
        400
      )
    };
  }
}

// ============================================================================
// URL PROCESSING
// ============================================================================

/**
 * Replaces localhost URLs with Docker host URLs for NCAT API
 * The NCAT API runs in Docker and needs to access Supabase via host.docker.internal
 */
export function replaceLocalhostUrl(url: string): string {
  if (url.includes("127.0.0.1:54321") || url.includes("localhost:54321")) {
    const replaced = url
      .replace("http://127.0.0.1:54321", "http://host.docker.internal:54321")
      .replace("http://localhost:54321", "http://host.docker.internal:54321");
    console.log(`🔄 Replaced localhost URL: ${url} -> ${replaced}`);
    return replaced;
  }
  return url;
}

// ============================================================================
// FILE TYPE VALIDATORS
// ============================================================================

/**
 * Validates that URL appears to be a video file
 */
export function validateVideoUrl(url: string): boolean {
  const videoExtensions = [".mp4", ".webm", ".avi", ".mov", ".mkv", ".flv", ".wmv"];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
}

/**
 * Validates that URL appears to be an audio file
 */
export function validateAudioUrl(url: string): boolean {
  const audioExtensions = [".mp3", ".wav", ".m4a", ".flac", ".aac", ".ogg"];
  const lowerUrl = url.toLowerCase();
  return audioExtensions.some(ext => lowerUrl.includes(ext));
}

/**
 * Validates that URL appears to be an image file
 */
export function validateImageUrl(url: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
}
