import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_MOBILE_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_MOBILE_SUPABASE_ANON_KEY!

// Konfigurasi APK default
const APK_BUCKET = process.env.APK_BUCKET_NAME ?? 'releases'
const APK_PATH = process.env.APK_FILE_PATH ?? 'mcdwallet/McdWallet-latest.apk'

// Signed URL berlaku selama 60 detik (cukup untuk mulai download)
const SIGNED_URL_TTL = 60

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const appName = searchParams.get('app') || 'McdWallet'

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    let apkBucket = APK_BUCKET
    let apkPath = APK_PATH

    // Fetch latest release dari table (berdasarkan created_at terbaru)
    const { data: release, error: dbError } = await supabase
      .from('app_releases')
      .select('apk_path')
      .eq('app_name', appName)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!dbError && release?.apk_path) {
      apkPath = release.apk_path
      apkBucket = 'releases'
    } else {
      // Jika tidak ada rilis aktif di database, response 503 (Belum Tersedia)
      return NextResponse.json(
        { error: 'APK not available', message: 'No active release found in database.' },
        { status: 503 }
      )
    }

    const { data, error } = await supabase
      .storage
      .from(apkBucket)
      .createSignedUrl(apkPath, SIGNED_URL_TTL)

    if (error || !data?.signedUrl) {
      // APK belum diupload atau bucket belum ada
      return NextResponse.json(
        { error: 'APK not available', message: error?.message },
        { status: 503 }
      )
    }

    // Increment download counter di database (opsional, fire-and-forget)
    supabase
      .from('mcdwallet_download_stats')
      .insert({ downloaded_at: new Date().toISOString() })
      .then(() => {}, (err) => console.error('[mcdwallet/download] Stat insert failed:', err))

    return NextResponse.json({ url: data.signedUrl })

  } catch (err) {
    console.error('[mcdwallet/download] Error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
