/**
 * Shared TypeScript interfaces for time range components
 * Used by video/trim, video/split, video/cut, media/silence, video/caption
 */

/**
 * Time range with start and end times
 * Format: hh:mm:ss or mm:ss or hh:mm:ss.ms
 */
export interface TimeRange {
  /**
   * Start time in HH:MM:SS or MM:SS format
   */
  start: string;

  /**
   * End time in HH:MM:SS or MM:SS format
   */
  end: string;
}

/**
 * Props for the TimeRangeSingle component
 * Used by video/trim, media/silence
 */
export interface TimeRangeSingleProps {
  /**
   * Current start time value
   */
  startTime: string;

  /**
   * Callback when start time changes
   */
  onStartTimeChange: (value: string) => void;

  /**
   * Current end time value
   */
  endTime: string;

  /**
   * Callback when end time changes
   */
  onEndTimeChange: (value: string) => void;

  /**
   * Label for start time input
   * @default "Start Time"
   */
  startLabel?: string;

  /**
   * Label for end time input
   * @default "End Time"
   */
  endLabel?: string;

  /**
   * Placeholder for start time input
   * @default "00:30"
   */
  startPlaceholder?: string;

  /**
   * Placeholder for end time input
   * @default "01:30"
   */
  endPlaceholder?: string;

  /**
   * Whether the inputs are required
   * @default false
   */
  required?: boolean;

  /**
   * Whether the inputs are disabled (during loading states)
   * @default false
   */
  disabled?: boolean;
}

/**
 * Props for the TimeRangesArray component
 * Used by video/split, video/cut
 */
export interface TimeRangesArrayProps {
  /**
   * Array of time ranges
   */
  ranges: TimeRange[];

  /**
   * Callback when ranges array changes
   */
  onRangesChange: (ranges: TimeRange[]) => void;

  /**
   * Label for each range item
   * @default "Segment" for video/split, "Cut" for video/cut
   */
  itemLabel?: string;

  /**
   * Minimum number of ranges required
   * @default 1
   */
  minRanges?: number;

  /**
   * Maximum number of ranges allowed
   * @default undefined (no limit)
   */
  maxRanges?: number;

  /**
   * Whether the inputs are disabled (during loading states)
   * @default false
   */
  disabled?: boolean;
}
