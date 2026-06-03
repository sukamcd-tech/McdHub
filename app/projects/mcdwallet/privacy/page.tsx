import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, Trash2, Mail, ExternalLink } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy - McdWallet',
  description: 'Kebijakan Privasi aplikasi McdWallet. Pelajari bagaimana kami mengumpulkan, menggunakan, dan melindungi data keuangan Anda.',
}

export default function McdWalletPrivacyPage() {
  const lastUpdated = '03 Juni 2026'

  const SECTIONS = [
    {
      icon: Shield,
      title: '1. Informasi yang Kami Kumpulkan',
      content: [
        '**Data Akun**: Ketika Anda mendaftar atau masuk ke McdWallet, kami mengumpulkan alamat email dan nama profil Anda untuk keperluan autentikasi dan sinkronisasi data cloud.',
        '**Data Keuangan**: Semua data keuangan yang Anda masukkan — termasuk transaksi (nominal, tanggal, deskripsi, kategori), dompet, dan anggaran — disimpan secara aman di cloud database Supabase yang terhubung dengan akun Anda.',
        '**Data OCR & Kamera**: Gambar struk yang dipindai menggunakan fitur kamera diproses secara lokal di perangkat Anda (melalui Google ML Kit) atau dikirim secara terenkripsi ke API Groq jika memilih analisis AI. Gambar tersebut tidak disimpan permanen di server kami.',
        '**Data Biometrik & Keamanan lokal**: Data PIN dan biometrik (sidik jari/Face ID) yang Anda gunakan untuk mengunci aplikasi dikelola sepenuhnya oleh sistem operasi perangkat Anda. Kami tidak pernah mengakses, mengumpulkan, atau menyimpan data biometrik Anda.',
      ]
    },
    {
      icon: Lock,
      title: '2. Cara Kami Menggunakan Data Anda',
      content: [
        'Menyediakan fitur inti aplikasi McdWallet seperti pencatatan cashflow, multi-wallet, monitoring budget, analitik keuangan, dan ekspor laporan.',
        'Menjalankan fitur asisten AI (McdAI Financial Advisor & Auto-Kategorisasi). Transaksi Anda dikirimkan ke model LLaMA (melalui Groq API) dalam bentuk teks terenkripsi untuk mendapatkan saran taktis finansial. Data ini tidak digunakan oleh penyedia model AI untuk melatih model mereka.',
        'Mengirimkan push notification reaktif menggunakan Firebase FCM mengenai pembaruan aplikasi dan pengingat batas anggaran yang telah Anda tetapkan.',
      ]
    },
    {
      icon: Eye,
      title: '3. Perlindungan & Keamanan Data',
      content: [
        'Kami berkomitmen untuk menjaga keamanan data keuangan Anda. Seluruh komunikasi data antara aplikasi mobile McdWallet dan database backend menggunakan enkripsi protokol HTTPS aman (SSL/TLS).',
        'Akses database Supabase diatur dengan kebijakan tingkat baris (Row Level Security / RLS), memastikan data transaksi Anda hanya dapat dibaca dan dimodifikasi oleh akun Anda sendiri yang terautentikasi.',
      ]
    },
    {
      icon: Trash2,
      title: '4. Hak Pengguna & Penghapusan Data',
      content: [
        '**Ekspor Data**: Anda dapat mengekspor seluruh riwayat transaksi Anda kapan saja ke dalam format file CSV dari menu pengaturan aplikasi.',
        '**Penghapusan Akun**: Anda berhak untuk menghapus akun dan seluruh data keuangan Anda secara permanen. Fitur ini dapat diakses langsung di dalam aplikasi (Pengaturan → Hapus Akun). Seketika Anda melakukan penghapusan akun, semua riwayat transaksi, dompet, dan data profil Anda akan terhapus dari database kami tanpa ada salinan cadangan.',
      ]
    },
    {
      icon: Mail,
      title: '5. Hubungi Kami',
      content: [
        'Jika Anda memiliki pertanyaan, saran, atau kendala seputar Kebijakan Privasi McdWallet ini, silakan hubungi kami melalui salah satu saluran berikut:',
        '- Email: **dev@sukamcd.tech**',
        '- GitHub Issues: [sukamcd-tech/McdWallet](https://github.com/sukamcd-tech/McdWallet)',
        '- Instagram: [@sukamcd.dev](https://www.instagram.com/sukamcd.dev/)',
      ]
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-root)] text-[var(--silver-100)] selection:bg-white selection:text-black overflow-x-hidden">
      {/* Dot Grid Background */}
      <div 
        className="fixed inset-0 opacity-[0.018] pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(var(--silver-500) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Subtle gradient top */}
      <div className="fixed top-0 left-0 right-0 h-64 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,212,216,0.04) 0%, transparent 100%)' }} />

      {/* ── Header ── */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 pt-7 pb-0 flex justify-between items-center z-10 shrink-0 relative">
        <Link href="/projects/mcdwallet" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center shadow-lg group-hover:border-[var(--border-silver)] transition-all">
            <ArrowLeft className="w-3 h-3 text-[var(--silver-500)] group-hover:text-[var(--silver-200)] transition-colors" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.25em] font-mono text-[var(--silver-200)] group-hover:text-white transition-colors">
            McdWallet
          </span>
        </Link>
        
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-soft)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[8px] font-mono uppercase tracking-widest text-[var(--silver-400)]">
            Privacy Policy
          </span>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-8 lg:px-12 z-10 flex flex-col gap-12 pb-24 mt-16 relative">
        
        {/* Title */}
        <section className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-soft)] w-fit">
            <span className="text-[8.5px] font-black uppercase tracking-[0.2em] text-[var(--silver-400)] font-mono">
              Terakhir Diperbarui: {lastUpdated}
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tight leading-tight text-gradient bg-gradient-to-b from-[var(--silver-100)] via-[var(--silver-200)] to-[var(--silver-500)] bg-clip-text text-transparent">
            Kebijakan Privasi McdWallet.
          </h1>
          
          <p className="text-[13px] text-[var(--silver-500)] leading-relaxed font-light mt-1">
            Di McdWallet, privasi dan keamanan data finansial Anda adalah prioritas utama kami. Kebijakan Privasi ini menjelaskan bagaimana aplikasi kami mengelola data Anda untuk memberikan fitur asisten keuangan bertenaga AI yang disiplin, aman, dan transparan.
          </p>
        </section>

        {/* Policy Body */}
        <section className="flex flex-col gap-8 animate-in fade-in duration-700 delay-100">
          {SECTIONS.map((section, idx) => {
            const Icon = section.icon
            return (
              <div 
                key={idx} 
                className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col gap-4"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-soft)] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[var(--silver-400)]" />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-[var(--silver-200)] font-mono">
                    {section.title}
                  </h2>
                </div>

                <div className="flex flex-col gap-3 pl-11 text-xs text-[var(--silver-500)] leading-relaxed font-light">
                  {section.content.map((paragraph, pIdx) => {
                    // Simple inline formatting for Bold and Links
                    let renderedText = paragraph
                    
                    // Replace markdown links
                    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
                    const linkMatches = [...renderedText.matchAll(linkRegex)]
                    
                    if (linkMatches.length > 0) {
                      return (
                        <p key={pIdx}>
                          {renderedText.split(linkRegex).map((part, partIdx, arr) => {
                            if (partIdx % 3 === 1) {
                              const label = part
                              const url = arr[partIdx + 1]
                              return (
                                <a key={partIdx} href={url} target="_blank" rel="noopener noreferrer" className="text-[var(--silver-300)] underline hover:text-white inline-flex items-center gap-0.5 font-normal">
                                  {label} <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )
                            }
                            if (partIdx % 3 === 2) return null // handled by link rendering
                            
                            // Bold formatting within plain text parts
                            return (
                              <span key={partIdx}>
                                {part.split('**').map((subpart, subIdx) => {
                                  if (subIdx % 2 === 1) {
                                    return <strong key={subIdx} className="font-bold text-[var(--silver-300)]">{subpart}</strong>
                                  }
                                  return subpart
                                })}
                              </span>
                            )
                          })}
                        </p>
                      )
                    }

                    return (
                      <p key={pIdx}>
                        {paragraph.split('**').map((part, partIdx) => {
                          if (partIdx % 2 === 1) {
                            return <strong key={partIdx} className="font-bold text-[var(--silver-300)]">{part}</strong>
                          }
                          return part
                        })}
                      </p>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 border-t border-[var(--border-subtle)] pt-6 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 z-10 shrink-0 select-none pb-6 text-center sm:text-left">
        <div className="space-y-2.5">
          <div className="text-[9px] font-black uppercase tracking-wider text-[var(--silver-600)] font-mono">
            &copy; {new Date().getFullYear()} SukaMCD. All rights reserved.
          </div>
          <div className="flex gap-5 justify-center sm:justify-start">
            <Link href="/projects/mcdwallet" className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-white transition-colors">← Kembali</Link>
            <a href="https://github.com/sukamcd-tech/McdWallet" className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
        
        <Link 
          href="/" 
          className="text-[9.5px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-[var(--silver-100)] transition-colors border-b border-[var(--border-subtle)] pb-0.5 shrink-0"
        >
          ← Back home
        </Link>
      </footer>
    </div>
  )
}
