"use client";

import { Input } from "@/components/ui/input";
import { MediaFilePicker } from "./media-file-picker";

interface UrlInputWithPickerProps {
  value: string;
  onChange: (value: string) => void;
  onFileIdChange?: (fileId: string | null) => void; // NEW: Callback for file ID changes
  accept?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * URL Input with File Picker Component
 *
 * A reusable component that combines a text input for URLs with a file picker button.
 * Users can either paste a URL directly or select a file from their uploads.
 *
 * @example
 * <UrlInputWithPicker
 *   value={videoUrl}
 *   onChange={setVideoUrl}
 *   accept={MEDIA_TYPES.VIDEO}
 *   placeholder="Select video or paste URL..."
 * />
 */
export function UrlInputWithPicker({
  value,
  onChange,
  onFileIdChange,
  accept,
  placeholder = "Select from files or paste URL...",
  id,
  className = "h-10",
  disabled = false
}: UrlInputWithPickerProps) {
  // When URL is manually typed, clear the file ID since it's not from our picker
  const handleUrlChange = (newUrl: string) => {
    onChange(newUrl);
    onFileIdChange?.(null); // Clear file ID when manually typing URL
  };

  // When file is selected from picker, update both URL and file ID
  const handleFileSelect = (url: string, fileId: string) => {
    onChange(url);
    onFileIdChange?.(fileId);
  };

  // When picker is cleared, clear both URL and file ID
  const handleClear = () => {
    onChange("");
    onFileIdChange?.(null);
  };

  return (
    <div className="flex gap-2">
      <Input
        id={id}
        value={value}
        onChange={(e) => handleUrlChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
      <MediaFilePicker
        accept={accept}
        onSelect={handleFileSelect}
        disabled={disabled}
        onClear={handleClear}
        currentValue={value}
        placeholder={placeholder}
      />
    </div>
  );
}
