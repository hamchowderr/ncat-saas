"use client";

import { createClient } from "@/lib/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    const getUser = async () => {
      console.log("🔧 useUser: Getting initial user...");
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error) {
        console.error("🔧 useUser: Error getting user:", error);
      } else {
        console.log("🔧 useUser: Got user:", user ? `${user.email} (${user.id})` : "null");
      }

      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔧 useUser: Auth state changed:", event, session?.user ? `${session.user.email} (${session.user.id})` : "no user");
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
