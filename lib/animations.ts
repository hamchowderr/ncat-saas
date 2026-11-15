/**
 * Shared Animation Utilities using anime.js v4
 *
 * This file provides reusable animation configurations and helper functions
 * for consistent animations throughout the application.
 */

import { animate, stagger, type TimerParams as AnimeParams } from "animejs";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Flexible animation options type that accepts any anime.js property
 */
type AnimationOptions = {
  stagger?: number;
  [key: string]: any;
};

// ============================================================================
// ANIMATION CONFIGURATIONS
// ============================================================================

/**
 * Standard easing curves for consistent feel
 */
export const easings = {
  smooth: "outQuad",
  bounce: "outElastic(1, 0.6)",
  spring: "spring(1, 80, 10, 0)",
  snappy: "outExpo",
  gentle: "inOutQuad"
} as const;

/**
 * Standard durations in milliseconds
 */
export const durations = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800
} as const;

// ============================================================================
// FADE ANIMATIONS
// ============================================================================

/**
 * Fade in animation
 */
export function fadeIn(
  target: HTMLElement | HTMLElement[] | string,
  options: AnimationOptions = {}
) {
  return animate(target, {
    opacity: [0, 1],
    duration: durations.normal,
    ease: easings.smooth,
    ...options
  });
}

/**
 * Fade out animation
 */
export function fadeOut(
  target: HTMLElement | HTMLElement[] | string,
  options: AnimationOptions = {}
) {
  return animate(target, {
    opacity: [1, 0],
    duration: durations.normal,
    ease: easings.smooth,
    ...options
  });
}

// ============================================================================
// SLIDE ANIMATIONS
// ============================================================================

/**
 * Slide in from bottom with fade
 */
export function slideInUp(
  target: HTMLElement | HTMLElement[] | string,
  options: AnimationOptions = {}
) {
  return animate(target, {
    y: [50, 0],
    opacity: [0, 1],
    duration: durations.normal,
    ease: easings.smooth,
    ...options
  });
}

/**
 * Slide in from right with fade
 */
export function slideInRight(
  target: HTMLElement | HTMLElement[] | string,
  options: { stagger?: number; [key: string]: any } = {}
) {
  const { stagger: staggerTime, ...restOptions } = options;
  const animationOptions: any = {
    x: [50, 0],
    opacity: [0, 1],
    duration: durations.normal,
    ease: easings.smooth,
    ...restOptions
  };

  // Add stagger if provided and target is multiple elements
  if (staggerTime !== undefined && (Array.isArray(target) || typeof target === "string")) {
    animationOptions.delay = stagger(staggerTime);
  }

  return animate(target, animationOptions);
}

/**
 * Slide out to left with fade
 */
export function slideOutLeft(
  target: HTMLElement | HTMLElement[] | string,
  options: AnimationOptions = {}
) {
  return animate(target, {
    x: [0, -100],
    opacity: [1, 0],
    duration: durations.fast,
    ease: easings.snappy,
    ...options
  });
}

/**
 * Slide out to right with fade
 */
export function slideOutRight(
  target: HTMLElement | HTMLElement[] | string,
  options: AnimationOptions = {}
) {
  return animate(target, {
    x: [0, 100],
    opacity: [1, 0],
    duration: durations.fast,
    ease: easings.snappy,
    ...options
  });
}

// ============================================================================
// SCALE ANIMATIONS
// ============================================================================

/**
 * Pop in animation (scale from 0)
 */
export function popIn(
  target: HTMLElement | HTMLElement[] | string,
  options: AnimationOptions = {}
) {
  return animate(target, {
    scale: [0, 1],
    opacity: [0, 1],
    duration: durations.normal,
    ease: easings.bounce,
    ...options
  });
}

/**
 * Pop out animation (scale to 0)
 */
export function popOut(
  target: HTMLElement | HTMLElement[] | string,
  options: AnimationOptions = {}
) {
  return animate(target, {
    scale: [1, 0],
    opacity: [1, 0],
    duration: durations.fast,
    ease: easings.snappy,
    ...options
  });
}

/**
 * Pulse animation (scale up and back)
 */
export function pulse(
  target: HTMLElement | HTMLElement[] | string,
  options: AnimationOptions = {}
) {
  return animate(target, {
    scale: [1, 1.1, 1],
    duration: durations.slow,
    ease: easings.gentle,
    ...options
  });
}

// ============================================================================
// STAGGER ANIMATIONS
// ============================================================================

/**
 * Staggered fade in from bottom
 */
export function staggerFadeInUp(target: HTMLElement[] | string, options: AnimationOptions = {}) {
  const { stagger: staggerTime = 50, ...restOptions } = options;
  return animate(target, {
    y: [30, 0],
    opacity: [0, 1],
    duration: durations.normal,
    ease: easings.smooth,
    delay: stagger(staggerTime), // Use stagger function with delay
    ...restOptions
  });
}

/**
 * Staggered scale in animation
 */
