"use client";

import { FileText, Video, File, ImageIcon, ArrowRightIcon, Music } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/client";
import { useStorageQuota } from "@/hooks/use-storage-quota";

import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CountAnimation from "@/components/ui/custom/count-animation";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface FileStats {
  type: string;
  icon: React.ReactNode;
  count: number;
  size: number;
  color: string;
  indicatorColor: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function categorizeFileType(mimeType: string | null): string {
  if (!mimeType) return "Others";
  if (mimeType.startsWith("image/")) return "Images";
  if (mimeType.startsWith("video/")) return "Videos";
  if (mimeType.startsWith("audio/")) return "Audio";
  if (
    mimeType.includes("document") ||
    mimeType.includes("pdf") ||
    mimeType.includes("text") ||
    mimeType.includes("sheet") ||
    mimeType.includes("presentation")
  ) {
    return "Documents";
  }
  return "Others";
}


// Define file stats template with icons and colors
const FILE_STATS_TEMPLATE: FileStats[] = [
  {
    type: "Documents",
    icon: <FileText className="size-6" />,
    count: 0,
    size: 0,
    color: "text-blue-500",
    indicatorColor: "bg-blue-500"
  },
  {
    type: "Images",
    icon: <ImageIcon className="size-6" />,
    count: 0,
    size: 0,
    color: "text-green-500",
    indicatorColor: "bg-green-500"
  },
  {
    type: "Videos",
    icon: <Video className="size-6" />,
    count: 0,
    size: 0,
    color: "text-red-500",
    indicatorColor: "bg-red-500"
  },
  {
    type: "Audio",
    icon: <Music className="size-6" />,
    count: 0,
    size: 0,
    color: "text-purple-500",
    indicatorColor: "bg-purple-500"
  },
  {
    type: "Others",
    icon: <File className="size-6" />,
    count: 0,
    size: 0,
    color: "text-yellow-500",
    indicatorColor: "bg-yellow-500"
  }
];

export function SummaryCards() {
  const queryClient = useQueryClient();

  // Get workspace storage quota for calculating percentages
  const { data: storageQuota } = useStorageQuota();

  // Fetch file data using React Query
  const { data: files = [], isLoading } = useQuery({
    queryKey: ["fileStats"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return [];
      }

      const { data, error } = await supabase
        .from("files")
        .select("mime_type, file_size")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error fetching file stats:", error);
        throw error;
      }

      return data || [];
    },
    retry: 1,
    staleTime: 2 * 60 * 1000 // Cache for 2 minutes
  });

  // Set up real-time subscription to file changes
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("file-stats-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "files"
        },
        () => {
          // Invalidate cache when file changes occur
          queryClient.invalidateQueries({ queryKey: ["fileStats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Process files into categorized statistics using useMemo
  const { fileStats, totalSize } = useMemo(() => {
    // Initialize stats object
    const stats: Record<string, { count: number; size: number }> = {
      Documents: { count: 0, size: 0 },
      Images: { count: 0, size: 0 },
      Videos: { count: 0, size: 0 },
      Audio: { count: 0, size: 0 },
      Others: { count: 0, size: 0 }
    };

    let total = 0;

    // Process files
    files.forEach((file) => {
      const category = categorizeFileType(file.mime_type);
      const size = file.file_size || 0;
      stats[category].count++;
      stats[category].size += size;
      total += size;
    });

    // Map template with calculated stats
    const processedStats = FILE_STATS_TEMPLATE.map((stat) => ({
      ...stat,
      count: stats[stat.type].count,
      size: stats[stat.type].size
    }));

    return { fileStats: processedStats, totalSize: total };
  }, [files]);

  // Loading state with Skeleton components
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="pb-0">
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-24" />
              </CardTitle>
              <CardAction>
                <Skeleton className="h-6 w-6 rounded" />
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-8 w-16" />
              <div className="space-y-2">
                <Skeleton className="h-2 w-full" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-border flex items-center justify-end border-t p-0!">
              <Skeleton className="h-4 w-20 m-3" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {fileStats.slice(0, 4).map((item, key) => {
        // Calculate percentage based on workspace storage quota, not total user files
        const quota = storageQuota?.quota || 1;
        const usagePercentage = quota > 0 ? Math.round((item.size / quota) * 100) : 0;

        return (
          <Card key={key} className="pb-0">
            <CardHeader>
              <CardTitle>{item.type}</CardTitle>
              <CardAction>
                <span className={item.color}>{item.icon}</span>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="font-display text-2xl lg:text-3xl">
                <CountAnimation number={item.count} />
              </div>
              <div className="space-y-2">
                <Progress value={usagePercentage} indicatorColor={item.indicatorColor} />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    {formatFileSize(item.size)}
                  </span>
                  <span className="text-muted-foreground text-sm">{usagePercentage}%</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-border flex items-center justify-end border-t p-0!">
              <Link
                href="#"
                className="text-primary hover:text-primary/90 flex items-center px-6 py-3 text-sm font-medium"
              >
                View more <ArrowRightIcon className="ms-1 size-4" />
              </Link>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
