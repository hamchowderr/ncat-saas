"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  File,
  FileText,
  Film,
  Music,
  Archive,
  Trash2,
  Download,
  Share2,
  ChevronRight,
  ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { createClient } from '@/lib/client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const supabase = createClient();

interface FileRecord {
  id: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="size-4" />;
  } else if (mimeType.startsWith('video/')) {
    return <Film className="size-4" />;
  } else if (mimeType.startsWith('audio/')) {
    return <Music className="size-4" />;
  } else if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) {
    return <Archive className="size-4" />;
  } else if (mimeType.includes('document') || mimeType.includes('pdf') || mimeType.includes('text')) {
    return <FileText className="size-4" />;
  } else {
    return <File className="size-4" />;
  }
}

export function TableRecentFiles() {
  const [fileList, setFileList] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentFiles();
  }, []);

  const fetchRecentFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: files, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching files:', error);
      } else {
        setFileList(files || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (file: FileRecord) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(file.file_path);

      if (error) {
        console.error('Error downloading file:', error);
        alert('Failed to download file');
        return;
      }

      // Create blob URL and trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to download file');
    }
  };

  const shareFile = async (file: FileRecord) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .createSignedUrl(file.file_path, 3600); // 1 hour expiry

      if (error) {
        console.error('Error creating share URL:', error);
        alert('Failed to create share link');
        return;
      }

      // Copy URL to clipboard
      await navigator.clipboard.writeText(data.signedUrl);
      alert('Share link copied to clipboard! Link expires in 1 hour.');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create share link');
    }
  };

  const deleteFile = async (file: FileRecord) => {
    try {
      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([file.file_path]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) {
        console.error('Error deleting from database:', dbError);
        alert('Failed to delete file');
      } else {
        setFileList(fileList.filter((f) => f.id !== file.id));
        alert('File deleted successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete file');
    }
  };

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle>Recently Uploaded Files</CardTitle>
        <CardAction className="relative -mt-2.5">
          <div className="absolute end-0 top-0">
            <Link href="/workspace/files">
              <Button variant="outline">
                <span className="hidden lg:inline">View All</span>
                <ChevronRight />
              </Button>
            </Link>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="lg:w-[300px]">Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading recent files...
                </TableCell>
              </TableRow>
            ) : fileList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No files uploaded yet. Upload your first file to see it here!
                </TableCell>
              </TableRow>
            ) : (
              fileList.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-primary flex items-center space-x-2 hover:underline">
                      {getFileIcon(file.mime_type || '')}
                      <span>{file.original_name}</span>
                    </Link>
                  </TableCell>
                  <TableCell>{formatFileSize(file.file_size)}</TableCell>
                  <TableCell>{format(new Date(file.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => downloadFile(file)}>
                          <Download />
                          <span>Download</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => shareFile(file)}>
                          <Share2 />
                          <span>Share</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteFile(file)}>
                          <Trash2 />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
