/**
 * Shared TypeScript interfaces for NCAT API components
 * Used across 15+ media processing tools
 */

/**
 * Standard webhook and ID parameters
 * Used by 15 endpoints: all except s3/upload
 */
export interface WebhookIdParams {
  /**
   * URL to receive webhook notification when processing completes
   * @optional
   */
  webhook_url?: string;

  /**
   * Custom identifier for tracking the request
   * @optional
   */
  id?: string;
}

/**
 * Props for the WebhookIdSection component
 */
export interface WebhookIdSectionProps {
  /**
   * Current webhook URL value
   */
  webhookUrl: string;

  /**
   * Callback when webhook URL changes
   */
  onWebhookUrlChange: (value: string) => void;

  /**
   * Current custom ID value
   */
  customId: string;

  /**
   * Callback when custom ID changes
   */
  onCustomIdChange: (value: string) => void;

  /**
   * Whether the inputs are disabled (during loading states)
   * @default false
   */
  disabled?: boolean;
}

/**
 * URL item for concatenation arrays
 * Used by video/concatenate, audio/concatenate
 */
export interface UrlItem {
  /**
   * URL of the media file
   */
  url: string;
}

/**
 * Props for the UrlArrayInput component
 */
export interface UrlArrayInputProps {
  /**
   * Array of URL items
   */
  urls: UrlItem[];

  /**
   * Callback when URLs array changes
   */
  onUrlsChange: (urls: UrlItem[]) => void;

  /**
   * Label for the array section
   * @default "Media Files"
   */
  label?: string;

  /**
   * Label for each individual item
   * @default "File" (shows as "File 1", "File 2", etc.)
   */
  itemLabel?: string;

  /**
   * Placeholder text for URL inputs
   * @default "Enter media URL or select file..."
   */
  placeholder?: string;

  /**
   * Minimum number of URLs required
   * @default 1
   */
  minUrls?: number;

  /**
   * Maximum number of URLs allowed
   * @default undefined (no limit)
   */
  maxUrls?: number;

  /**
   * Whether to show file picker integration
   * @default true
   */
  showFilePicker?: boolean;

  /**
   * Accepted media types for file picker
   * @default MEDIA_TYPES.ALL_MEDIA
   */
  acceptedTypes?: string;

  /**
   * Whether the inputs are disabled (during loading states)
   * @default false
   */
  disabled?: boolean;
}
