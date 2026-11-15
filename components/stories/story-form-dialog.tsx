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
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().optional(),
  story_content: z.string().optional(),
  script: z.string().optional(),
  story_type_id: z.string().optional(),
  status: z.enum(["draft", "in_progress", "completed", "archived"]),
  active_story: z.boolean(),
  approved: z.boolean(),
  approve_source: z.boolean()
});

type FormValues = z.infer<typeof formSchema>;

interface Story {
  id: string;
  title: string;
  description?: string | null;
  story_content?: string | null;
  script?: string | null;
  srt_url?: string | null;
  story_type_id?: string | null;
  status: "draft" | "in_progress" | "completed" | "archived";
  active_story: boolean;
  approved: boolean;
  approve_source: boolean;
}

interface StoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story?: Story;
  mode: "create" | "edit";
}

export function StoryFormDialog({ open, onOpenChange, story, mode }: StoryFormDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [storyTypes, setStoryTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingStoryTypes, setLoadingStoryTypes] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: story?.title || "",
      description: story?.description || "",
      story_content: story?.story_content || "",
      script: story?.script || "",
      story_type_id: story?.story_type_id || "",
      status: story?.status || "draft",
      active_story: story?.active_story || false,
      approved: story?.approved || false,
      approve_source: story?.approve_source || false
    }
  });

  // Load story types for dropdown
  useEffect(() => {
    const loadStoryTypes = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("story_types")
          .select("id, name")
          .order("name");

        if (error) throw error;
        setStoryTypes(data || []);
      } catch (error) {
        console.error("Error loading story types:", error);
        toast.error("Failed to load story types");
      } finally {
        setLoadingStoryTypes(false);
      }
    };

    if (open) {
      loadStoryTypes();
    }
  }, [open]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        title: story?.title || "",
        description: story?.description || "",
        story_content: story?.story_content || "",
        script: story?.script || "",
        story_type_id: story?.story_type_id || "",
        status: story?.status || "draft",
        active_story: story?.active_story || false,
        approved: story?.approved || false,
        approve_source: story?.approve_source || false
      });
    }
  }, [open, story]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const url =
        mode === "create"
          ? "/api/workspace/stories"
          : `/api/workspace/stories/${story?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save story");
      }

      toast.success(mode === "create" ? "Story created successfully" : "Story updated successfully");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving story:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save story");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Story" : "Edit Story"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new story. Stories contain multiple scenes and shots."
              : "Update story details and configuration."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Story title" {...field} />
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
                      placeholder="Story description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="story_content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Story Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Full story narrative/outline before script generation"
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The full story narrative or outline before script generation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="script"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Script</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Generated voiceover script for narration"
                      className="resize-none min-h-[100px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The generated voiceover script sent to AI voice synthesis
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {story?.srt_url && (
              <div className="rounded-lg border p-4">
                <FormLabel>SRT Captions File</FormLabel>
                <div className="mt-2">
                  <a
                    href={story.srt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View SRT File
                  </a>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="story_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Story Type</FormLabel>
                  <Select
                    disabled={loadingStoryTypes}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a story type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {storyTypes.map((storyType) => (
                        <SelectItem key={storyType.id} value={storyType.id}>
                          {storyType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>The template type for this story</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active_story"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Story</FormLabel>
                    <FormDescription>
                      Mark this story as currently active
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="approved"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Approved</FormLabel>
                    <FormDescription>
                      Mark this story as approved for generation
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="approve_source"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Approve Source</FormLabel>
                    <FormDescription>
                      Has the source content been approved for processing
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
                {isLoading ? "Saving..." : mode === "create" ? "Create Story" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
