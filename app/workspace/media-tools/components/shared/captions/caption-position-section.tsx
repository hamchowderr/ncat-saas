"use client";

import { Label } from "@/components/ui/label";
import { CaptionPosition, CaptionPositionSectionProps } from "./types";
import { cn } from "@/lib/utils";

/**
 * Reusable caption position selector component
 * Visual 9-point grid for selecting caption placement
 * Used by: video/caption tool
 *
 * @example
 * ```tsx
 * const [position, setPosition] = useState<CaptionPosition>("bottom-center");
 *
 * <CaptionPositionSection
 *   position={position}
 *   onPositionChange={setPosition}
 *   disabled={isLoading}
 * />
 * ```
 */
export function CaptionPositionSection({
  position,
  onPositionChange,
  disabled = false
}: CaptionPositionSectionProps) {
  const positions: CaptionPosition[] = [
    "top-left",
    "top-center",
    "top-right",
    "middle-left",
    "middle-center",
    "middle-right",
    "bottom-left",
    "bottom-center",
    "bottom-right"
  ];

  const positionLabels: Record<CaptionPosition, string> = {
    "top-left": "Top Left",
    "top-center": "Top Center",
    "top-right": "Top Right",
    "middle-left": "Middle Left",
    "middle-center": "Middle Center",
    "middle-right": "Middle Right",
    "bottom-left": "Bottom Left",
    "bottom-center": "Bottom Center",
    "bottom-right": "Bottom Right"
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Caption Position</Label>
      <p className="text-muted-foreground text-xs">
        Select where captions should appear on the video
      </p>

      {/* 9-point grid visual selector */}
      <div className="grid grid-cols-3 gap-2">
        {positions.map((pos) => (
          <button
            key={pos}
            type="button"
            onClick={() => onPositionChange(pos)}
            disabled={disabled}
            className={cn(
              "flex h-20 items-center justify-center rounded-md border-2 text-xs font-medium transition-all",
              position === pos
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-input bg-background hover:border-primary/50 hover:bg-accent",
              disabled && "cursor-not-allowed opacity-50"
            )}
            aria-label={positionLabels[pos]}
          >
            {positionLabels[pos]}
          </button>
        ))}
      </div>

      {/* Current selection display */}
      <div className="rounded-md border bg-muted/50 p-3">
        <p className="text-xs">
          <span className="font-medium">Current Position:</span>{" "}
          <span className="text-muted-foreground">{positionLabels[position]}</span>
        </p>
      </div>
    </div>
  );
}
