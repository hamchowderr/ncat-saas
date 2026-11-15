/**
 * Cookie Encryption Utilities for Deno Edge Functions
 *
 * Provides AES-256-GCM encryption for storing user cookies securely.
 * Uses Web Crypto API (Deno-compatible version).
 */

/**
 * Decrypt an encrypted cookie string (Deno version)
 * @param encryptedData - Base64-encoded encrypted data
 * @returns Original Netscape format cookie string
 * @throws Error if decryption fails
 */
export async function decryptCookies(encryptedData: string): Promise<string> {
  const keyMaterial = Uint8Array.from(atob(Deno.env.get("COOKIE_ENCRYPTION_KEY")!), (c) =>
    c.charCodeAt(0)
  );

  // Import key for AES-GCM
  const key = await crypto.subtle.importKey("raw", keyMaterial, { name: "AES-GCM" }, false, [
    "decrypt"
  ]);

  // Decode base64
  const data = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

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
 * Encrypt a cookie string using AES-256-GCM (Deno version)
 * @param cookieString - The Netscape format cookie string to encrypt
 * @returns Base64-encoded encrypted data
 */
export async function encryptCookies(cookieString: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(cookieString);

  const keyMaterial = Uint8Array.from(atob(Deno.env.get("COOKIE_ENCRYPTION_KEY")!), (c) =>
    c.charCodeAt(0)
  );

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
  return btoa(String.fromCharCode(...result));
}
