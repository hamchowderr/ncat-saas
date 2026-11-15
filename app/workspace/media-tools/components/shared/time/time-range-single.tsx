"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimeRangeSingleProps } from "./types";

/**
 * Reusable single time range input (start and end times)
 * Used by 2 NCAT API endpoints: video/trim, media/silence
 *
 * @example
 * ```tsx
 * const [startTime, setStartTime] = useState("");
 * const [endTime, setEndTime] = useState("");
 *
 * <TimeRangeSingle
 *   startTime={startTime}
 *   onStartTimeChange={setStartTime}
 *   endTime={endTime}
 *   onEndTimeChange={setEndTime}
 *   required={false}
 * />
 * ```
 */
export function TimeRangeSingle({
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  startLabel = "Start Time",
  endLabel = "End Time",
  startPlaceholder = "00:30",
  endPlaceholder = "01:30",
  required = false,
  disabled = false
}: TimeRangeSingleProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="start-time" className="text-sm font-medium">
          {startLabel}{" "}
          {required ? (
            <span className="text-red-500">*</span>
          ) : (
            <span className="text-muted-foreground">(hh:mm:ss or mm:ss)</span>
          )}
        </Label>
        <Input
          id="start-time"
          value={startTime}
          onChange={(e) => onStartTimeChange(e.target.value)}
          placeholder={startPlaceholder}
          className="h-10"
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="end-time" className="text-sm font-medium">
          {endLabel}{" "}
          {required ? (
            <span className="text-red-500">*</span>
          ) : (
            <span className="text-muted-foreground">(hh:mm:ss or mm:ss)</span>
          )}
        </Label>
        <Input
          id="end-time"
          value={endTime}
          onChange={(e) => onEndTimeChange(e.target.value)}
          placeholder={endPlaceholder}
          className="h-10"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
