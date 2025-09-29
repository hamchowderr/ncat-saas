"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { useWorkspace } from "@/hooks/use-workspace";
import { createClient } from "@/lib/client";
import { Separator } from "@/components/ui/separator";

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters."
    })
    .max(30, {
      message: "Username must not be longer than 30 characters."
    }),
  email: z
    .string({
      required_error: "Please select an email to display."
    })
    .email(),
  bio: z.string().max(160).min(4),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: "Please enter a valid URL." })
      })
    )
    .optional()
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Page() {
  const { user, loading: userLoading } = useUser();
  const { workspace, loading: workspaceLoading } = useWorkspace();
  const [loading, setLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange"
  });

  const { fields, append } = useFieldArray({
    name: "urls",
    control: form.control
  });

  useEffect(() => {
    async function loadUserProfile() {
      if (userLoading || workspaceLoading) return;
      if (!user || !workspace) return;

      try {
        const supabase = createClient();

        // Get user profile data
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        // Set form default values with real user data
        form.reset({
          username: profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "",
          email: user.email || "",
          bio: "",
          urls: [{ value: "" }]
        });
      } catch (error) {
        console.error("Error loading user profile:", error);
        // Set fallback values
        form.reset({
          username: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
          email: user.email || "",
          bio: "",
          urls: [{ value: "" }]
        });
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [user, workspace, userLoading, workspaceLoading, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;

    try {
      const supabase = createClient();

      // Update user profile
      const { error } = await supabase
        .from("user_profiles")
        .upsert({
          id: user.id,
          full_name: data.username
        });

      if (error) throw error;

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  }

  if (loading || userLoading || workspaceLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Profile...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your display name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name. It can be your real name or a pseudonym.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormDescription>
                      Your email address is managed through your authentication settings and cannot be changed here.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about yourself"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    You can <span>@mention</span> other users and organizations to link to them.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              {fields.map((field, index) => (
                <FormField
                  control={form.control}
                  key={field.id}
                  name={`urls.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={cn(index !== 0 && "sr-only")}>URLs</FormLabel>
                      <FormDescription className={cn(index !== 0 && "sr-only")}>
                        Add links to your website, blog, or social media profiles.
                      </FormDescription>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ value: "" })}
              >
                Add URL
              </Button>
            </div>
              <Button type="submit">Update profile</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Workspace Information */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Workspace Name</span>
            <span className="text-muted-foreground">{workspace?.name || "Loading..."}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-medium">User ID</span>
            <span className="text-muted-foreground font-mono text-sm">{user?.id || "Loading..."}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Account Created</span>
            <span className="text-muted-foreground">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Loading..."}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
