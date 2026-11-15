"use client";

import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
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
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

const formSchema = z.object({
  story_prompt_system: z.string().optional(),
  story_prompt_user: z.string().optional(),
  scene_generation_prompt: z.string().optional(),
  shot_generation_system_prompt: z.string().optional(),
  shot_generation_user_prompt: z.string().optional(),
  image_prompt_generation_prompt: z.string().optional(),
  video_prompt_generation_prompt: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface StoryTypePromptingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storyType?: {
    id: string;
    name?: string;
    story_prompt_system?: string | null;
    story_prompt_user?: string | null;
    scene_generation_prompt?: string | null;
    shot_generation_system_prompt?: string | null;
    shot_generation_user_prompt?: string | null;
    image_prompt_generation_prompt?: string | null;
    video_prompt_generation_prompt?: string | null;
  };
  mode: "create" | "edit";
}

export function StoryTypePromptingDialog({
  open,
  onOpenChange,
  storyType,
  mode
}: StoryTypePromptingDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      story_prompt_system: "",
      story_prompt_user: "",
      scene_generation_prompt: "",
      shot_generation_system_prompt: "",
      shot_generation_user_prompt: "",
      image_prompt_generation_prompt: "",
      video_prompt_generation_prompt: ""
    }
  });

  // Reset form when dialog opens or storyType changes
  useEffect(() => {
    if (open) {
      form.reset({
        story_prompt_system: storyType?.story_prompt_system || "",
        story_prompt_user: storyType?.story_prompt_user || "",
        scene_generation_prompt: storyType?.scene_generation_prompt || "",
        shot_generation_system_prompt: storyType?.shot_generation_system_prompt || "",
        shot_generation_user_prompt: storyType?.shot_generation_user_prompt || "",
        image_prompt_generation_prompt: storyType?.image_prompt_generation_prompt || "",
        video_prompt_generation_prompt: storyType?.video_prompt_generation_prompt || ""
      });
    }
  }, [open, storyType?.id]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      const url =
        mode === "create"
          ? "/api/workspace/story-types"
          : `/api/workspace/story-types/${storyType?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save prompting settings");
      }

      toast.success(
        mode === "create"
          ? "Story type prompts created successfully"
          : "Story type prompts updated successfully"
      );

      // Close dialog FIRST, then invalidate queries after a small delay
      onOpenChange(false);

      // Delay query invalidation to prevent render conflicts
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["story-types"] });
      }, 100);
    } catch (error) {
      console.error("Error saving prompting settings:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save prompting settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="max-w-3xl max-h-[90vh]" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create AI Prompts" : `Edit AI Prompts: ${storyType?.name || "Story Type"}`}
          </DialogTitle>
          <DialogDescription>
            Configure AI prompts for generating stories, scenes, shots, images, and videos.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="h-[60vh] overflow-y-auto pr-4 scrollbar-hide">
              <Accordion type="multiple" defaultValue={["story"]} className="w-full space-y-2">
                {/* Story Generation Section */}
                <AccordionItem value="story" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Story Generation</span>
                      <span className="text-xs text-muted-foreground">(2 prompts)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="story_prompt_system"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Story Prompt (System)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter system prompt for story generation..."
                              className="min-h-[80px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            System-level instructions for AI story generation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="story_prompt_user"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Story Prompt (User)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter user prompt for story generation..."
                              className="min-h-[80px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            User-level instructions for AI story generation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Scene Generation Section */}
                <AccordionItem value="scene" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Scene Generation</span>
                      <span className="text-xs text-muted-foreground">(1 prompt)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="scene_generation_prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scene Generation Prompt</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter prompt for scene generation..."
                              className="min-h-[80px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Instructions for breaking stories into scenes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Shot Generation Section */}
                <AccordionItem value="shot" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Shot Generation</span>
                      <span className="text-xs text-muted-foreground">(2 prompts)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="shot_generation_system_prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shot Generation Prompt (System)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter system prompt for shot generation..."
                              className="min-h-[80px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            System-level instructions for breaking scenes into shots
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shot_generation_user_prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shot Generation Prompt (User)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter user prompt for shot generation..."
                              className="min-h-[80px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            User-level instructions for breaking scenes into shots
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Media Generation Section */}
                <AccordionItem value="media" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Media Generation</span>
                      <span className="text-xs text-muted-foreground">(2 prompts)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="image_prompt_generation_prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image Prompt Generation</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter prompt for generating image prompts..."
                              className="min-h-[80px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Instructions for AI to generate DALL-E image prompts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="video_prompt_generation_prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video Prompt Generation</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter prompt for generating video prompts..."
                              className="min-h-[80px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Instructions for AI to generate video generation prompts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Create" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
