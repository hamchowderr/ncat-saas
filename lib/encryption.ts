/**
 * Cookie Encryption Utilities
 *
 * Provides AES-256-GCM encryption for storing user cookies securely.
 * Uses Web Crypto API for encryption/decryption.
 */

/**
 * Encrypt a cookie string using AES-256-GCM
 * @param cookieString - The Netscape format cookie string to encrypt
 * @returns Base64-encoded encrypted data (IV + encrypted content)
 */
export async function encryptCookies(cookieString: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(cookieString);

  // Get encryption key from environment
  const keyMaterial = Buffer.from(process.env.COOKIE_ENCRYPTION_KEY!, "base64");

  // Import key for AES-GCM
  const key = await crypto.subtle.importKey("raw", keyMaterial, { name: "AES-GCM" }, false, [
    "encrypt"
  ]);

  // Generate random IV (12 bytes for GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the data
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);

  // Combine IV + encrypted data
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(encrypted), iv.length);

  // Return as base64 string
  return Buffer.from(result).toString("base64");
}

/**
 * Decrypt an encrypted cookie string
 * @param encryptedData - Base64-encoded encrypted data
 * @returns Original Netscape format cookie string
 * @throws Error if decryption fails (wrong key or tampered data)
 */
export async function decryptCookies(encryptedData: string): Promise<string> {
  const keyMaterial = Buffer.from(process.env.COOKIE_ENCRYPTION_KEY!, "base64");

  // Import key for AES-GCM
  const key = await crypto.subtle.importKey("raw", keyMaterial, { name: "AES-GCM" }, false, [
    "decrypt"
  ]);

  // Decode base64
  const data = Buffer.from(encryptedData, "base64");

  // Extract IV (first 12 bytes) and encrypted content
  const iv = data.slice(0, 12);
  const encrypted = data.slice(12);

  // Decrypt the data
  try {
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt cookies. Data may be corrupted or tampered with.");
  }
}

/**
 * Validate that a string is in Netscape HTTP Cookie File format
 * @param cookieString - The cookie string to validate
 * @returns True if valid Netscape format
 */
export function validateCookieFormat(cookieString: string): boolean {
  if (!cookieString || typeof cookieString !== "string") {
    return false;
  }

  const lines = cookieString.split("\n");

  // Must have the Netscape header
  if (!lines[0]?.includes("# Netscape HTTP Cookie File")) {
    return false;
  }

  // Filter out comments and empty lines
  const cookieLines = lines.filter((line) => line.trim() && !line.startsWith("#"));

  // Must have at least one cookie line
  if (cookieLines.length === 0) {
    return false;
  }

  // Validate format: domain, flag, path, secure, expiration, name, value (7 fields, tab-separated)
  for (const line of cookieLines) {
    const parts = line.split("\t");
    if (parts.length !== 7) {
      return false;
    }

    // Validate expiration is a number
    const expiration = parseInt(parts[4], 10);
    if (isNaN(expiration)) {
      return false;
    }
  }

  return true;
}

/**
 * Parse the earliest expiration date from a Netscape cookie file
 * @param cookieString - The Netscape format cookie string
 * @returns Earliest expiration date, or null if no valid expirations found
 */
export function getCookieExpiration(cookieString: string): Date | null {
  const lines = cookieString.split("\n");
  let earliestExpiration: number | null = null;

  for (const line of lines) {
    // Skip comments and empty lines
    if (!line.trim() || line.startsWith("#")) {
      continue;
    }

    const parts = line.split("\t");
    if (parts.length === 7) {
      const expiration = parseInt(parts[4], 10);

      // Check if expiration is valid and in the future
      if (!isNaN(expiration) && expiration > 0) {
        if (!earliestExpiration || expiration < earliestExpiration) {
          earliestExpiration = expiration;
        }
      }
    }
  }

  // Convert Unix timestamp to Date object
  return earliestExpiration ? new Date(earliestExpiration * 1000) : null;
}

/**
 * Extract platform from cookie domain (best guess)
 * @param cookieString - The Netscape format cookie string
 * @returns Detected platform or 'generic'
 */
export function detectPlatformFromCookies(
  cookieString: string
): "youtube" | "vimeo" | "instagram" | "tiktok" | "generic" {
  const lowercased = cookieString.toLowerCase();

  if (lowercased.includes("youtube.com") || lowercased.includes("googlevideo.com")) {
    return "youtube";
  }
  if (lowercased.includes("vimeo.com")) {
    return "vimeo";
  }
  if (lowercased.includes("instagram.com")) {
    return "instagram";
  }
  if (lowercased.includes("tiktok.com")) {
    return "tiktok";
  }

  return "generic";
}
