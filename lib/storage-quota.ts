import { createClient } from "@/lib/client";

/**
 * Storage quota information for a workspace
 */
export interface StorageQuota {
  /** Total storage quota in bytes */
  quota: number;
  /** Currently used storage in bytes */
  used: number;
  /** Available storage in bytes */
  available: number;
  /** Usage percentage (0-100) */
  percentage: number;
  /** True if usage is above 80% */
  isNearLimit: boolean;
  /** True if usage is at or above 100% */
  isExceeded: boolean;
}

/**
 * Result of checking if an upload is allowed
 */
export interface UploadCheckResult {
  /** Whether the upload is allowed */
  allowed: boolean;
  /** Human-readable reason if not allowed */
  reason?: string;
  /** Storage quota details */
  quota?: StorageQuota;
}

/**
 * Get storage quota information for a workspace
 *
 * @param workspaceId - The workspace UUID
 * @returns Storage quota details
 */
export async function getWorkspaceStorageQuota(
  workspaceId: string
): Promise<StorageQuota | null> {
  const supabase = createClient();

  try {
    // Call database function to get quota
    const { data: quotaData, error: quotaError } = await supabase.rpc(
      "get_workspace_storage_quota",
      { p_workspace_id: workspaceId }
    );

    if (quotaError) {
      console.error("Error fetching storage quota:", quotaError);
      return null;
    }

    // Call database function to get usage
    const { data: usageData, error: usageError } = await supabase.rpc(
      "get_workspace_storage_usage",
      { p_workspace_id: workspaceId }
    );

    if (usageError) {
      console.error("Error fetching storage usage:", usageError);
      return null;
    }

    const quota = quotaData as number;
    const used = usageData as number;
    const available = Math.max(0, quota - used);
    const percentage = quota > 0 ? Math.round((used / quota) * 100) : 0;

    return {
      quota,
      used,
      available,
      percentage,
      isNearLimit: percentage >= 80,
      isExceeded: percentage >= 100
    };
  } catch (error) {
    console.error("Error getting workspace storage quota:", error);
    return null;
  }
}

/**
 * Check if a file upload is allowed based on workspace storage quota
 *
 * @param workspaceId - The workspace UUID
 * @param fileSizeBytes - Size of the file to upload in bytes
 * @returns Upload check result with detailed information
 */
export async function checkUploadAllowed(
  workspaceId: string,
  fileSizeBytes: number
): Promise<UploadCheckResult> {
  const supabase = createClient();

  try {
    // Call database function to check quota
    const { data, error } = await supabase.rpc("check_workspace_storage_quota", {
      p_workspace_id: workspaceId,
      p_file_size_bytes: fileSizeBytes
    });

    if (error) {
      console.error("Error checking storage quota:", error);
      return {
        allowed: false,
        reason: "Unable to verify storage quota. Please try again."
      };
    }

    const result = data as {
      allowed: boolean;
      quota: number;
      used: number;
      available: number;
      requested: number;
      wouldExceedBy: number;
    };

    // Build quota object
    const quota: StorageQuota = {
      quota: result.quota,
      used: result.used,
      available: result.available,
      percentage: result.quota > 0 ? Math.round((result.used / result.quota) * 100) : 0,
      isNearLimit: result.quota > 0 && result.used / result.quota >= 0.8,
      isExceeded: result.quota > 0 && result.used / result.quota >= 1.0
    };

    if (!result.allowed) {
      return {
        allowed: false,
        reason: `Upload would exceed storage quota by ${formatBytes(result.wouldExceedBy)}. ${formatBytes(result.available)} available of ${formatBytes(result.quota)} total. Please upgrade your plan or delete some files.`,
        quota
      };
    }

    return {
      allowed: true,
      quota
    };
  } catch (error) {
    console.error("Error checking upload allowed:", error);
    return {
      allowed: false,
      reason: "Unable to verify storage quota. Please try again."
    };
  }
}

/**
 * Format bytes into human-readable string
 *
 * @param bytes - Number of bytes to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1.5 GB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Get progress bar color based on usage percentage
 *
 * @param percentage - Usage percentage (0-100)
 * @returns Tailwind CSS color class
 */
export function getQuotaColor(percentage: number): string {
  if (percentage >= 95) return "bg-red-500";
  if (percentage >= 80) return "bg-yellow-500";
  return "bg-green-500";
}

/**
 * Get text color based on usage percentage
 *
 * @param percentage - Usage percentage (0-100)
 * @returns Tailwind CSS text color class
 */
export function getQuotaTextColor(percentage: number): string {
  if (percentage >= 95) return "text-red-500";
  if (percentage >= 80) return "text-yellow-500";
  return "text-green-500";
}
