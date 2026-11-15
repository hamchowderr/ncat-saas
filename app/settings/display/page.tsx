"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PresetSelector } from "@/components/theme-customizer";
import { isUserAdmin } from "@/lib/admin";

// Real navigation items from the app sidebar
const navigationItems = [
  { id: "file-manager", label: "File Manager", category: "Workspace" },
  { id: "files", label: "Files", category: "Workspace" },
  { id: "media-tools", label: "Media Tools", category: "Workspace" },
  { id: "workflows", label: "Workflows", category: "Workspace" },
  { id: "jobs", label: "Jobs", category: "Workspace" },
  { id: "chat", label: "Chat", category: "Workspace" },
  { id: "ai-chat", label: "AI Chat", category: "AI" },
  { id: "image-generator", label: "Image Generator", category: "AI" },
  { id: "billing", label: "Billing", category: "Billing" }
] as const;

const adminNavigationItems = [
  { id: "users-list", label: "Users List", category: "Admin" },
  { id: "api-keys", label: "API Keys", category: "Admin" },
  { id: "admin-panel", label: "Admin Panel", category: "Admin" }
] as const;

const displayFormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item."
  })
});

type DisplayFormValues = z.infer<typeof displayFormSchema>;

export default function Page() {
  // Use React Query to check admin status
  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      try {
        const adminStatus = await isUserAdmin();
        return adminStatus;
      } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema),
    defaultValues: {
      items: ["file-manager", "files", "billing"] // Default visible items
    }
  });

  function onSubmit(data: DisplayFormValues) {
    // In a real app, this would save the preferences to the database
    localStorage.setItem("sidebar-preferences", JSON.stringify(data));
    toast.success("Display preferences updated successfully!");
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sidebar Navigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-32 mt-4" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Theme Customization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Combine navigation items with admin items if user is admin
  const allNavigationItems = isAdmin
    ? [...navigationItems, ...adminNavigationItems]
    : navigationItems;

  return (
    <div className="space-y-6">
      {/* Navigation Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Sidebar Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="items"
                render={() => (
                  <FormItem>
                    <FormDescription>
                      Select which navigation items you want to display in the sidebar.
                    </FormDescription>
                    <div className="space-y-4">
                      {Object.entries(
                        allNavigationItems.reduce(
                          (groups, item) => {
                            const category = item.category;
                            if (!groups[category]) groups[category] = [];
                            groups[category].push(item);
                            return groups;
                          },
                          {} as Record<string, Array<(typeof allNavigationItems)[number]>>
                        )
                      ).map(([category, items]) => (
                        <div key={category}>
                          <h4 className="text-muted-foreground mb-2 text-sm font-medium">
                            {category}
                          </h4>
                          <div className="space-y-2">
                            {items.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="items"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-y-0 space-x-3"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, item.id])
                                              : field.onChange(
                                                  field.value?.filter((value) => value !== item.id)
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">{item.label}</FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Update Navigation</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Theme Customizer */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Customization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="mb-2 text-sm font-medium">Color Theme</h4>
              <p className="text-muted-foreground mb-4 text-sm">
                Choose a color theme for your application. This is also available from the header
                theme customizer.
              </p>
              <PresetSelector />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
