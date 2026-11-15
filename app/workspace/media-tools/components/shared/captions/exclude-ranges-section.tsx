"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { ExcludeRangesSectionProps } from "./types";

/**
 * Reusable exclude ranges component
 * Dynamic array of time ranges where captions should not appear
 * Used by: video/caption tool
 *
 * @example
 * ```tsx
 * const [excludeRanges, setExcludeRanges] = useState<ExcludeRange[]>([]);
 *
 * <ExcludeRangesSection
 *   ranges={excludeRanges}
 *   onRangesChange={setExcludeRanges}
 *   disabled={isLoading}
 *   collapsible={true}
 * />
 * ```
 */
export function ExcludeRangesSection({
  ranges,
  onRangesChange,
  disabled = false,
  collapsible = false
}: ExcludeRangesSectionProps) {
  const addRange = () => {
    onRangesChange([...ranges, { start: "", end: "" }]);
  };

  const removeRange = (index: number) => {
    onRangesChange(ranges.filter((_, i) => i !== index));
  };

  const updateRange = (index: number, field: "start" | "end", value: string) => {
    const updated = [...ranges];
    updated[index][field] = value;
    onRangesChange(updated);
  };

  const content = (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">
        Specify time ranges where captions should be excluded from the video
      </p>

      {ranges.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">No exclusion ranges configured</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Click &ldquo;Add Exclusion Range&rdquo; to hide captions in specific time ranges
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ranges.map((range, index) => (
            <div key={index} className="space-y-2 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Exclusion Range {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRange(index)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`exclude-start-${index}`} className="text-xs">
                    Start Time (hh:mm:ss.ms)
                  </Label>
                  <Input
                    id={`exclude-start-${index}`}
                    value={range.start}
                    onChange={(e) => updateRange(index, "start", e.target.value)}
                    placeholder="00:00:10.500"
                    className="h-9 text-sm"
                    disabled={disabled}
                  />
                </div>
                <div>
                  <Label htmlFor={`exclude-end-${index}`} className="text-xs">
                    End Time (hh:mm:ss.ms)
                  </Label>
                  <Input
                    id={`exclude-end-${index}`}
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
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={addRange}
        className="h-9 w-full border-dashed"
        disabled={disabled}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Exclusion Range
      </Button>
    </div>
  );

  if (collapsible) {
    return (
      <Collapsible className="space-y-3">
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-3 hover:bg-accent">
          <span className="text-sm font-medium">
            Exclude Time Ranges {ranges.length > 0 && `(${ranges.length})`}
          </span>
          <ChevronDown className="h-4 w-4 transition-transform ui-expanded:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">{content}</CollapsibleContent>
      </Collapsible>
    );
  }

  return <div className="space-y-3">{content}</div>;
}
