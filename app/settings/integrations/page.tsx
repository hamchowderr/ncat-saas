"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlusIcon, ShieldAlertIcon, HelpCircleIcon } from "lucide-react";
import { CookieCard } from "./components/cookie-card";
import { CookieDialog } from "./components/cookie-dialog";
import { HelpDialog } from "./components/help-dialog";
import { useCookies } from "@/hooks/use-cookies";
import type { UserCookie } from "@/lib/types/cookies";

export default function IntegrationsPage() {
  const { cookies, loading, refreshCookies } = useCookies();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Security Warning */}
      <Alert>
        <ShieldAlertIcon className="h-4 w-4" />
        <AlertDescription>
          Your cookies are encrypted using AES-256 encryption and stored securely. They are only
          used when you use the media download feature and automatically expire after 30 days.
        </AlertDescription>
      </Alert>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Browser Cookies</CardTitle>
              <CardDescription>
                Store browser cookies for downloading media from authenticated platforms
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHelpDialogOpen(true)}
                title="Help"
              >
                <HelpCircleIcon className="h-4 w-4" />
              </Button>
              <Button onClick={() => setDialogOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Cookie
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <div className="bg-muted h-20 w-full animate-pulse rounded"></div>
              <div className="bg-muted h-20 w-full animate-pulse rounded"></div>
            </div>
          ) : cookies.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              <p className="mb-2 text-lg font-medium">No cookies saved yet</p>
              <p className="text-sm">
                Add cookies to download media from authenticated platforms like YouTube, Vimeo, and
                more.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {cookies.map((cookie: UserCookie) => (
                <CookieCard key={cookie.id} cookie={cookie} onRefresh={refreshCookies} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Cookie Dialog */}
      <CookieDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={refreshCookies} />

      {/* Help Dialog */}
      <HelpDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen} />
    </div>
  );
}
