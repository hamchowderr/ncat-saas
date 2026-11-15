"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/client";
import type { User } from "@supabase/supabase-js";
import { useEffect } from "react";

/**
 * Hook to fetch and manage current user data
 *
 * Uses React Query for automatic caching, race condition handling, and state management.
 * Subscribes to auth state changes for real-time updates.
 *
 * @returns {Object} React Query result with user data
 * @returns {User | null} data - Current authenticated user or null
 * @returns {boolean} isLoading - True while fetching user
 * @returns {Error | null} error - Error if user fetch failed
 *
 * @example
 * ```tsx
 * const { data: user, isLoading } = useUser()
 *
 * if (isLoading) return <Skeleton />
 * if (!user) return <div>Not logged in</div>
 *
 * return <div>Hello {user.email}</div>
 * ```
 */
export function useUser() {
  const queryClient = useQueryClient();

  // Set up auth state change listener (legitimate useEffect - external system sync)
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Invalidate user query when auth state changes
      queryClient.invalidateQueries({ queryKey: ["user"] });
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const supabase = createClient();

      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      return user;
    },
    // Retry once on failure
    retry: 1,
    // Keep data fresh for 5 minutes (auth state rarely changes)
    staleTime: 5 * 60 * 1000
  });
}
