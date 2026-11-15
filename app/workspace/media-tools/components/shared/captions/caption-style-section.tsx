"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { CAPTION_FONTS, CAPTION_ALIGNMENT, CaptionStyleSectionProps } from "./types";

/**
 * Reusable caption style settings component
 * Controls fonts, colors, and text formatting (11 parameters)
 * Used by: video/caption tool
 *
 * @example
 * ```tsx
 * const [fonts, setFonts] = useState("Arial");
 * const [fontSize, setFontSize] = useState(48);
 * const [primaryColor, setPrimaryColor] = useState("#FFFFFF");
 * const [bold, setBold] = useState(false);
 * // ... other style state
 *
 * <CaptionStyleSection
 *   fonts={fonts}
 *   onFontsChange={setFonts}
 *   fontSize={fontSize}
 *   onFontSizeChange={setFontSize}
 *   // ... other props (no outline/shadow/marginV)
 *   disabled={isLoading}
 *   collapsible={true}
 * />
 * ```
 */
export function CaptionStyleSection({
  fonts,
  onFontsChange,
  fontSize,
  onFontSizeChange,
  primaryColor,
  onPrimaryColorChange,
  outlineColor,
  onOutlineColorChange,
  bold,
  onBoldChange,
  italic,
  onItalicChange,
  underline,
  onUnderlineChange,
  strikeout,
  onStrikeoutChange,
  alignment,
  onAlignmentChange,
  disabled = false,
  collapsible = false
}: CaptionStyleSectionProps) {
  const content = (
    <div className="space-y-4">
      {/* Font Selection */}
      <div className="space-y-2">
        <Label htmlFor="fonts" className="text-sm font-medium">
          Font Family
        </Label>
        <Select value={fonts} onValueChange={onFontsChange} disabled={disabled}>
          <SelectTrigger id="fonts" className="h-10">
            <SelectValue placeholder="Select font..." />
          </SelectTrigger>
          <SelectContent>
            {CAPTION_FONTS.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <Label htmlFor="font-size" className="text-sm font-medium">
          Font Size (px)
        </Label>
        <Input
          id="font-size"
          type="number"
          value={fontSize}
          onChange={(e) => onFontSizeChange(parseInt(e.target.value, 10) || 48)}
          min={8}
          max={200}
          className="h-10"
          disabled={disabled}
        />
        <p className="text-muted-foreground text-xs">
          Recommended: 48px for 1080p videos
        </p>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="primary-color" className="text-sm font-medium">
            Text Color
          </Label>
          <Input
            id="primary-color"
            type="color"
            value={primaryColor}
            onChange={(e) => onPrimaryColorChange(e.target.value)}
            className="h-10"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="outline-color" className="text-sm font-medium">
            Outline Color
          </Label>
          <Input
            id="outline-color"
            type="color"
            value={outlineColor}
            onChange={(e) => onOutlineColorChange(e.target.value)}
            className="h-10"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Text Formatting Checkboxes */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Text Formatting</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bold"
              checked={bold}
              onCheckedChange={(checked) => onBoldChange(checked === true)}
              disabled={disabled}
            />
            <label
              htmlFor="bold"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Bold
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="italic"
              checked={italic}
              onCheckedChange={(checked) => onItalicChange(checked === true)}
              disabled={disabled}
            />
            <label
              htmlFor="italic"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Italic
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="underline"
              checked={underline}
              onCheckedChange={(checked) => onUnderlineChange(checked === true)}
              disabled={disabled}
            />
            <label
              htmlFor="underline"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Underline
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="strikeout"
              checked={strikeout}
              onCheckedChange={(checked) => onStrikeoutChange(checked === true)}
              disabled={disabled}
            />
            <label
              htmlFor="strikeout"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Strikeout
            </label>
          </div>
        </div>
      </div>

      {/* Alignment */}
      <div className="space-y-2">
        <Label htmlFor="alignment" className="text-sm font-medium">
          Text Alignment
        </Label>
        <Select
          value={alignment.toString()}
          onValueChange={(value) => onAlignmentChange(parseInt(value, 10))}
          disabled={disabled}
        >
          <SelectTrigger id="alignment" className="h-10">
            <SelectValue placeholder="Select alignment..." />
          </SelectTrigger>
          <SelectContent>
            {CAPTION_ALIGNMENT.map((align) => (
              <SelectItem key={align.value} value={align.value.toString()}>
                {align.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-xs">
          ASS subtitle format alignment (1-9 grid)
        </p>
      </div>
    </div>
  );

  if (collapsible) {
    return (
      <Collapsible defaultOpen className="space-y-3">
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-3 hover:bg-accent">
          <span className="text-sm font-medium">Caption Style Settings</span>
          <ChevronDown className="h-4 w-4 transition-transform ui-expanded:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4">{content}</CollapsibleContent>
      </Collapsible>
    );
  }

  return <div className="space-y-4">{content}</div>;
}
