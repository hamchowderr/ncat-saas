"use client";

import * as React from "react";
import { Upload, UploadIcon, X } from "lucide-react";
import { createClient } from '@/lib/client'
import { Database } from "@/lib/database.types";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const supabase = createClient()

type FileRecord = Database['public']['Tables']['files']['Row'];

interface FileUploadDialogProps {
  onUploadSuccess?: (uploadedFiles?: FileRecord[]) => void;
}

export function FileUploadDialog({ onUploadSuccess }: FileUploadDialogProps = {}) {
  const [open, setOpen] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [dragActive, setDragActive] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    const totalFiles = files.length + newFiles.length;
    
    if (totalFiles > 10) {
      const remainingSlots = 10 - files.length;
      const filesToAdd = newFiles.slice(0, remainingSlots);
      setFiles((prevFiles) => [...prevFiles, ...filesToAdd]);
    } else {
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const generateUniqueFileName = (fileName: string, timestamp: number) => {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return `${fileName}_${timestamp}`;
    }
    const name = fileName.substring(0, lastDotIndex);
    const extension = fileName.substring(lastDotIndex);
    return `${name}_${timestamp}${extension}`;
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    console.log('🚀 Starting upload process for', files.length, 'files');

    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to upload files');
        setUploading(false);
        return;
      }

      const uploadResults = [];
      const uploadedFileData = [];

      // Get session token for Edge Function authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('Authentication error - please refresh and try again');
        setUploading(false);
        return;
      }

      // Upload files using Edge Function
      for (const file of files) {
        try {
          // Create FormData for the edge function
          const formData = new FormData()
          formData.append('file', file)

          // Call our edge function
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
          const response = await fetch(`${supabaseUrl}/functions/v1/file-upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: formData
          })

          const result = await response.json()

          if (!response.ok || !result.success) {
            throw new Error(result.error || 'Upload failed')
          }

          uploadResults.push({
            originalName: file.name,
            uploadedName: result.fileName || file.name,
            status: 'success',
            data: result.data
          });

          // Create optimistic file data for immediate UI update
          uploadedFileData.push({
            id: crypto.randomUUID(), // Temporary ID, will be replaced by actual fetch
            file_name: result.fileName || file.name,
            original_name: file.name,
            file_size: file.size || null, // Handle nullable field
            mime_type: file.type || null, // Handle nullable field
            user_id: session.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(), // Add missing field
            bucket: 'files', // Add missing field with default value
            file_path: result.filePath || `uploads/${session.user.id}/${result.fileName || file.name}` // Add missing field
          });
        } catch (fileError) {
          console.error(`Upload failed for ${file.name}:`, fileError);
          uploadResults.push({
            originalName: file.name,
            status: 'error',
            error: fileError
          });
        }
      }
      
      // Check results and show appropriate messages
      const successful = uploadResults.filter(r => r.status === 'success' || r.status === 'renamed');
      const renamed = uploadResults.filter(r => r.status === 'renamed');
      const failed = uploadResults.filter(r => r.status === 'error');
      
      if (successful.length > 0) {
        console.log('🎉 Showing success toast for', successful.length, 'files');
        if (renamed.length > 0) {
          toast.success(`Successfully uploaded ${successful.length} file${successful.length > 1 ? 's' : ''}`, {
            description: `${renamed.length} file${renamed.length > 1 ? 's were' : ' was'} renamed to avoid duplicates`,
            duration: 5000,
          });
        } else {
          toast.success(`Successfully uploaded ${successful.length} file${successful.length > 1 ? 's' : ''}`, {
            duration: 3000,
          });
        }

        // Call the onUploadSuccess callback immediately with uploaded file data
        // This enables optimistic UI updates while background refresh handles consistency
        if (onUploadSuccess) {
          onUploadSuccess(uploadedFileData);
        }
      }

      if (failed.length > 0) {
        const failedNames = failed.map(r => r.originalName).join(', ');
        console.log('❌ Showing error toast for failed files:', failedNames);
        toast.error(`Failed to upload: ${failedNames}`, {
          duration: 5000,
        });
      }

      // Close dialog and reset if any files were successful
      if (successful.length > 0) {
        setOpen(false);
        setFiles([]);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => {
        setOpen(true);
        // Test toast to verify Sonner is working
        console.log('📢 Dialog opened, testing toast...');
        toast.info('Upload dialog opened', { duration: 2000 });
      }}>
        <UploadIcon />
        <span className="hidden sm:inline">Upload</span>
      </Button>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload files directly to Supabase Storage. Supports images, MP3 audio, and MP4 video files up to 50MB each. Maximum 10 files.
          </DialogDescription>
        </DialogHeader>
        <div
          className={`mt-2 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 ${
            dragActive ? "bg-blue-50" : ""
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}>
          <div className="text-center">
            <Upload className="mx-auto size-10 opacity-25" aria-hidden="true" />
            <div className="mt-4 flex items-center justify-center text-sm leading-none">
              <Label htmlFor="file-upload" className="relative cursor-pointer">
                <span>Upload files</span>
                <Input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only h-auto p-0"
                  onChange={handleChange}
                  multiple
                  accept="image/*,audio/mpeg,audio/mp3,video/mp4"
                />
              </Label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-muted-foreground text-xs leading-5 mt-2">Images, MP3, MP4 up to 50MB each (max 10 files)</p>
          </div>
        </div>
        {files.length > 0 && (
          <div>
            <h4 className="text-sm">Selected Files ({files.length}/10)</h4>
            <ul className="divide mt-2 divide-y rounded-md border max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between py-2 pr-2 pl-4 text-sm leading-6">
                  <div className="flex w-0 flex-1 items-center">
                    <div className="flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">{file.name}</span>
                      <span className="text-muted-foreground shrink-0">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <X />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={files.length === 0 || uploading}>
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
