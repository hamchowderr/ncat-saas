import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";

interface FileRecord {
  id: string;
  file_path: string;
  bucket: string | null;
  file_name: string;
  mime_type: string | null;
}

interface UseFileUrlOptions {
  useSignedUrl?: boolean;
  expiresIn?: number; // seconds
}

/**
 * Custom hook to generate public or signed URLs for Supabase storage files
 *
 * @param file - File record from the database
 * @param options - URL generation options
 * @returns Object containing the URL, loading state, and error
 */
export function useFileUrl(file: FileRecord | null, options: UseFileUrlOptions = {}) {
  const { useSignedUrl = false, expiresIn = 3600 } = options;
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    const generateUrl = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const bucket = file.bucket || "files";

        if (useSignedUrl) {
          // Generate signed URL with expiration
          const { data, error: urlError } = await supabase.storage
            .from(bucket)
            .createSignedUrl(file.file_path, expiresIn);

          if (urlError) {
            throw urlError;
          }

          setUrl(data.signedUrl);
        } else {
          // Get public URL (works for public buckets)
          const { data } = supabase.storage.from(bucket).getPublicUrl(file.file_path);
          setUrl(data.publicUrl);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to generate URL";
        setError(errorMessage);
        console.error("Error generating file URL:", err);
      } finally {
        setIsLoading(false);
      }
    };

    generateUrl();
  }, [file?.id, useSignedUrl, expiresIn]);

  return { url, isLoading, error };
}

/**
 * Utility function to get public URL synchronously
 * Use this when you don't need the hook's reactivity
 */
export function getPublicFileUrl(file: FileRecord): string {
  const supabase = createClient();
  const bucket = file.bucket || "files";
  const { data } = supabase.storage.from(bucket).getPublicUrl(file.file_path);
  return data.publicUrl;
}

/**
 * Utility function to get signed URL
 * Returns a promise since it requires async operation
 */
export async function getSignedFileUrl(
  file: FileRecord,
  expiresIn: number = 3600
): Promise<string | null> {
  const supabase = createClient();
  const bucket = file.bucket || "files";

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(file.file_path, expiresIn);

    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error("Error in getSignedFileUrl:", err);
    return null;
  }
}
