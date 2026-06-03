import { createClient } from '@supabase/supabase-js'
import McdWalletClient from './McdWalletClient'

export const revalidate = 0

export default async function McdWalletPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_MOBILE_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_MOBILE_SUPABASE_ANON_KEY!
  )

  // Fetch all releases for McdWallet (ordered by created_at descending)
  const { data: releases } = await supabase
    .from('app_releases')
    .select('*')
    .eq('app_name', 'McdWallet')
    .order('created_at', { ascending: false })

  return (
    <McdWalletClient releases={releases ?? []} />
  )
}
