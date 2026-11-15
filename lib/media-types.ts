/**
 * Media Type Utilities
 *
 * Helper functions and constants for handling media file types
 * across the application, particularly for the media tools.
 */

/**
 * Standard MIME type patterns for media tools
 */
export const MEDIA_TYPES = {
  VIDEO: "video/*",
  AUDIO: "audio/*",
  IMAGE: "image/*",
  ALL_MEDIA: "video/*,audio/*,image/*",
  VIDEO_AUDIO: "video/*,audio/*",
  VIDEO_AUDIO_NON_MP3: "video/*,audio/wav,audio/x-wav,audio/aac,audio/ogg,audio/webm,audio/flac"
} as const;

/**
 * Common video MIME types
 */
export const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
  "video/x-matroska", // .mkv
  "video/webm",
  "video/x-flv"
] as const;

/**
 * Common audio MIME types
 */
export const AUDIO_MIME_TYPES = [
  "audio/mpeg", // .mp3
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
  "audio/ogg",
  "audio/webm",
  "audio/flac"
] as const;

/**
 * Common image MIME types
 */
export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp"
] as const;

/**
 * Check if a MIME type matches an accept pattern
 *
 * @param fileMimeType - The file's MIME type (e.g., "video/mp4")
 * @param acceptPattern - Accept pattern (e.g., "video/*" or "video/mp4,audio/*")
 * @returns True if the MIME type matches the pattern
 *
 * @example
 * matchesMimeType("video/mp4", "video/*") // true
 * matchesMimeType("audio/mp3", "video/*") // false
 * matchesMimeType("video/mp4", "video/*,audio/*") // true
 */
export function matchesMimeType(fileMimeType: string | null, acceptPattern: string): boolean {
  if (!fileMimeType) return false;

  const patterns = acceptPattern.split(",").map((p) => p.trim());

  return patterns.some((pattern) => {
    // Wildcard pattern (e.g., "video/*")
    if (pattern.endsWith("/*")) {
      const baseType = pattern.split("/")[0];
      return fileMimeType.startsWith(`${baseType}/`);
    }

    // Exact match (e.g., "video/mp4")
    return fileMimeType === pattern;
  });
}

/**
 * Get media type category from MIME type
 *
 * @param mimeType - The file's MIME type
 * @returns The category: "video", "audio", "image", or "other"
 */
export function getMediaCategory(mimeType: string | null): "video" | "audio" | "image" | "other" {
  if (!mimeType) return "other";

  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("image/")) return "image";

  return "other";
}

/**
 * Get a friendly label for an accept pattern
 *
 * @param acceptPattern - Accept pattern (e.g., "video/*")
 * @returns Human-readable label
 *
 * @example
 * getAcceptLabel("video/*") // "Videos"
 * getAcceptLabel("video/*,audio/*") // "Videos & Audio"
 */
export function getAcceptLabel(acceptPattern: string): string {
  const patterns = acceptPattern.split(",").map((p) => p.trim());

  const labels: string[] = [];

  if (patterns.some((p) => p === "video/*" || p.startsWith("video/"))) {
    labels.push("Videos");
  }
  if (patterns.some((p) => p === "audio/*" || p.startsWith("audio/"))) {
    labels.push("Audio");
  }
  if (patterns.some((p) => p === "image/*" || p.startsWith("image/"))) {
    labels.push("Images");
  }

  if (labels.length === 0) return "All Files";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} & ${labels[1]}`;

  return labels.slice(0, -1).join(", ") + " & " + labels[labels.length - 1];
}

/**
 * Get file extension from filename or URL
 *
 * @param filename - File name or URL
 * @returns File extension without dot (e.g., "mp4")
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Check if a file extension is valid for a given accept pattern
 *
 * @param extension - File extension (with or without dot)
 * @param acceptPattern - Accept pattern
 * @returns True if extension is valid
 */
export function isValidExtension(extension: string, acceptPattern: string): boolean {
  const ext = extension.startsWith(".") ? extension.slice(1) : extension;
  const lower = ext.toLowerCase();

  // Map extensions to MIME types
  const extensionMimeMap: Record<string, string> = {
    // Video
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    webm: "video/webm",
    flv: "video/x-flv",
    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",
    aac: "audio/aac",
    ogg: "audio/ogg",
    flac: "audio/flac",
    // Image
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    bmp: "image/bmp"
  };

  const mimeType = extensionMimeMap[lower];
  if (!mimeType) return false;

  return matchesMimeType(mimeType, acceptPattern);
}

/**
 * Format file size to human-readable string
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.4 MB")
 */
export function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Get icon name for media type (Lucide icon names)
 *
 * @param mimeType - File MIME type
 * @returns Icon identifier
 */
export function getMediaIcon(mimeType: string | null): {
  name: "Video" | "Music" | "Image" | "File";
  color: string;
} {
  if (!mimeType) {
    return { name: "File", color: "text-gray-500" };
  }

  if (mimeType.startsWith("video/")) {
    return { name: "Video", color: "text-purple-500" };
  }
  if (mimeType.startsWith("audio/")) {
    return { name: "Music", color: "text-green-500" };
  }
  if (mimeType.startsWith("image/")) {
    return { name: "Image", color: "text-blue-500" };
  }

  return { name: "File", color: "text-gray-500" };
}
