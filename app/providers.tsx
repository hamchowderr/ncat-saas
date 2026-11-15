"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { WorkspaceProvider } from "@/lib/workspace-context";

/**
 * React Query Provider for the entire application
 *
 * This provider enables React Query for all data fetching throughout the app.
 * It includes sensible defaults for caching and refetching behavior.
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/overview
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside the component to avoid sharing state between requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 1 minute
            staleTime: 60 * 1000,
            // Don't refetch on window focus (can be annoying during development)
            refetchOnWindowFocus: false,
            // Retry failed requests 3 times with exponential backoff
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WorkspaceProvider>
        {children}
        {/* DevTools only shown in development */}
        <ReactQueryDevtools initialIsOpen={false} />
      </WorkspaceProvider>
    </QueryClientProvider>
  );
}
