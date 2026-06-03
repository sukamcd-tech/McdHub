import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_MOBILE_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_MOBILE_SUPABASE_ANON_KEY!

export async function GET() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    const { count, error } = await supabase
      .from('mcdwallet_download_stats')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({ count: null })
    }

    return NextResponse.json({ count: count ?? 0 })
  } catch {
    return NextResponse.json({ count: null })
  }
}
