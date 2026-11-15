/**
 * Caption Components - Shared UI for video caption tool
 * Exports all 5 specialized caption components and types
 */

export { CaptionStyleSection } from "./caption-style-section";
export { CaptionPositionSection } from "./caption-position-section";
export { CaptionAdvancedSection } from "./caption-advanced-section";
export { TextReplacementsSection } from "./text-replacements-section";
export { ExcludeRangesSection } from "./exclude-ranges-section";

export type {
  CaptionStyleSettings,
  CaptionPosition,
  CaptionAdvancedSettings,
  TextReplacement,
  ExcludeRange,
  CaptionSettings,
  CaptionStyleSectionProps,
  CaptionPositionSectionProps,
  CaptionAdvancedSectionProps,
  TextReplacementsSectionProps,
  ExcludeRangesSectionProps
} from "./types";

export {
  CAPTION_FONTS,
  CAPTION_ALIGNMENT,
  POSITION_TO_ALIGNMENT,
  ALIGNMENT_TO_POSITION
} from "./types";
