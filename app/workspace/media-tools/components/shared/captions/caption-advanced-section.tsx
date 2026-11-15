"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { CaptionAdvancedSectionProps } from "./types";

/**
 * Reusable advanced caption settings component
 * Controls visual effects: outline width and shadow distance (2 parameters)
 * Used by: video/caption tool
 *
 * @example
 * ```tsx
 * const [outline, setOutline] = useState(2);
 * const [shadow, setShadow] = useState(0);
 *
 * <CaptionAdvancedSection
 *   outline={outline}
 *   onOutlineChange={setOutline}
 *   shadow={shadow}
 *   onShadowChange={setShadow}
 *   disabled={isLoading}
 *   collapsible={true}
 * />
 * ```
 */
export function CaptionAdvancedSection({
  outline,
  onOutlineChange,
  shadow,
  onShadowChange,
  disabled = false,
  collapsible = false
}: CaptionAdvancedSectionProps) {
  const content = (
    <div className="space-y-4">
      {/* Visual Effects - Only parameters supported by NCAT API */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="outline" className="text-sm font-medium">
            Outline Width
          </Label>
          <Input
            id="outline"
            type="number"
            value={outline ?? 0}
            onChange={(e) => onOutlineChange?.(parseInt(e.target.value, 10) || 0)}
            min={0}
            max={10}
            className="h-10"
            disabled={disabled}
          />
          <p className="text-muted-foreground text-xs">
            Width of the text outline in pixels
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="shadow" className="text-sm font-medium">
            Shadow Distance
          </Label>
          <Input
            id="shadow"
            type="number"
            value={shadow ?? 0}
            onChange={(e) => onShadowChange?.(parseInt(e.target.value, 10) || 0)}
            min={0}
            max={10}
            className="h-10"
            disabled={disabled}
          />
          <p className="text-muted-foreground text-xs">
            Distance of the text shadow in pixels
          </p>
        </div>
      </div>
    </div>
  );

  if (collapsible) {
    return (
      <Collapsible className="space-y-3">
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-3 hover:bg-accent">
          <span className="text-sm font-medium">Advanced Settings</span>
          <ChevronDown className="h-4 w-4 transition-transform ui-expanded:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4">{content}</CollapsibleContent>
      </Collapsible>
    );
  }

  return <div className="space-y-4">{content}</div>;
}
