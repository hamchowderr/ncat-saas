/**
 * TypeScript types for cookie storage system
 */

export type CookiePlatform = "youtube" | "vimeo" | "instagram" | "tiktok" | "generic";

export type CookieAction = "created" | "used" | "refreshed" | "deleted" | "expired";

export interface UserCookie {
  id: string;
  user_id: string;
  platform: CookiePlatform;
  label: string | null;
  created_at: string;
  last_used_at: string | null;
  expires_at: string;
  is_active: boolean;
  // Note: encrypted_cookies is intentionally NOT included in this interface
  // as it should never be sent to the frontend
}

export interface CookieAuditLog {
  id: string;
  user_id: string;
  cookie_id: string | null;
  action: CookieAction;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface CreateCookieRequest {
  platform: CookiePlatform;
  label?: string;
  cookies: string; // Netscape format cookie string
}

export interface CreateCookieResponse {
  success: boolean;
  cookie?: UserCookie;
  error?: string;
}

export interface ListCookiesResponse {
  cookies: UserCookie[];
  error?: string;
}

export interface DeleteCookieResponse {
  success: boolean;
  error?: string;
}
