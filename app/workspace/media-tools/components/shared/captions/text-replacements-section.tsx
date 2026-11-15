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
import { TextReplacementsSectionProps } from "./types";

/**
 * Reusable text replacements component
 * Dynamic array of find-and-replace pairs for transcribed text
 * Used by: video/caption tool
 *
 * @example
 * ```tsx
 * const [replacements, setReplacements] = useState<TextReplacement[]>([]);
 *
 * <TextReplacementsSection
 *   replacements={replacements}
 *   onReplacementsChange={setReplacements}
 *   disabled={isLoading}
 *   collapsible={true}
 * />
 * ```
 */
export function TextReplacementsSection({
  replacements,
  onReplacementsChange,
  disabled = false,
  collapsible = false
}: TextReplacementsSectionProps) {
  const addReplacement = () => {
    onReplacementsChange([...replacements, { original: "", replacement: "" }]);
  };

  const removeReplacement = (index: number) => {
    onReplacementsChange(replacements.filter((_, i) => i !== index));
  };

  const updateReplacement = (
    index: number,
    field: "original" | "replacement",
    value: string
  ) => {
    const updated = [...replacements];
    updated[index][field] = value;
    onReplacementsChange(updated);
  };

  const content = (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">
        Find and replace specific words or phrases in the transcribed text
      </p>

      {replacements.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">
            No text replacements configured
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Click &ldquo;Add Replacement&rdquo; to create find-and-replace rules
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {replacements.map((replacement, index) => (
            <div key={index} className="space-y-2 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Replacement {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReplacement(index)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`original-${index}`} className="text-xs">
                    Find (Original)
                  </Label>
                  <Input
                    id={`original-${index}`}
                    value={replacement.original}
                    onChange={(e) => updateReplacement(index, "original", e.target.value)}
                    placeholder="Text to find..."
                    className="h-9 text-sm"
                    disabled={disabled}
                  />
                </div>
                <div>
                  <Label htmlFor={`replacement-${index}`} className="text-xs">
                    Replace With
                  </Label>
                  <Input
                    id={`replacement-${index}`}
                    value={replacement.replacement}
                    onChange={(e) => updateReplacement(index, "replacement", e.target.value)}
                    placeholder="Replacement text..."
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
        onClick={addReplacement}
        className="h-9 w-full border-dashed"
        disabled={disabled}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Replacement
      </Button>
    </div>
  );

  if (collapsible) {
    return (
      <Collapsible className="space-y-3">
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-3 hover:bg-accent">
          <span className="text-sm font-medium">
            Text Replacements {replacements.length > 0 && `(${replacements.length})`}
          </span>
          <ChevronDown className="h-4 w-4 transition-transform ui-expanded:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">{content}</CollapsibleContent>
      </Collapsible>
    );
  }

  return <div className="space-y-3">{content}</div>;
}