export function staggerScaleIn(target: HTMLElement[] | string, options: AnimationOptions = {}) {
  const { stagger: staggerTime = 50, ...restOptions } = options;
  return animate(target, {
    scale: [0, 1],
    opacity: [0, 1],
    duration: durations.normal,
    ease: easings.bounce,
    delay: stagger(staggerTime),
    ...restOptions
  });
}

/**
 * Grid stagger (for 2D layouts)
 */
export function gridStagger(
  target: HTMLElement[] | string,
  columns: number = 3,
  options: AnimationOptions = {}
) {
  const { stagger: staggerValue = 50, ...restOptions } = options;
  return animate(target, {
    scale: [0, 1],
    opacity: [0, 1],
    duration: durations.normal,
    ease: easings.smooth,
    delay: stagger(staggerValue, {
      grid: [columns, Infinity],
      from: "first"
    }),
    ...restOptions
  });
}

// ============================================================================
// SPECIAL EFFECTS
// ============================================================================

/**
 * Shake animation (for errors)
 */
export function shake(
  target: HTMLElement | HTMLElement[] | string,
  options: AnimationOptions = {}
) {
  return animate(target, {
    x: [0, -10, 10, -10, 10, 0],
    duration: durations.slow,
    ease: easings.snappy,
    ...options
  });
}

/**
 * Bounce animation
 */
export function bounce(
  target: HTMLElement | HTMLElement[] | string,
  options: AnimationOptions = {}
) {
  return animate(target, {
    y: [0, -20, 0],
    duration: durations.slow,
    ease: easings.bounce,
    ...options
  });
}

/**
 * Ripple effect (scale + opacity)
 */
export function ripple(
  target: HTMLElement | HTMLElement[] | string,
  options: AnimationOptions = {}
) {
  return animate(target, {
    scale: [0, 2],
    opacity: [0.5, 0],
    duration: durations.slow,
    ease: easings.smooth,
    ...options
  });
}

/**
 * Glow pulse (for highlighting)
 */
export function glowPulse(
  target: HTMLElement | HTMLElement[] | string,
  options: AnimationOptions = {}
) {
  return animate(target, {
    boxShadow: [
      "0 0 0px rgba(59, 130, 246, 0)",
      "0 0 20px rgba(59, 130, 246, 0.5)",
      "0 0 0px rgba(59, 130, 246, 0)"
    ],
    duration: durations.verySlow,
    ease: easings.gentle,
    loop: true,
    ...options
  });
}

// ============================================================================
// HOVER EFFECTS
// ============================================================================

/**
 * Lift effect (translate up + shadow)
 */
export function liftUp(target: HTMLElement, options: AnimationOptions = {}) {
  return animate(target, {
    y: -8,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    duration: durations.fast,
    ease: easings.smooth,
    ...options
  });
}

/**
 * Reset lift effect
 */
export function liftDown(target: HTMLElement, options: AnimationOptions = {}) {
  return animate(target, {
    y: 0,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    duration: durations.fast,
    ease: easings.smooth,
    ...options
  });
}

/**
 * 3D tilt effect
 */
export function tilt3D(
  target: HTMLElement,
  rotateX: number = 10,
  rotateY: number = 10,
  options: AnimationOptions = {}
) {
  return animate(target, {
    rotateX: `${rotateX}deg`,
    rotateY: `${rotateY}deg`,
    duration: durations.fast,
    ease: easings.smooth,
    ...options
  });
}

/**
 * Reset 3D tilt
 */
export function resetTilt3D(target: HTMLElement, options: AnimationOptions = {}) {
  return animate(target, {
    rotateX: "0deg",
    rotateY: "0deg",
    duration: durations.fast,
    ease: easings.smooth,
    ...options
  });
}

// ============================================================================
// PROGRESS ANIMATIONS
// ============================================================================

/**
 * Animated progress bar
 */
export function animateProgress(
  target: HTMLElement | string,
  from: number = 0,
  to: number = 100,
  options: AnimationOptions = {}
) {
  return animate(target, {
    width: [`${from}%`, `${to}%`],
    duration: durations.normal,
    ease: easings.smooth,
    ...options
  });
}

/**
 * Loading spinner rotation
 */
export function spinLoader(target: HTMLElement | string, options: AnimationOptions = {}) {
  return animate(target, {
    rotate: "1turn",
    duration: 1000,
    ease: "linear",
    loop: true,
    ...options
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Conditionally apply animation (respects reduced motion preference)
 */
export function conditionalAnimate(
  target: HTMLElement | HTMLElement[] | string,
  options: AnimationOptions,
  fallback?: () => void
) {
  if (prefersReducedMotion()) {
    // If reduced motion is preferred, just set final state
    fallback?.();
    return null;
  }
  return animate(target, options as any);
}

/**
 * Create a reusable animation timeline
 */
export function createTimeline() {
  // anime.js v4 timeline API - will be used in components
  return animate;
}

/**
 * Delay helper
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
