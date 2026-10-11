import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

const FALLBACK_SUPABASE_URL = 'https://snziwzqslbfkejfjphuy.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

  return createBrowserClient(
    url,
    key,
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
    const url = process.env.NEXT_PUBLIC_MOBILE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_MOBILE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

    cachedMobileClient = createSupabaseClient(
      url,
      key,
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
