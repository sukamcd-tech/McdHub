import { createClient } from '@supabase/supabase-js'
import DownloadClient from './DownloadClient'

export const revalidate = 0

export default async function McdWalletDownloadPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_MOBILE_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_MOBILE_SUPABASE_ANON_KEY!
  )

  // 1. Fetch latest release metadata (berdasarkan created_at terbaru)
  const { data: release } = await supabase
    .from('app_releases')
    .select('*')
    .eq('app_name', 'McdWallet')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 2. Fetch exact download count
  const { count } = await supabase
    .from('mcdwallet_download_stats')
    .select('*', { count: 'exact', head: true })

  return (
    <DownloadClient 
      initialRelease={release} 
      initialDownloadCount={count ?? 0} 
    />
  )
}
