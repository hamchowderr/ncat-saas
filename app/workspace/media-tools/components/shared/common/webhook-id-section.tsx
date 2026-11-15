"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WebhookIdSectionProps } from "./types";

/**
 * Reusable webhook URL and custom ID input section
 * Used by 15 NCAT API endpoints for tracking and notifications
 *
 * @example
 * ```tsx
 * const [webhookUrl, setWebhookUrl] = useState("");
 * const [customId, setCustomId] = useState("");
 *
 * <WebhookIdSection
 *   webhookUrl={webhookUrl}
 *   onWebhookUrlChange={setWebhookUrl}
 *   customId={customId}
 *   onCustomIdChange={setCustomId}
 * />
 * ```
 */
export function WebhookIdSection({
  webhookUrl,
  onWebhookUrlChange,
  customId,
  onCustomIdChange,
  disabled = false
}: WebhookIdSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="webhook-url" className="text-sm font-medium">
          Webhook URL <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          id="webhook-url"
          type="url"
          value={webhookUrl}
          onChange={(e) => onWebhookUrlChange(e.target.value)}
          placeholder="https://your-webhook-endpoint.com/callback"
          className="h-10"
          disabled={disabled}
        />
        <p className="text-muted-foreground text-xs">
          Receive a notification when processing completes
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-id" className="text-sm font-medium">
          Custom ID <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          id="custom-id"
          value={customId}
          onChange={(e) => onCustomIdChange(e.target.value)}
          placeholder="my-job-identifier"
          className="h-10"
          disabled={disabled}
        />
        <p className="text-muted-foreground text-xs">Custom identifier for tracking this request</p>
      </div>
    </div>
  );
}
