import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      db: { schema: 'public' },
      global: {
        headers: { 'x-application-name': 'SukaMCD' }
      }
    }
  )
}

// Caching instansi mobile agar hanya dibuat satu kali saja (Singleton Pattern)
let cachedMobileClient: SupabaseClient | null = null

export function createMobileClient(): SupabaseClient {
  if (!cachedMobileClient) {
    cachedMobileClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_MOBILE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_MOBILE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )
  }
  return cachedMobileClient!
}
