"use client";

import * as React from "react";
import { Upload, UploadIcon, X } from "lucide-react";
import { createClient } from '@/lib/client'

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

export function FileUploadDialog() {
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
    
    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (!user) {
        alert('You must be logged in to upload files');
        setUploading(false);
        return;
      }

      const uploadResults = [];
      
      // Upload files one by one to handle duplicates individually
      for (const file of files) {
        const userPath = `${user.id}/${file.name}`;
        const uploadPath = `uploads/${userPath}`;
        
        try {
          const { data, error } = await supabase.storage
            .from('files')
            .upload(uploadPath, file, {
              cacheControl: '3600',
              upsert: false,
            });
          
          if (error) {
            // Handle duplicate file error (409 or ResourceAlreadyExists)
            if (error.message?.includes('already exists') || error.message?.includes('Duplicate') || error.message?.includes('ResourceAlreadyExists')) {
              // Generate unique filename with timestamp
              const timestamp = Date.now();
              const uniqueFileName = generateUniqueFileName(file.name, timestamp);
              const uniqueUserPath = `${user.id}/${uniqueFileName}`;
              const uniqueUploadPath = `uploads/${uniqueUserPath}`;
              
              // Retry with unique filename
              const { data: retryData, error: retryError } = await supabase.storage
                .from('files')
                .upload(uniqueUploadPath, file, {
                  cacheControl: '3600',
                  upsert: false,
                });
              
              if (retryError) {
                throw retryError;
              }
              
              // Save file metadata to database
              await supabase.from('files').insert({
                user_id: user.id,
                file_name: uniqueFileName,
                original_name: file.name,
                file_path: uniqueUploadPath,
                file_size: file.size,
                mime_type: file.type,
                bucket_name: 'files'
              });

              uploadResults.push({
                originalName: file.name,
                uploadedName: uniqueFileName,
                status: 'renamed',
                data: retryData
              });
            } else {
              throw error;
            }
          } else {
            // Save file metadata to database for successful uploads
            await supabase.from('files').insert({
              user_id: user.id,
              file_name: file.name,
              original_name: file.name,
              file_path: uploadPath,
              file_size: file.size,
              mime_type: file.type,
              bucket_name: 'files'
            });

            uploadResults.push({
              originalName: file.name,
              uploadedName: file.name,
              status: 'success',
              data: data
            });
          }
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
        let message = `Successfully uploaded ${successful.length} file${successful.length > 1 ? 's' : ''}`;
        
        if (renamed.length > 0) {
          message += `\n\n${renamed.length} file${renamed.length > 1 ? 's were' : ' was'} renamed to avoid duplicates:`;
          renamed.forEach(r => {
            message += `\n• "${r.originalName}" → "${r.uploadedName}"`;
          });
        }
        
        alert(message);
      }
      
      if (failed.length > 0) {
        const failedNames = failed.map(r => r.originalName).join(', ');
        alert(`Failed to upload: ${failedNames}`);
      }
      
      // Close dialog and reset if any files were successful
      if (successful.length > 0) {
        setOpen(false);
        setFiles([]);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
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
            <div className="mt-4 flex text-sm leading-none">
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
            <p className="text-muted-foreground text-xs leading-5">Images, MP3, MP4 up to 50MB each (max 10 files)</p>
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
