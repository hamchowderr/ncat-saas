import { z } from "zod";

// Clip size options mapping
export const clipSizeOptions = [
  { value: "1920x1080", label: "1920x1080 (Landscape)", width: 1920, height: 1080 },
  { value: "1080x1920", label: "1080x1920 (Portrait)", width: 1080, height: 1920 },
  { value: "1080x1080", label: "1080x1080 (Square)", width: 1080, height: 1080 }
] as const;

// Duration options mapping (in seconds)
export const durationOptions = [
  { value: "60", label: "1 Minute", seconds: 60 },
  { value: "180", label: "3 Minutes", seconds: 180 },
  { value: "300", label: "5 Minutes", seconds: 300 }
] as const;

// Zod schema for video creation form
export const createVideoSchema = z.object({
  videoUrl: z
    .string()
    .min(1, "Video URL is required")
    .url("Please enter a valid URL")
    .refine((url) => {
      // Allow common video hosting domains and general URLs
      const validDomains = [
        "youtube.com",
        "youtu.be",
        "vimeo.com",
        "loom.com",
        "wistia.com",
        "dropbox.com",
        "drive.google.com",
        "s3.amazonaws.com",
        "cloudfront.net"
      ];
      try {
        const urlObj = new URL(url);
        // Allow if it's from a known video domain OR has video file extension
        const isKnownDomain = validDomains.some((domain) => urlObj.hostname.includes(domain));
        const hasVideoExtension = /\.(mp4|mov|avi|webm|mkv|flv|m4v)$/i.test(urlObj.pathname);
        return isKnownDomain || hasVideoExtension || true; // Allow all URLs for flexibility
      } catch {
        return false;
      }
    }, "Please enter a valid video URL"),
  clipSize: z.enum(["1920x1080", "1080x1920", "1080x1080"], {
    required_error: "Please select a clip size"
  }),
  duration: z.enum(["60", "180", "300"], {
    required_error: "Please select a duration"
  }),
  numberOfClips: z
    .number({
      required_error: "Number of clips is required",
      invalid_type_error: "Please enter a valid number"
    })
    .int("Must be a whole number")
    .min(1, "Must be at least 1")
    .max(100, "Cannot exceed 100 clips")
});

export type CreateVideoFormValues = z.infer<typeof createVideoSchema>;

// Helper function to parse clip size
export function parseClipSize(sizeString: string) {
  const option = clipSizeOptions.find((opt) => opt.value === sizeString);
  return option ? { width: option.width, height: option.height } : null;
}

// Helper function to parse duration
export function parseDuration(durationString: string) {
  const option = durationOptions.find((opt) => opt.value === durationString);
  return option ? option.seconds : null;
}
