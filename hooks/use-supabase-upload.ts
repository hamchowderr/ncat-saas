import { createClient } from "@/lib/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type FileError, type FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";

const supabase = createClient();

// Debug Supabase client initialization
console.log("🔧 Supabase client initialized:", supabase);
console.log("🔧 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(
  "🔧 Supabase Anon Key exists:",
  !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
);

interface FileWithPreview extends File {
  preview?: string;
  errors: readonly FileError[];
}

type UseSupabaseUploadOptions = {
  /**
   * Name of bucket to upload files to in your Supabase project
   */
  bucketName: string;
  /**
   * Folder to upload files to in the specified bucket within your Supabase project.
   *
   * Defaults to uploading files to the root of the bucket
   *
   * e.g If specified path is `test`, your file will be uploaded as `test/file_name`
   */
  path?: string;
  /**
   * Allowed MIME types for each file upload (e.g `image/png`, `text/html`, etc). Wildcards are also supported (e.g `image/*`).
   *
   * Defaults to allowing uploading of all MIME types.
   */
  allowedMimeTypes?: string[];
  /**
   * Maximum upload size of each file allowed in bytes. (e.g 1000 bytes = 1 KB)
   */
  maxFileSize?: number;
  /**
   * Maximum number of files allowed per upload.
   */
  maxFiles?: number;
  /**
   * The number of seconds the asset is cached in the browser and in the Supabase CDN.
   *
   * This is set in the Cache-Control: max-age=<seconds> header. Defaults to 3600 seconds.
   */
  cacheControl?: number;
  /**
   * When set to true, the file is overwritten if it exists.
   *
   * When set to false, an error is thrown if the object already exists. Defaults to `false`
   */
  upsert?: boolean;
};

type UseSupabaseUploadReturn = ReturnType<typeof useSupabaseUpload>;

