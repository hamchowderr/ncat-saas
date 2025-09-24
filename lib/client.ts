import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export function createClient() {
  console.log("🔧 Debug: Creating client with URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("🔧 Debug: Creating client with key:", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ? "KEY_PRESENT" : "KEY_MISSING");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY) {
    console.error("❌ Missing Supabase environment variables!");
    throw new Error("Missing Supabase environment variables");
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  )
}
