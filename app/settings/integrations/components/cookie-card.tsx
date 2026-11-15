"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { UserCookie } from "@/lib/types/cookies";
import { PlatformIcon } from "./platform-icon";
import { toast } from "sonner";

interface CookieCardProps {
  cookie: UserCookie;
  onRefresh: () => void;
}

export function CookieCard({ cookie, onRefresh }: CookieCardProps) {
  const isExpiringSoon =
    new Date(cookie.expires_at).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
  const isExpired = new Date(cookie.expires_at).getTime() < Date.now();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this cookie?")) return;

    try {
      const response = await fetch(`/api/cookies/${cookie.id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Failed to delete cookie");
      }

      toast.success("Cookie deleted successfully");
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete cookie");
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-3">
          <div className="mt-1">
            <PlatformIcon platform={cookie.platform} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-base font-medium">
                {cookie.label || cookie.platform.charAt(0).toUpperCase() + cookie.platform.slice(1)}
              </span>
              <Badge variant={cookie.is_active && !isExpired ? "default" : "secondary"}>
                {isExpired ? "Expired" : cookie.is_active ? "Active" : "Inactive"}
              </Badge>
              {isExpiringSoon && !isExpired && <Badge variant="destructive">Expiring Soon</Badge>}
            </div>
            <div className="text-muted-foreground space-y-0.5 text-sm">
              <div>
                Created {formatDistanceToNow(new Date(cookie.created_at), { addSuffix: true })}
              </div>
              {cookie.last_used_at && (
                <div>
                  Last used{" "}
                  {formatDistanceToNow(new Date(cookie.last_used_at), { addSuffix: true })}
                </div>
              )}
              <div>
                {isExpired
                  ? "Expired"
                  : `Expires ${formatDistanceToNow(new Date(cookie.expires_at), { addSuffix: true })}`}
              </div>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDelete} title="Delete cookie">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
