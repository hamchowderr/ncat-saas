import { createClient } from "@/lib/client";

export async function isUserAdmin(): Promise<boolean> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return false;
    }

    // Check if user is application admin using the database function
    const { data, error } = await supabase.rpc("is_application_admin", {
      user_id: user.id
    });

    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error("Error in isUserAdmin:", error);
    return false;
  }
}
