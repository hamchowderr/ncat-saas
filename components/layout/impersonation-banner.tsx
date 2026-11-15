"use client";

import { useWorkspaceContext } from "@/lib/workspace-context";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

/**
 * Impersonation Banner Component
 *
 * Displays a prominent warning banner when an app admin is viewing
 * a workspace they are not a member of (impersonating).
 *
 * Features:
 * - Only visible to app admins when impersonating
 * - Shows workspace name being viewed
 * - Provides button to return to admin's own workspace
 * - Sticky positioning at top of page
 */
export function ImpersonationBanner() {
  const { isImpersonating, activeWorkspace, workspaceList, setActiveWorkspace } = useWorkspaceContext();
  const router = useRouter();

  // Don't render if not impersonating
  if (!isImpersonating || !activeWorkspace) {
    return null;
  }

  const handleReturnToMyWorkspace = () => {
    // Find the admin's primary workspace (where they're owner)
    const primaryWorkspace = workspaceList.find((ws) => {
      // The first workspace in the list for admins should be their own
      // This is a simple heuristic; you could also query for owner role
      return true; // Return to first workspace in list
    });

    if (primaryWorkspace) {
      setActiveWorkspace(primaryWorkspace.id);
      router.refresh();
    }
  };

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold text-yellow-900 dark:text-yellow-100">
                🔐 Admin Impersonation Mode
              </span>
              <span className="text-yellow-800 dark:text-yellow-200 text-sm">
                You are viewing <strong>&quot;{activeWorkspace.name}&quot;</strong> workspace
              </span>
            </div>
          </div>

          <Button
            onClick={handleReturnToMyWorkspace}
            variant="outline"
            size="sm"
            className="bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/40 flex-shrink-0"
          >
            <X className="h-4 w-4 mr-2" />
            Return to My Workspace
          </Button>
        </div>
      </div>
    </div>
  );
}
