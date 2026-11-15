"use client";

import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().optional(),
  width: z.coerce.number().int().min(1, "Width must be at least 1"),
  height: z.coerce.number().int().min(1, "Height must be at least 1"),
  aspect_ratio: z.string().min(1, "Aspect ratio is required")
});

type FormValues = z.infer<typeof formSchema>;

interface StoryTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storyType?: {
    id: string;
    name: string;
    description?: string | null;
    settings?: any;
  };
  mode: "create" | "edit";
}

const COMMON_ASPECT_RATIOS = [
  { value: "16:9", label: "16:9 (Landscape)", width: 1920, height: 1080 },
  { value: "9:16", label: "9:16 (Portrait)", width: 1080, height: 1920 },
  { value: "1:1", label: "1:1 (Square)", width: 1080, height: 1080 },
  { value: "4:3", label: "4:3 (Classic)", width: 1920, height: 1440 },
  { value: "21:9", label: "21:9 (Ultrawide)", width: 2560, height: 1080 },
  { value: "custom", label: "Custom", width: 1920, height: 1080 }
];

export function StoryTypeFormDialog({
  open,
  onOpenChange,
  storyType,
  mode
}: StoryTypeFormDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: storyType?.name || "",
      description: storyType?.description || "",
      width: storyType?.settings?.dimensions?.width || 1920,
      height: storyType?.settings?.dimensions?.height || 1080,
      aspect_ratio: storyType?.settings?.dimensions?.aspect_ratio || "16:9"
    }
  });

  // Reset form when dialog opens (not when it closes)
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: storyType?.name || "",
        description: storyType?.description || "",
        width: storyType?.settings?.dimensions?.width || 1920,
        height: storyType?.settings?.dimensions?.height || 1080,
        aspect_ratio: storyType?.settings?.dimensions?.aspect_ratio || "16:9"
      });
    }
  }, [open, storyType?.id]);

  const handleAspectRatioChange = (value: string) => {
    const preset = COMMON_ASPECT_RATIOS.find((ratio) => ratio.value === value);
    if (preset && preset.value !== "custom") {
      form.setValue("width", preset.width);
      form.setValue("height", preset.height);
      form.setValue("aspect_ratio", preset.value);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        // Create new story type
        const response = await fetch("/api/workspace/story-types", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create story type");
        }

        toast.success("Story type created successfully");
      } else {
        // Update existing story type
        const response = await fetch(`/api/workspace/story-types/${storyType?.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update story type");
        }

        toast.success("Story type updated successfully");
      }

      // Close dialog FIRST, then invalidate queries after a small delay
      onOpenChange(false);

      // Delay query invalidation to prevent render conflicts
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["story-types"] });
      }, 100);
    } catch (error) {
      console.error("Error saving story type:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Story Type" : "Edit Story Type"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a custom story type template with your preferred dimensions."
              : "Update the story type details and dimensions."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Custom Story Type" {...field} />
                  </FormControl>
                  <FormDescription>A unique name for this story type template</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the purpose of this story type..." {...field} />
                  </FormControl>
                  <FormDescription>A brief description of when to use this template</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Dimensions</FormLabel>

              <FormField
                control={form.control}
                name="aspect_ratio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aspect Ratio Preset</FormLabel>
                    <Select
                      onValueChange={handleAspectRatioChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select aspect ratio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMMON_ASPECT_RATIOS.map((ratio) => (
                          <SelectItem key={ratio.value} value={ratio.value}>
                            {ratio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose a preset or select custom for manual entry</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Width (px)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1920" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (px)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1080" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Create" : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
