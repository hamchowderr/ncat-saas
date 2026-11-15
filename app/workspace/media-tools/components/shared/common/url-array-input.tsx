"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { UrlInputWithPicker } from "../../url-input-with-picker";
import { MEDIA_TYPES } from "@/lib/media-types";
import { UrlArrayInputProps } from "./types";

/**
 * Reusable dynamic array of URL inputs with add/remove functionality
 * Optionally integrates with file picker for easy media selection
 * Used by 2 NCAT API endpoints: video/concatenate, audio/concatenate
 *
 * @example
 * ```tsx
 * const [videoUrls, setVideoUrls] = useState([{ url: "" }]);
 *
 * <UrlArrayInput
 *   urls={videoUrls}
 *   onUrlsChange={setVideoUrls}
 *   label="Videos to Concatenate"
 *   itemLabel="Video"
 *   acceptedTypes={MEDIA_TYPES.VIDEO}
 *   minUrls={2}
 * />
 * ```
 */
export function UrlArrayInput({
  urls,
  onUrlsChange,
  label = "Media Files",
  itemLabel = "File",
  placeholder = "Enter media URL or select file...",
  minUrls = 1,
  maxUrls,
  showFilePicker = true,
  acceptedTypes = MEDIA_TYPES.ALL_MEDIA,
  disabled = false
}: UrlArrayInputProps) {
  const addUrl = () => {
    if (maxUrls && urls.length >= maxUrls) {
      return;
    }
    onUrlsChange([...urls, { url: "" }]);
  };

  const removeUrl = (index: number) => {
    if (urls.length <= minUrls) {
      return;
    }
    onUrlsChange(urls.filter((_, i) => i !== index));
  };

  const updateUrl = (index: number, value: string) => {
    const updated = [...urls];
    updated[index].url = value;
    onUrlsChange(updated);
  };

  const canRemove = urls.length > minUrls;
  const canAdd = !maxUrls || urls.length < maxUrls;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        {label} {minUrls > 0 && <span className="text-red-500">*</span>}
      </Label>

      {urls.map((item, index) => (
        <div key={index} className="space-y-2 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {itemLabel} {index + 1}
            </span>
            {canRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeUrl(index)}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {showFilePicker ? (
            <UrlInputWithPicker
              id={`url-${index}`}
              value={item.url}
              onChange={(value) => updateUrl(index, value)}
              onFileIdChange={() => {}} // File ID not needed for concatenation
              accept={acceptedTypes}
              placeholder={placeholder}
              disabled={disabled}
            />
          ) : (
            <input
              id={`url-${index}`}
              type="url"
              value={item.url}
              onChange={(e) => updateUrl(index, e.target.value)}
              placeholder={placeholder}
              className="border-input bg-background ring-offset-background focus:ring-ring h-10 w-full rounded-md border px-3 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled}
            />
          )}
        </div>
      ))}

      {canAdd && (
        <Button
          type="button"
          variant="outline"
          onClick={addUrl}
          className="h-9 w-full border-dashed"
          disabled={disabled}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add {itemLabel}
        </Button>
      )}

      {minUrls > 1 && urls.length < minUrls && (
        <p className="text-destructive text-xs">
          At least {minUrls} {label.toLowerCase()} are required
        </p>
      )}
    </div>
  );
}
