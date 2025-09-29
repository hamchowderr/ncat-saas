"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

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
import { Separator } from "@/components/ui/separator";
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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema),
    defaultValues: {
      items: ["file-manager", "files", "billing"] // Default visible items
    }
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const adminStatus = await isUserAdmin();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  function onSubmit(data: DisplayFormValues) {
    // In a real app, this would save the preferences to the database
    localStorage.setItem("sidebar-preferences", JSON.stringify(data));
    toast.success("Display preferences updated successfully!");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading Display Settings...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
            </div>
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
                        allNavigationItems.reduce((groups, item) => {
                          const category = item.category;
                          if (!groups[category]) groups[category] = [];
                          groups[category].push(item);
                          return groups;
                        }, {} as Record<string, Array<typeof allNavigationItems[number]>>)
                      ).map(([category, items]) => (
                        <div key={category}>
                          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
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
                                    <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
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
              <p className="text-muted-foreground text-sm mb-4">
                Choose a color theme for your application. This is also available from the header theme customizer.
              </p>
              <PresetSelector />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
