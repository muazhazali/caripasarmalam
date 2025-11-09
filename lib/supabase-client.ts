/**
 * Supabase client for Client Components (Browser)
 * This file has NO server-only imports and can be safely imported in client components
 */

import { createBrowserClient } from "@supabase/ssr";

/**
 * Create a Supabase client for browser usage (Client Components)
 * Uses @supabase/ssr for cookie-based session management
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
