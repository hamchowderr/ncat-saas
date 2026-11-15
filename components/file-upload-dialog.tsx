"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/dropzone";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import { useStorageQuota } from "@/hooks/use-storage-quota";
import { formatBytes } from "@/lib/storage-quota";
import { UploadIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface FileUploadDialogProps {
  /**
   * Supabase Storage bucket name
   * @default "files"
   */
  bucketName?: string;
  /**
   * Subfolder path within the bucket
   * @default "uploads"
   */
  path?: string;
  /**
   * Maximum number of files allowed per upload
   * @default 10
   */
  maxFiles?: number;
  /**
   * Maximum file size in bytes
   * @default 52428800 (50MB)
   */
  maxFileSize?: number;
  /**
   * Allowed MIME types (e.g., "image/*", "audio/mpeg")
   * @default ["image/*", "audio/mpeg", "audio/mp3", "video/mp4"]
   */
  allowedMimeTypes?: string[];
  /**
   * Callback fired after successful upload completion
   */
  onUploadComplete?: () => void;
  /**
   * Custom text for the trigger button
   * @default "Upload Files"
   */
  buttonText?: string;
  /**
   * Button variant style
   * @default "default"
   */
  buttonVariant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
  /**
   * Button size
   * @default "default"
   */
  buttonSize?: "default" | "sm" | "lg" | "icon";
}

export function FileUploadDialog({
  bucketName = "files",
  path = "uploads",
  maxFiles = 10,
  maxFileSize = 500 * 1024 * 1024, // 500MB
  allowedMimeTypes = ["image/*", "audio/mpeg", "audio/mp3", "video/mp4"],
  onUploadComplete,
  buttonText = "Upload Files",
  buttonVariant = "default",
  buttonSize = "default"
}: FileUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: quota } = useStorageQuota();

  const dropzoneProps = useSupabaseUpload({
    bucketName,
    path,
    allowedMimeTypes,
    maxFiles,
    maxFileSize
  });

  // Calculate total size of selected files
  const totalSelectedSize = useMemo(
    () => dropzoneProps.files.reduce((acc, file) => acc + file.size, 0),
    [dropzoneProps.files]
  );

  const handleUpload = async () => {
    await dropzoneProps.onUpload();

    // Close dialog and trigger callback after successful upload
    if (dropzoneProps.isSuccess) {
      setOpen(false);
      dropzoneProps.setFiles([]);
      onUploadComplete?.();
    }
  };

  // Auto-close dialog on successful upload
  if (dropzoneProps.isSuccess && open) {
    setTimeout(() => {
      setOpen(false);
      dropzoneProps.setFiles([]);
      onUploadComplete?.();
    }, 1000);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>
          <UploadIcon className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Drag and drop files or click to browse. Maximum {maxFiles} file
            {maxFiles > 1 ? "s" : ""} (up to {Math.round(maxFileSize / 1024 / 1024)}MB each).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Dropzone {...dropzoneProps}>
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>

          {/* Storage Quota Display */}
          {quota && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Storage:</span>
                <span className="font-medium">
                  {formatBytes(quota.used)} / {formatBytes(quota.quota)} used
                </span>
              </div>
              {dropzoneProps.files.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Uploading {formatBytes(totalSelectedSize)} will use{" "}
                  {Math.round(((quota.used + totalSelectedSize) / quota.quota) * 100)}% of your
                  quota
                </div>
              )}
              {quota.isNearLimit && (
                <Alert className="mt-2" variant={quota.isExceeded ? "destructive" : "default"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {quota.isExceeded
                      ? "Storage quota exceeded. "
                      : "Approaching storage limit. "}
                    <Link href="/billing" className="font-medium underline">
                      Upgrade your plan
                    </Link>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {dropzoneProps.files.length > 0 && (
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-sm">
                {dropzoneProps.files.length} file{dropzoneProps.files.length > 1 ? "s" : ""}{" "}
                selected ({formatBytes(totalSelectedSize)})
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => dropzoneProps.setFiles([])}
                  disabled={dropzoneProps.loading}
                >
                  Clear
                </Button>
                <Button onClick={handleUpload} disabled={dropzoneProps.loading}>
                  {dropzoneProps.loading ? (
                    <>
                      <span className="mr-2">Uploading...</span>
                      <span className="animate-spin">⏳</span>
                    </>
                  ) : (
                    <>
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Upload {dropzoneProps.files.length} file
                      {dropzoneProps.files.length > 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {dropzoneProps.errors.length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">Upload Errors:</p>
              <ul className="mt-1 list-inside list-disc text-sm text-red-700">
                {dropzoneProps.errors.map((error, index) => (
                  <li key={index}>
                    {error.name}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
