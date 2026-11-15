"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { TimeRangesArrayProps } from "./types";

/**
 * Reusable dynamic array of time ranges with add/remove functionality
 * Used by 2 NCAT API endpoints: video/split, video/cut
 *
 * @example
 * ```tsx
 * const [splits, setSplits] = useState([{ start: "", end: "" }]);
 *
 * <TimeRangesArray
 *   ranges={splits}
 *   onRangesChange={setSplits}
 *   itemLabel="Segment"
 *   minRanges={1}
 * />
 * ```
 */
export function TimeRangesArray({
  ranges,
  onRangesChange,
  itemLabel = "Segment",
  minRanges = 1,
  maxRanges,
  disabled = false
}: TimeRangesArrayProps) {
  const addRange = () => {
    if (maxRanges && ranges.length >= maxRanges) {
      return;
    }
    onRangesChange([...ranges, { start: "", end: "" }]);
  };

  const removeRange = (index: number) => {
    if (ranges.length <= minRanges) {
      return;
    }
    onRangesChange(ranges.filter((_, i) => i !== index));
  };

  const updateRange = (index: number, field: "start" | "end", value: string) => {
    const updated = [...ranges];
    updated[index][field] = value;
    onRangesChange(updated);
  };

  const canRemove = ranges.length > minRanges;
  const canAdd = !maxRanges || ranges.length < maxRanges;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        {itemLabel}s {minRanges > 0 && <span className="text-red-500">*</span>}
      </Label>

      {ranges.map((range, index) => (
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
                onClick={() => removeRange(index)}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor={`start-${index}`} className="text-xs">
                Start Time (hh:mm:ss.ms)
              </Label>
              <Input
                id={`start-${index}`}
                value={range.start}
                onChange={(e) => updateRange(index, "start", e.target.value)}
                placeholder="00:00:10.500"
                className="h-9 text-sm"
                disabled={disabled}
              />
            </div>
            <div>
              <Label htmlFor={`end-${index}`} className="text-xs">
                End Time (hh:mm:ss.ms)
              </Label>
              <Input
                id={`end-${index}`}
                value={range.end}
                onChange={(e) => updateRange(index, "end", e.target.value)}
                placeholder="00:00:20.500"
                className="h-9 text-sm"
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      ))}

      {canAdd && (
        <Button
          type="button"
          variant="outline"
          onClick={addRange}
          className="h-9 w-full border-dashed"
          disabled={disabled}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add {itemLabel}
        </Button>
      )}
    </div>
  );
}
