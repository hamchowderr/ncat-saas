"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile page after a short delay
    const timer = setTimeout(() => {
      router.push("/settings/profile");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleGoToProfile = () => {
    router.push("/settings/profile");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings Moved</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Account settings have been consolidated with your profile information.
          </p>
          <p className="text-muted-foreground">
            You will be automatically redirected to the Profile page in a few seconds.
          </p>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleGoToProfile} className="flex items-center gap-2">
            Go to Profile Settings
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
