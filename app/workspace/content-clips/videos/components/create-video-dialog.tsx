"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UrlInputWithPicker } from "@/app/workspace/media-tools/components/url-input-with-picker";
import { MEDIA_TYPES } from "@/lib/media-types";

import {
  createVideoSchema,
  type CreateVideoFormValues,
  clipSizeOptions,
  durationOptions,
  parseClipSize
} from "../lib/schema";

export function CreateVideoDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoFileId, setVideoFileId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CreateVideoFormValues>({
    resolver: zodResolver(createVideoSchema),
    defaultValues: {
      videoUrl: "",
      clipSize: undefined,
      duration: undefined,
      numberOfClips: undefined
    }
  });

  async function onSubmit(values: CreateVideoFormValues) {
    setIsSubmitting(true);

    try {
      // Parse clip size to get width and height
      const clipDimensions = parseClipSize(values.clipSize);

      if (!clipDimensions) {
        throw new Error("Invalid clip size selected");
      }

      // Prepare video data for insertion
      const videoData = {
        video_url: values.videoUrl,
        source_file_id: videoFileId || undefined,
        clip_width: clipDimensions.width,
        clip_height: clipDimensions.height,
        videos_to_create: values.numberOfClips,
        description: `Video for ${values.numberOfClips} clips at ${values.clipSize}`,
        active_video: false
      };

      // Call API to create video
      const response = await fetch("/api/workspace/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(videoData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create video");
      }

      const result = await response.json();

      toast({
        title: "Video created successfully!",
        description: `VID ${result.vid} has been created with ${values.numberOfClips} target clips.`
      });

      // Reset form and close dialog
      form.reset();
      setVideoFileId(null);
      setOpen(false);

      // Refresh the page to show new video
      router.refresh();
    } catch (error) {
      console.error("Error creating video:", error);
      toast({
        variant: "destructive",
        title: "Error creating video",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline-block">Create Video</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Clippy</DialogTitle>
          <DialogDescription>We&apos;ll get back to you soon</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is the video URL?</FormLabel>
                  <FormControl>
                    <UrlInputWithPicker
                      id="video-url"
                      value={field.value}
                      onChange={field.onChange}
                      onFileIdChange={setVideoFileId}
                      accept={MEDIA_TYPES.VIDEO}
                      placeholder="Select video or paste URL..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clipSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clip Size</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select clip size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clipSizeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How long?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {durationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numberOfClips"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How many of them</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="10"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : parseInt(value, 10));
                      }}
                      value={field.value ?? ""}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Video
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
