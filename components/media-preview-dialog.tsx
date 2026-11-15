"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Play, Volume2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

interface MediaPreviewDialogProps {
  url: string | null;
  type: "image" | "video" | "audio";
  alt?: string;
  className?: string;
}

export function MediaPreviewDialog({ url, type, alt, className }: MediaPreviewDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!url) {
    return <span className="text-muted-foreground text-xs">Not generated</span>;
  }

  // Render thumbnail based on type
  const renderThumbnail = () => {
    switch (type) {
      case "image":
        return (
          <div className={cn("relative w-16 h-16 group cursor-pointer", className)}>
            <div className="relative w-full h-full rounded border border-gray-200 overflow-hidden group-hover:border-blue-500 group-hover:shadow-md transition-all">
              <Image
                src={url}
                alt={alt || "Preview"}
                fill
                sizes="64px"
                className="object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded transition-all flex items-center justify-center pointer-events-none">
              <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        );

      case "video":
        return (
          <div className={cn("relative w-16 h-16 group cursor-pointer", className)}>
            <div className="relative w-full h-full rounded border border-gray-200 overflow-hidden group-hover:border-blue-500 group-hover:shadow-md transition-all">
              <video
                src={url}
                className="w-full h-full object-cover"
                preload="metadata"
                muted
              />
            </div>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 rounded transition-all flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 rounded-full p-2 group-hover:bg-white transition-colors">
                <Play className="h-4 w-4 text-gray-700 fill-gray-700" />
              </div>
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="relative group cursor-pointer">
            <div className={cn("w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center transition-all group-hover:border-blue-500 group-hover:shadow-md", className)}>
              <Volume2 className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render full content in dialog
  const renderDialogContent = () => {
    switch (type) {
      case "image":
        return (
          <div className="relative flex items-center justify-center w-full" style={{ maxHeight: "80vh" }}>
            <div className="relative w-full h-full max-h-[80vh]">
              <Image
                src={url}
                alt={alt || "Full size preview"}
                width={1200}
                height={800}
                className="max-w-full max-h-[80vh] object-contain rounded mx-auto"
                loading="lazy"
                quality={90}
              />
            </div>
          </div>
        );

      case "video":
        return (
          <div className="flex items-center justify-center">
            <video
              src={url}
              controls
              autoPlay
              className="max-w-full max-h-[80vh] rounded"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case "audio":
        return (
          <div className="flex flex-col items-center justify-center gap-4 p-8">
            <Volume2 className="h-16 w-16 text-gray-400" />
            <audio src={url} controls autoPlay className="w-full max-w-md">
              Your browser does not support the audio tag.
            </audio>
            <p className="text-sm text-muted-foreground">
              {alt || "Audio preview"}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {renderThumbnail()}
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <VisuallyHidden>
          <DialogTitle>{alt || `${type.charAt(0).toUpperCase() + type.slice(1)} preview`}</DialogTitle>
        </VisuallyHidden>
        {renderDialogContent()}
      </DialogContent>
    </Dialog>
  );
}