const useSupabaseUpload = (options: UseSupabaseUploadOptions) => {
  const {
    bucketName,
    path,
    allowedMimeTypes = [],
    maxFileSize = Number.POSITIVE_INFINITY,
    maxFiles = 1,
    cacheControl = 3600,
    upsert = false
  } = options;

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ name: string; message: string }[]>([]);
  const [successes, setSuccesses] = useState<string[]>([]);

  const isSuccess = useMemo(() => {
    if (errors.length === 0 && successes.length === 0) {
      return false;
    }
    if (errors.length === 0 && successes.length === files.length) {
      return true;
    }
    return false;
  }, [errors.length, successes.length, files.length]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      console.log("📁 Files dropped/selected:");
      console.log("Accepted files:", acceptedFiles);
      console.log("Rejected files:", fileRejections);

      const validFiles = acceptedFiles
        .filter((file) => !files.find((x) => x.name === file.name))
        .map((file) => {
          (file as FileWithPreview).preview = URL.createObjectURL(file);
          (file as FileWithPreview).errors = [];
          return file as FileWithPreview;
        });

      const invalidFiles = fileRejections.map(({ file, errors }) => {
        (file as FileWithPreview).preview = URL.createObjectURL(file);
        (file as FileWithPreview).errors = errors;
        return file as FileWithPreview;
      });

      // Check if adding new files would exceed maxFiles limit
      const totalFiles = files.length + validFiles.length + invalidFiles.length;
      if (totalFiles > maxFiles) {
        console.log(`⚠️ File limit exceeded. Max: ${maxFiles}, Attempted: ${totalFiles}`);
        // Only add files up to the limit
        const remainingSlots = maxFiles - files.length;
        const filesToAdd = [...validFiles, ...invalidFiles].slice(0, remainingSlots);
        const newFiles = [...files, ...filesToAdd];
        console.log("Updated files list (limited):", newFiles);
        setFiles(newFiles);
      } else {
        const newFiles = [...files, ...validFiles, ...invalidFiles];
        console.log("Updated files list:", newFiles);
        setFiles(newFiles);
      }
    },
    [files, setFiles]
  );

  const dropzoneProps = useDropzone({
    onDrop,
    noClick: false,
    accept: allowedMimeTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    maxFiles: maxFiles,
    multiple: maxFiles !== 1
  });

  const onUpload = useCallback(async () => {
    console.log("🚀 Starting upload process...");
    console.log("Files to upload:", files);
    console.log("Bucket name:", bucketName);
    console.log("Path:", path);

    // Check authentication status
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    console.log("🔐 Current user:", user);
    console.log("🔐 Auth error:", authError);

    if (!user) {
      console.error("❌ User not authenticated");
      toast.error("You must be logged in to upload files");
      setErrors([{ name: "auth", message: "You must be logged in to upload files" }]);
      return;
    }

    setLoading(true);

    // [Joshen] This is to support handling partial successes
    // If any files didn't upload for any reason, hitting "Upload" again will only upload the files that had errors
    const filesWithErrors = errors.map((x) => x.name);
    const filesToUpload =
      filesWithErrors.length > 0
        ? [
            ...files.filter((f) => filesWithErrors.includes(f.name)),
            ...files.filter((f) => !successes.includes(f.name))
          ]
        : files;

    console.log("Files to upload after filtering:", filesToUpload);

    const responses = await Promise.all(
      filesToUpload.map(async (file) => {
        console.log(`📤 Uploading file: ${file.name}`);

        try {
          // Get the current session token for the edge function
          const {
            data: { session }
          } = await supabase.auth.getSession();

          if (!session?.access_token) {
            console.error(`❌ No access token for ${file.name}`);
            return { name: file.name, message: "No valid session token" };
          }

          // Create FormData for the edge function
          const formData = new FormData();
          formData.append("file", file);

          // Call our edge function instead of direct storage upload
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
          const response = await fetch(`${supabaseUrl}/functions/v1/file-upload`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`
            },
            body: formData
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            console.error(`❌ Edge function upload failed for ${file.name}:`, result.error);
            return { name: file.name, message: result.error || "Upload failed" };
          } else {
            console.log(`✅ Edge function upload successful for ${file.name}:`, result);
            return { name: file.name, message: undefined };
          }
        } catch (error) {
          console.error(`❌ Upload failed for ${file.name}:`, error);
          return {
            name: file.name,
            message: error instanceof Error ? error.message : "Unknown error"
          };
        }
      })
    );

    console.log("Upload responses:", responses);

    const responseErrors = responses.filter((x) => x.message !== undefined);
    // if there were errors previously, this function tried to upload the files again so we should clear/overwrite the existing errors.
    setErrors(responseErrors);

    const responseSuccesses = responses.filter((x) => x.message === undefined);
    const newSuccesses = Array.from(
      new Set([...successes, ...responseSuccesses.map((x) => x.name)])
    );
    setSuccesses(newSuccesses);

    console.log("Errors:", responseErrors);
    console.log("Successes:", newSuccesses);

    // Show success/error notifications
    if (responseSuccesses.length > 0) {
      toast.success(
        `Successfully uploaded ${responseSuccesses.length} file${responseSuccesses.length > 1 ? "s" : ""}`,
        {
          duration: 3000
        }
      );
    }

    if (responseErrors.length > 0) {
      const errorFileNames = responseErrors.map((e) => e.name).join(", ");
      toast.error(`Failed to upload: ${errorFileNames}`, {
        duration: 5000
      });
    }

    setLoading(false);
  }, [files, path, bucketName, errors, successes, cacheControl, upsert]);

  useEffect(() => {
    if (files.length === 0) {
      setErrors([]);
    }

    // If the number of files doesn't exceed the maxFiles parameter, remove the error 'Too many files' from each file
    if (files.length <= maxFiles) {
      let changed = false;
      const newFiles = files.map((file) => {
        if (file.errors.some((e) => e.code === "too-many-files")) {
          file.errors = file.errors.filter((e) => e.code !== "too-many-files");
          changed = true;
        }
        return file;
      });
      if (changed) {
        setFiles(newFiles);
      }
    }
  }, [files.length, setFiles, maxFiles]);

  return {
    files,
    setFiles,
    successes,
    isSuccess,
    loading,
    errors,
    setErrors,
    onUpload,
    maxFileSize: maxFileSize,
    maxFiles: maxFiles,
    allowedMimeTypes,
    ...dropzoneProps
  };
};

export { useSupabaseUpload, type UseSupabaseUploadOptions, type UseSupabaseUploadReturn };
