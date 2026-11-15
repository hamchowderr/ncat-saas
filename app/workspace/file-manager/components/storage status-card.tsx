"use client";

import { AlertCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStorageQuota } from "@/hooks/use-storage-quota";
import { formatBytes, getQuotaColor } from "@/lib/storage-quota";

export function StorageStatusCard() {
  const { data: quota, isLoading, error } = useStorageQuota();

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Storage Space Used</CardTitle>
          <CardDescription>See your remaining file storage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error || !quota) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Storage Space Used</CardTitle>
          <CardDescription>
            {error ? "Unable to load storage information" : "Using default storage quota"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant={error ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error ? (
                "Failed to fetch storage quota. Please try again."
              ) : (
                <>
                  Your workspace is using the default 10GB storage quota.{" "}
                  <Link href="/billing" className="font-medium underline">
                    Set up billing
                  </Link>{" "}
                  to increase your storage.
                </>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const indicatorColor = getQuotaColor(quota.percentage);
  const showUpgrade = quota.isNearLimit || quota.isExceeded;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Space Used</CardTitle>
        <CardDescription>
          {quota.isExceeded
            ? "Storage quota exceeded"
            : quota.isNearLimit
              ? "Approaching storage limit"
              : "See your remaining file storage"}
        </CardDescription>
        {showUpgrade && (
          <CardAction>
            <Link href="/billing">
              <Button size="sm" variant={quota.isExceeded ? "destructive" : "default"}>
                <ArrowUpRight className="mr-1 h-4 w-4" />
                Upgrade
              </Button>
            </Link>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-muted-foreground flex justify-between text-sm">
            <span>{formatBytes(quota.used)} used</span>
            <span>{formatBytes(quota.quota)} total</span>
          </div>
          <div className="space-y-2">
            <Progress value={Math.min(quota.percentage, 100)} indicatorColor={indicatorColor} />
            <div className="flex items-center justify-between text-sm">
              <span className={getQuotaTextColor(quota.percentage)}>{quota.percentage}% used</span>
              <span className="text-muted-foreground">{formatBytes(quota.available)} free</span>
            </div>
          </div>

          {quota.isExceeded && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You&apos;ve exceeded your storage quota. Please upgrade your plan or delete some
                files to continue uploading.
              </AlertDescription>
            </Alert>
          )}

          {quota.isNearLimit && !quota.isExceeded && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You&apos;re approaching your storage limit. Consider upgrading to avoid
                interruptions.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get text color based on quota percentage
function getQuotaTextColor(percentage: number): string {
  if (percentage >= 95) return "text-red-600 font-semibold";
  if (percentage >= 80) return "text-yellow-600 font-semibold";
  return "text-green-600 font-medium";
}
