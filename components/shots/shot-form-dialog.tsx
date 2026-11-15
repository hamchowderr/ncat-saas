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
  scene_id: z.string().min(1, "Scene is required"),
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().optional(),
  sequence_number: z.number().int().min(1, "Sequence number must be at least 1"),
  duration_seconds: z.number().int().min(1).optional(),
  shot_type: z.string().optional(),
  camera_angle: z.string().optional(),
  status: z.enum(["pending", "generating", "completed", "failed"]),
  shot_script: z.string().optional(),
  image_prompt: z.string().optional(),
  audio_prompt: z.string().optional(),
  video_prompt: z.string().optional(),
  approved: z.boolean(),
  image_go: z.boolean(),
  audio_go: z.boolean(),
  video_go: z.boolean()
});

type FormValues = z.infer<typeof formSchema>;

interface Shot {
  id: string;
  scene_id: string;
  title: string;
  description?: string | null;
  sequence_number: number;
  duration_seconds?: number | null;
  shot_type?: string | null;
  camera_angle?: string | null;
  status: "pending" | "generating" | "completed" | "failed";
  shot_script?: string | null;
  image_prompt?: string | null;
  audio_prompt?: string | null;
  video_prompt?: string | null;
  image_url?: string | null;
  audio_url?: string | null;
  video_url?: string | null;
  final_shot_url?: string | null;
  image_upload_url?: string | null;
  audio_upload_url?: string | null;
  video_upload_url?: string | null;
  approved: boolean;
  image_go: boolean;
  audio_go: boolean;
  video_go: boolean;
}

interface ShotFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shot?: Shot;
  mode: "create" | "edit";
}

export function ShotFormDialog({ open, onOpenChange, shot, mode }: ShotFormDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [scenes, setScenes] = useState<Array<{ id: string; title: string }>>([]);
  const [loadingScenes, setLoadingScenes] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scene_id: shot?.scene_id || "",
      title: shot?.title || "",
      description: shot?.description || "",
      sequence_number: shot?.sequence_number || 1,
      duration_seconds: shot?.duration_seconds || undefined,
      shot_type: shot?.shot_type || "",
      camera_angle: shot?.camera_angle || "",
      status: shot?.status || "pending",
      shot_script: shot?.shot_script || "",
      image_prompt: shot?.image_prompt || "",
      audio_prompt: shot?.audio_prompt || "",
      video_prompt: shot?.video_prompt || "",
      approved: shot?.approved || false,
      image_go: shot?.image_go || false,
      audio_go: shot?.audio_go || false,
      video_go: shot?.video_go || false
    }
  });

  // Load scenes for dropdown
  useEffect(() => {
    const loadScenes = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("scenes")
          .select("id, title")
          .order("title");

        if (error) throw error;
        setScenes(data || []);
      } catch (error) {
        console.error("Error loading scenes:", error);
        toast.error("Failed to load scenes");
      } finally {
        setLoadingScenes(false);
      }
    };

    if (open) {
      loadScenes();
    }
  }, [open]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        scene_id: shot?.scene_id || "",
        title: shot?.title || "",
        description: shot?.description || "",
        sequence_number: shot?.sequence_number || 1,
        duration_seconds: shot?.duration_seconds || undefined,
        shot_type: shot?.shot_type || "",
        camera_angle: shot?.camera_angle || "",
        status: shot?.status || "pending",
        shot_script: shot?.shot_script || "",
        image_prompt: shot?.image_prompt || "",
        audio_prompt: shot?.audio_prompt || "",
        video_prompt: shot?.video_prompt || "",
        approved: shot?.approved || false,
        image_go: shot?.image_go || false,
        audio_go: shot?.audio_go || false,
        video_go: shot?.video_go || false
      });
    }
  }, [open, shot]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const url =
        mode === "create" ? "/api/workspace/shots" : `/api/workspace/shots/${shot?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save shot");
      }

      toast.success(mode === "create" ? "Shot created successfully" : "Shot updated successfully");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving shot:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save shot");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Shot" : "Edit Shot"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new shot for your scene. Shots are individual visual moments."
              : "Update shot details, prompts, and generation triggers."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="scene_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scene</FormLabel>
                  <Select
                    disabled={loadingScenes || mode === "edit"}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a scene" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {scenes.map((scene) => (
                        <SelectItem key={scene.id} value={scene.id}>
                          {scene.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>The scene this shot belongs to</FormDescription>
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
                    <Input placeholder="Shot title" {...field} />
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
                    <Textarea placeholder="Shot description" className="resize-none" {...field} />
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
                    <FormDescription>Order within the scene</FormDescription>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shot_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shot Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., close_up, wide_shot" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="camera_angle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Camera Angle</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., eye_level, high_angle" {...field} />
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
                      <SelectItem value="pending">Pending</SelectItem>
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
              name="shot_script"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shot Script</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="The actual narration text for this shot"
                      className="resize-none min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Sent to ElevenLabs for voice generation</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="DALL-E/Midjourney prompt for image generation"
                      className="resize-none min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video_prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Motion instructions (zoom, pan, duration)"
                      className="resize-none min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="font-medium">AI Generation Triggers</h4>
              <p className="text-sm text-muted-foreground">
                Enable these flags to trigger automatic AI generation for this shot
              </p>

              <FormField
                control={form.control}
                name="approved"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Approved</FormLabel>
                      <FormDescription>Manual approval before including in scene</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_go"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Image Generation</FormLabel>
                      <FormDescription>Trigger AI image generation for this shot</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="audio_go"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Audio Generation</FormLabel>
                      <FormDescription>Trigger AI audio/voiceover generation</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="video_go"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Video Generation</FormLabel>
                      <FormDescription>
                        Trigger image-to-video animation generation
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {mode === "edit" && (shot?.image_url || shot?.audio_url || shot?.video_url || shot?.final_shot_url || shot?.image_upload_url || shot?.audio_upload_url || shot?.video_upload_url) && (
              <div className="space-y-3 rounded-lg border p-4">
                <FormLabel>Generated & Uploaded Files</FormLabel>

                {shot?.image_upload_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Image Upload:</span>
                    <a
                      href={shot.image_upload_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Image Upload
                    </a>
                  </div>
                )}

                {shot?.audio_upload_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Audio Upload:</span>
                    <a
                      href={shot.audio_upload_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Play Audio Upload
                    </a>
                  </div>
                )}

                {shot?.video_upload_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Video Upload:</span>
                    <a
                      href={shot.video_upload_url}
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

                {shot?.image_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Generated Image:</span>
                    <a
                      href={shot.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Image
                    </a>
                  </div>
                )}

                {shot?.audio_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Generated Audio:</span>
                    <a
                      href={shot.audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Play Audio
                    </a>
                  </div>
                )}

                {shot?.video_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Animated Video:</span>
                    <a
                      href={shot.video_url}
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

                {shot?.final_shot_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Final Shot:</span>
                    <a
                      href={shot.final_shot_url}
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : mode === "create" ? "Create Shot" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
