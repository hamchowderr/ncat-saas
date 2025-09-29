"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/client";

export default function Page() {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleResendConfirmation = async () => {
    setIsResending(true);
    setResendMessage("");

    try {
      const supabase = createClient();
      // Get email from localStorage if available
      const email = localStorage.getItem("signupEmail") || "";

      if (!email) {
        setResendMessage("Unable to resend - email not found");
        return;
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/auth/onboarding`
        }
      });

      if (error) throw error;
      setResendMessage("Confirmation email sent!");
    } catch (error: unknown) {
      setResendMessage(error instanceof Error ? error.message : "Failed to resend email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                  <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription>We&apos;ve sent you a confirmation link</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-center">
                <p className="text-muted-foreground text-sm">
                  You&apos;ve successfully signed up! Please check your email and click the
                  confirmation link to verify your account and complete the onboarding process.
                </p>

                <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>The link will expire in 24 hours</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Check your inbox (may take a few minutes to arrive)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Look in your spam/junk folder if not in inbox</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Click the &quot;Confirm your email&quot; button in the email</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>You&apos;ll be automatically taken to complete your setup</span>
                </div>
              </div>

              <div className="space-y-3 text-center">
                <p className="text-muted-foreground text-sm">Didn&apos;t receive the email?</p>
                <Button
                  variant="outline"
                  onClick={handleResendConfirmation}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? "Sending..." : "Resend Confirmation Email"}
                </Button>
                {resendMessage && (
                  <p
                    className={`text-sm ${resendMessage.includes("sent") ? "text-green-600" : "text-destructive"}`}
                  >
                    {resendMessage}
                  </p>
                )}
              </div>

              <div className="text-center">
                <Button variant="link" onClick={() => (window.location.href = "/auth/login")}>
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
