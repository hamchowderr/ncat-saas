"use client";

import { STALE_TIMES, RETRY_CONFIG } from "@/lib/query-config";
import { useQuery } from "@tanstack/react-query";
import type { UserCookie } from "@/lib/types/cookies";

/**
 * React hook for managing user cookies
 * Fetches cookies from API using React Query
 */
export function useCookies() {
  const {
    data: cookies = [],
    isLoading: loading,
    error: queryError,
    refetch: refreshCookies
  } = useQuery({
    queryKey: ["cookies"],
    queryFn: async () => {
      const response = await fetch("/api/cookies");

      if (!response.ok) {
        throw new Error(`Failed to fetch cookies: ${response.statusText}`);
      }

      const data = await response.json();
      return data.cookies || [];
    },
    staleTime: STALE_TIMES.USER_DATA, // 2 minutes - cookies don't change frequently
    retry: RETRY_CONFIG.DEFAULT
  });

  return {
    cookies,
    loading,
    error: queryError ? (queryError as Error).message : null,
    refreshCookies
  };
}
