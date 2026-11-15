"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  InfoIcon,
  YoutubeIcon,
  VideoIcon,
  InstagramIcon,
  MusicIcon,
  GlobeIcon,
  ExternalLinkIcon
} from "lucide-react";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PLACEHOLDER_COOKIES = `# Netscape HTTP Cookie File
# This is a generated file! Do not edit.

.example-platform.com	TRUE	/	TRUE	1735689600	SESSION_ID	abc123xyz789def456
.example-platform.com	TRUE	/	FALSE	1735689600	USER_TOKEN	ghi789jkl012mno345
.example-platform.com	TRUE	/	TRUE	1735689600	AUTH_KEY	pqr678stu901vwx234`;

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-3xl overflow-hidden p-0 sm:w-full">
        {/* Fixed Header */}
        <DialogHeader className="bg-background sticky top-0 z-10 border-b px-6 pt-6 pb-4">
          <DialogTitle className="text-xl">Cookie Integration Help</DialogTitle>
          <DialogDescription className="text-sm">
            Learn how to export and use browser cookies for authenticated downloads
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="max-h-[calc(90vh-140px)] space-y-6 overflow-x-hidden overflow-y-auto scroll-smooth px-6 py-4">
          {/* Security Alert */}
          <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/30">
            <InfoIcon className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm leading-relaxed">
              <strong className="font-semibold">Security:</strong> Your cookies are encrypted with
              AES-256 before storage and automatically expire after 30 days. We never log or expose
              your decrypted cookies.
            </AlertDescription>
          </Alert>

          {/* What are cookies */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <div className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
              What are browser cookies?
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed break-words">
              Browser cookies are small pieces of data that websites store in your browser to
              remember your login session. By providing your cookies, you can download media from
              platforms where you&apos;re already logged in.
            </p>
          </div>

          <Separator className="my-5" />

          {/* How to export cookies */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <div className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
              How to export cookies
            </h3>

            <div className="bg-card/50 space-y-4 rounded-lg border p-4">
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                  Browser Extensions (Recommended)
                </h4>
                <p className="text-muted-foreground mb-3 text-sm">
                  Use these safe, verified browser extensions to export your cookies:
                </p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5 shrink-0">•</span>
                    <div className="break-words">
                      <strong className="text-foreground">Chrome/Edge:</strong>{" "}
                      <a
                        href="https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 decoration-primary/30 hover:decoration-primary inline-flex items-center gap-1 underline underline-offset-4 transition-colors"
                      >
                        Get cookies.txt LOCALLY
                        <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5 shrink-0">•</span>
                    <div className="break-words">
                      <strong className="text-foreground">Firefox:</strong>{" "}
                      <a
                        href="https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 decoration-primary/30 hover:decoration-primary inline-flex items-center gap-1 underline underline-offset-4 transition-colors"
                      >
                        cookies.txt
                        <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="border-t pt-3">
                <p className="text-muted-foreground text-xs">
                  💡 <strong>Tip:</strong> After installing the extension, visit the platform
                  you&apos;re logged into, click the extension icon, and export cookies in Netscape
                  format.
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-5" />

          {/* Netscape format */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <div className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
              Netscape Cookie Format
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Cookies must be in Netscape HTTP Cookie File format. Here&apos;s an example:
            </p>
            <pre className="bg-muted scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent overflow-x-auto rounded-lg border p-4 text-xs">
              <code className="block font-mono whitespace-pre">{PLACEHOLDER_COOKIES}</code>
            </pre>
            <p className="text-muted-foreground text-xs leading-relaxed break-words">
              Each line contains 7 tab-separated fields: <strong>domain</strong>,{" "}
              <strong>flag</strong>, <strong>path</strong>, <strong>secure</strong>,{" "}
              <strong>expiration</strong>, <strong>name</strong>, <strong>value</strong>
            </p>
          </div>

          <Separator className="my-5" />

          {/* Supported platforms */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <div className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
              Supported Platforms
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-muted-foreground flex items-center gap-2">
                <YoutubeIcon className="h-4 w-4 shrink-0 text-red-600" />
                <span>YouTube</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <VideoIcon className="h-4 w-4 shrink-0 text-blue-600" />
                <span>Vimeo</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <InstagramIcon className="h-4 w-4 shrink-0 text-pink-600" />
                <span>Instagram</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <MusicIcon className="h-4 w-4 shrink-0 text-purple-600" />
                <span>TikTok</span>
              </div>
              <div className="text-muted-foreground col-span-2 flex items-center gap-2">
                <GlobeIcon className="h-4 w-4 shrink-0 text-gray-600" />
                <span>Generic (any platform with Netscape cookies)</span>
              </div>
            </div>
          </div>

          <Separator className="my-5" />

          {/* Privacy & Security */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <div className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
              Privacy & Security
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="shrink-0 text-green-600">✅</span>
                <span className="text-muted-foreground break-words">
                  Cookies are encrypted with AES-256 before storage
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 text-green-600">✅</span>
                <span className="text-muted-foreground break-words">
                  Automatically expire after 30 days
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 text-green-600">✅</span>
                <span className="text-muted-foreground break-words">
                  Only you can access your cookies (Row-Level Security)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 text-green-600">✅</span>
                <span className="text-muted-foreground break-words">
                  All operations are logged for security auditing
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 text-green-600">✅</span>
                <span className="text-muted-foreground break-words">
                  Cookies are only used for media download requests
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 text-red-600">❌</span>
                <span className="text-muted-foreground break-words">
                  We never log or expose decrypted cookies
                </span>
              </li>
            </ul>
          </div>

          <Separator className="my-5" />

          {/* Troubleshooting */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <div className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
              Troubleshooting
            </h3>

            <div className="space-y-4">
              <div className="border-l-2 border-orange-500 py-1 pl-4">
                <h4 className="mb-2 text-sm font-medium">
                  Error: &quot;Invalid Netscape cookie format&quot;
                </h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="shrink-0">•</span>
                    <span className="break-words">
                      Ensure the first line starts with &quot;# Netscape HTTP Cookie File&quot;
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0">•</span>
                    <span className="break-words">
                      Check that cookie lines have 7 tab-separated fields
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0">•</span>
                    <span className="break-words">
                      Use a browser extension for automatic formatting
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-l-2 border-blue-500 py-1 pl-4">
                <h4 className="mb-2 text-sm font-medium">Downloads still failing?</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="shrink-0">•</span>
                    <span className="break-words">
                      Verify you&apos;re logged into the platform in your browser
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0">•</span>
                    <span className="break-words">
                      Export fresh cookies (old cookies may have expired)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0">•</span>
                    <span className="break-words">
                      Try deleting the old cookie and adding a new one
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom padding for scroll */}
          <div className="h-2" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
