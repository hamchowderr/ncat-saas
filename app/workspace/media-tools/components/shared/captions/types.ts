/**
 * Shared TypeScript interfaces for Video Caption components
 * Based on NCAT API video/caption endpoint
 */

/**
 * Caption style settings
 * Controls fonts, colors, formatting, and visual appearance
 */
export interface CaptionStyleSettings {
  fonts?: string;
  font_size?: number;
  primary_color?: string;
  outline_color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikeout?: boolean;
  alignment?: number;
}

/**
 * Caption position (9-point grid)
 * Maps to NCAT API position parameter
 */
export type CaptionPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "middle-center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/**
 * Advanced caption settings
 * Controls visual effects (outline and shadow)
 */
export interface CaptionAdvancedSettings {
  outline?: number;
  shadow?: number;
}

/**
 * Text replacement item
 * Used for find-and-replace operations on transcribed text
 */
export interface TextReplacement {
  original: string;
  replacement: string;
}

/**
 * Time range for exclusions
 * Timestamps where captions should not appear
 */
export interface ExcludeRange {
  start: string;
  end: string;
}

/**
 * Complete caption settings (all 28 parameters)
 */
export interface CaptionSettings
  extends CaptionStyleSettings,
    CaptionAdvancedSettings {
  position?: CaptionPosition;
  text_replacements?: TextReplacement[];
  exclude_ranges?: ExcludeRange[];
}

/**
 * Props for CaptionStyleSection component
 */
export interface CaptionStyleSectionProps {
  fonts: string;
  onFontsChange: (value: string) => void;
  fontSize: number;
  onFontSizeChange: (value: number) => void;
  primaryColor: string;
  onPrimaryColorChange: (value: string) => void;
  outlineColor: string;
  onOutlineColorChange: (value: string) => void;
  bold: boolean;
  onBoldChange: (value: boolean) => void;
  italic: boolean;
  onItalicChange: (value: boolean) => void;
  underline: boolean;
  onUnderlineChange: (value: boolean) => void;
  strikeout: boolean;
  onStrikeoutChange: (value: boolean) => void;
  alignment: number;
  onAlignmentChange: (value: number) => void;
  disabled?: boolean;
  collapsible?: boolean;
}

/**
 * Props for CaptionPositionSection component
 */
export interface CaptionPositionSectionProps {
  position: CaptionPosition;
  onPositionChange: (value: CaptionPosition) => void;
  disabled?: boolean;
}

/**
 * Props for CaptionAdvancedSection component
 */
export interface CaptionAdvancedSectionProps {
  outline?: number;
  onOutlineChange?: (value: number) => void;
  shadow?: number;
  onShadowChange?: (value: number) => void;
  disabled?: boolean;
  collapsible?: boolean;
}

/**
 * Props for TextReplacementsSection component
 */
export interface TextReplacementsSectionProps {
  replacements: TextReplacement[];
  onReplacementsChange: (replacements: TextReplacement[]) => void;
  disabled?: boolean;
  collapsible?: boolean;
}

/**
 * Props for ExcludeRangesSection component
 */
export interface ExcludeRangesSectionProps {
  ranges: ExcludeRange[];
  onRangesChange: (ranges: ExcludeRange[]) => void;
  disabled?: boolean;
  collapsible?: boolean;
}

/**
 * Font options for caption style
 * Common fonts available in most systems
 */
export const CAPTION_FONTS = [
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Courier New", label: "Courier New" },
  { value: "Verdana", label: "Verdana" },
  { value: "Georgia", label: "Georgia" },
  { value: "Palatino", label: "Palatino" },
  { value: "Garamond", label: "Garamond" },
  { value: "Comic Sans MS", label: "Comic Sans MS" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Impact", label: "Impact" }
];

/**
 * Alignment options (ASS subtitle format)
 * 1-9 represent 9-point grid positioning
 */
export const CAPTION_ALIGNMENT = [
  { value: 1, label: "Bottom Left" },
  { value: 2, label: "Bottom Center" },
  { value: 3, label: "Bottom Right" },
  { value: 4, label: "Middle Left" },
  { value: 5, label: "Middle Center" },
  { value: 6, label: "Middle Right" },
  { value: 7, label: "Top Left" },
  { value: 8, label: "Top Center" },
  { value: 9, label: "Top Right" }
];

/**
 * Position grid mapping (user-friendly names to alignment values)
 */
export const POSITION_TO_ALIGNMENT: Record<CaptionPosition, number> = {
  "bottom-left": 1,
  "bottom-center": 2,
  "bottom-right": 3,
  "middle-left": 4,
  "middle-center": 5,
  "middle-right": 6,
  "top-left": 7,
  "top-center": 8,
  "top-right": 9
};

/**
 * Alignment to position mapping (reverse lookup)
 */
export const ALIGNMENT_TO_POSITION: Record<number, CaptionPosition> = {
  1: "bottom-left",
  2: "bottom-center",
  3: "bottom-right",
  4: "middle-left",
  5: "middle-center",
  6: "middle-right",
  7: "top-left",
  8: "top-center",
  9: "top-right"
};
