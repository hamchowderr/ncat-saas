/**
 * Standard staleTime values for React Query
 * Use these constants for consistent caching behavior across the app
 */
export const STALE_TIMES = {
  /** 10 seconds - Real-time data (messages, notifications) */
  REALTIME: 10_000,

  /** 30 seconds - Frequently changing (chats, recent activity) */
  FREQUENT: 30_000,

  /** 1 minute - Default for most queries */
  NORMAL: 60_000,

  /** 2 minutes - User data (profile, workspaces, cookies) */
  USER_DATA: 120_000,

  /** 5 minutes - Static data (products, plans, admin status) */
  STATIC: 300_000,

  /** 10 minutes - Very static data (rarely changing) */
  VERY_STATIC: 600_000
} as const;

/**
 * Standard retry configurations for React Query
 */
export const RETRY_CONFIG = {
  /** No retries - for non-critical data */
  NONE: 0,

  /** 1 retry - for user actions */
  ONCE: 1,

  /** 2 retries - default for most queries */
  DEFAULT: 2,

  /** 3 retries - for critical data */
  CRITICAL: 3
} as const;
