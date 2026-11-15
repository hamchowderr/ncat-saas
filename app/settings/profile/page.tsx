"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
import { Skeleton } from "@/components/ui/skeleton";
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
  const queryClient = useQueryClient();
  const { data: user, isLoading: userLoading } = useUser();
  const { data: workspace, isLoading: workspaceLoading } = useWorkspace();

  // Use React Query to fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Don't throw on error - profile might not exist yet
      if (error) {
        console.log("No user profile found, will use defaults");
        return null;
      }

      return data;
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  // Use React Hook Form with `values` prop for dynamic defaults
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    values: {
      username:
        profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "",
      email: user?.email || "",
      bio: "",
      urls: [{ value: "" }]
    }
  });

  const { fields, append } = useFieldArray({
    name: "urls",
    control: form.control
  });

  // Use React Query mutation for profile updates
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      if (!user) throw new Error("User not authenticated");

      const supabase = createClient();
      const { error } = await supabase.from("user_profiles").upsert({
        id: user.id,
        full_name: data.username
      });

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate profile query to refetch
      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.id] });
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  });

  async function onSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }

  // Loading state with Skeleton
  if (userLoading || workspaceLoading || profileLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
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
                      Your email address is managed through your authentication settings and cannot
                      be changed here.
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
            <span className="text-muted-foreground font-mono text-sm">
              {user?.id || "Loading..."}
            </span>
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
