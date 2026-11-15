"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const formSchema = z.object({
  story_id: z.string().min(1, "Story is required"),
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().optional(),
  sequence_number: z.number().int().min(1, "Sequence number must be at least 1"),
  duration_seconds: z.number().int().min(1).optional(),
  status: z.enum(["planned", "generating", "completed", "failed"]),
  scene_script: z.string().optional(),
  approved: z.boolean()
});

type FormValues = z.infer<typeof formSchema>;

interface Scene {
  id: string;
  story_id: string;
  title: string;
  description?: string | null;
  sequence_number: number;
  duration_seconds?: number | null;
  status: "planned" | "generating" | "completed" | "failed";
  scene_script?: string | null;
  audio_url?: string | null;
  video_url?: string | null;
  final_scene_url?: string | null;
  audio_upload_url?: string | null;
  video_upload_url?: string | null;
  approved: boolean;
}

interface SceneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scene?: Scene;
  mode: "create" | "edit";
}

export function SceneFormDialog({ open, onOpenChange, scene, mode }: SceneFormDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [stories, setStories] = useState<Array<{ id: string; title: string }>>([]);
  const [loadingStories, setLoadingStories] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      story_id: scene?.story_id || "",
      title: scene?.title || "",
      description: scene?.description || "",
      sequence_number: scene?.sequence_number || 1,
      duration_seconds: scene?.duration_seconds || undefined,
      status: scene?.status || "planned",
      scene_script: scene?.scene_script || "",
      approved: scene?.approved || false
    }
  });

  // Load stories for dropdown
  useEffect(() => {
    const loadStories = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("stories")
          .select("id, title")
          .order("title");

        if (error) throw error;
        setStories(data || []);
      } catch (error) {
        console.error("Error loading stories:", error);
        toast.error("Failed to load stories");
      } finally {
        setLoadingStories(false);
      }
    };

    if (open) {
      loadStories();
    }
  }, [open]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        story_id: scene?.story_id || "",
        title: scene?.title || "",
        description: scene?.description || "",
        sequence_number: scene?.sequence_number || 1,
        duration_seconds: scene?.duration_seconds || undefined,
        status: scene?.status || "planned",
        scene_script: scene?.scene_script || "",
        approved: scene?.approved || false
      });
    }
  }, [open, scene]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const url =
        mode === "create"
          ? "/api/workspace/scenes"
          : `/api/workspace/scenes/${scene?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save scene");
      }

      toast.success(mode === "create" ? "Scene created successfully" : "Scene updated successfully");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving scene:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save scene");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Scene" : "Edit Scene"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new scene for your story. Scenes contain multiple shots."
              : "Update scene details and configuration."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="story_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Story</FormLabel>
                  <Select
                    disabled={loadingStories || mode === "edit"}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a story" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stories.map((story) => (
                        <SelectItem key={story.id} value={story.id}>
                          {story.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>The story this scene belongs to</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Scene title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Scene description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sequence_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sequence Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Order within the story</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_seconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (seconds)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Optional"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="generating">Generating</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scene_script"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scene Script</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Full narration text for this scene"
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>The narration text that spans multiple shots</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === "edit" && (
              <>
                {(scene?.audio_upload_url || scene?.video_upload_url || scene?.audio_url || scene?.video_url || scene?.final_scene_url) && (
                  <div className="space-y-3 rounded-lg border p-4">
                    <FormLabel>Generated & Uploaded Files</FormLabel>

                    {scene?.audio_upload_url && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Audio Upload:</span>
                        <a
                          href={scene.audio_upload_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View Audio Upload
                        </a>
                      </div>
                    )}

                    {scene?.video_upload_url && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Video Upload:</span>
                        <a
                          href={scene.video_upload_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View Video Upload
                        </a>
                      </div>
                    )}

                    {scene?.audio_url && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Generated Audio:</span>
                        <a
                          href={scene.audio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View Audio
                        </a>
                      </div>
                    )}

                    {scene?.video_url && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Combined Shots:</span>
                        <a
                          href={scene.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View Video
                        </a>
                      </div>
                    )}

                    {scene?.final_scene_url && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Final Scene:</span>
                        <a
                          href={scene.final_scene_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View Final
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <FormField
              control={form.control}
              name="approved"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Approved</FormLabel>
                    <FormDescription>
                      Mark this scene as approved for generation
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : mode === "create" ? "Create Scene" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
