'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Download, Wallet, Brain, Camera, 
  BarChart3, Shield, FileText, TrendingUp, ArrowUpRight,
  Smartphone, Zap, Globe, Bell, ChevronDown, ChevronUp,
  Layers, Lock
} from 'lucide-react'

function Github({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}


const FEATURES = [
  {
    icon: Wallet,
    title: 'Manajemen Multi-Dompet',
    description: 'Kelola berbagai dompet (BNI, GoPay, Tunai) dalam satu tampilan. Kalkulasi saldo awal dan saldo akhir historis secara otomatis.',
  },
  {
    icon: BarChart3,
    title: 'Dasbor Analitik Interaktif',
    description: 'Grafik cashflow ganda melengkung dan pie chart distribusi pengeluaran per kategori menggunakan fl_chart. Filter per 7 hari, bulan berjalan, atau semua data.',
  },
  {
    icon: Bell,
    title: 'Pemantauan Anggaran Reaktif',
    description: 'Batas anggaran bulanan per kategori dengan progress bar yang berubah warna (Hijau → Kuning → Merah). Notifikasi lokal instan saat pengeluaran melampaui batas.',
  },
  {
    icon: Brain,
    title: 'AI Auto-Kategorisasi',
    description: 'Klasifikasi kategori transaksi otomatis via Groq API (LLaMA 3.3 70B) dengan fallback lokal berbasis regex. Debouncer 800ms mencegah spam API saat mengetik.',
  },
  {
    icon: Camera,
    title: 'OCR Receipt Scanner',
    description: 'Pemindai struk hibrida: Groq LLaMA (~100ms) → Google ML Kit offline. Filter noise status bar & koreksi angka ribuan terpotong secara presisi.',
  },
  {
    icon: Brain,
    title: 'McdAI Financial Advisor',
    description: 'Asisten keuangan bertenaga LLaMA 3.3 70B yang mengakses data real-time (saldo, anggaran, 15 transaksi terakhir) untuk rekomendasi finansial personal yang taktis.',
  },
  {
    icon: Globe,
    title: 'Pemantau Kurs Asing (Forex)',
    description: 'Dashboard kartu horizontal Wise/Revolut-style. API ExchangeRate tanpa key, cache lokal 1 jam, konverter valas cepat offline, cooldown refresh manual 5 menit.',
  },
  {
    icon: FileText,
    title: 'Ekspor Laporan CSV',
    description: 'Ekspor mutasi ke file CSV kompatibel Excel & Google Sheets, serta ringkasan teks indah siap berbagi ke WhatsApp langsung dari dalam aplikasi.',
  },
  {
    icon: Shield,
    title: 'Keamanan Berlapis',
    description: 'PIN wajib saat pertama kali dan setiap buka aplikasi, autentikasi biometrik (sidik jari & Face ID), auto-lock timeout 3 menit, dan privacy screen overlay.',
  },
]

const TECH_STACK = [
  { name: 'Flutter', desc: 'Cross-platform framework' },
  { name: 'Riverpod', desc: 'State management' },
  { name: 'Supabase', desc: 'Backend & realtime DB' },
  { name: 'Groq API', desc: 'LLaMA 3.3 70B inference' },
  { name: 'Google ML Kit', desc: 'On-device OCR' },
  { name: 'fl_chart', desc: 'Interactive charts' },
  { name: 'local_auth', desc: 'Biometric auth' },
  { name: 'Firebase FCM', desc: 'Push notifications' },
]

const CHANGELOG = [
  { version: '2.5.0', date: '27 Mei 2026', title: 'Global Haptic Feedback Toggle', desc: 'Sakelar getaran taktil global per pengguna, sinkronisasi Riverpod & SharedPreferences.' },
  { version: '2.4.0', date: '27 Mei 2026', title: 'Custom Budget Alert Threshold', desc: 'Pill selector multi-select (50%, 70%, 90%) untuk ambang batas notifikasi anggaran.' },
  { version: '2.3.0', date: '27 Mei 2026', title: 'McdAI Financial Advisor', desc: 'Asisten keuangan AI interaktif dengan akses data finansial real-time & FAQ taktis.' },
  { version: '1.0.0', date: '25 Mei 2026', title: 'Initial Release', desc: 'Rilis stabil pertama dengan CRUD transaksi, multi-wallet, anggaran, analitik, OCR, forex, PIN/biometrik.' },
]

export default function McdWalletPage() {
  const [openChangelog, setOpenChangelog] = useState<string | null>(null)

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-root)] text-[var(--silver-100)] selection:bg-white selection:text-black overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
      
      {/* Dot Grid Background */}
      <div 
        className="fixed inset-0 opacity-[0.018] pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(var(--silver-500) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* ── Header ── */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 pt-7 pb-0 flex justify-between items-center z-10 shrink-0 relative">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center shadow-lg group-hover:border-[var(--border-silver)] transition-all">
            <ArrowLeft className="w-3 h-3 text-[var(--silver-500)] group-hover:text-[var(--silver-200)] transition-colors" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.25em] font-mono text-[var(--silver-200)] group-hover:text-white transition-colors">
            SUKAMCD
          </span>
        </Link>
        
        <div className="h-px bg-gradient-to-r from-[var(--border-subtle)] via-[var(--border-soft)] to-transparent flex-grow mx-8 hidden sm:block" />
        
        <a
          href="https://github.com/SukaMCD/McdWallet"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] hover:border-[var(--border-silver)] text-[9px] font-mono tracking-[0.15em] text-[var(--silver-400)] hover:text-[var(--silver-100)] transition-all duration-200 cursor-pointer"
        >
          <Github className="w-3.5 h-3.5" />
          GitHub
        </a>
      </header>

      {/* ── Main ── */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 z-10 flex flex-col gap-20 pb-24 mt-16 relative">

        {/* ── Hero ── */}
        <section className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-soft)] shadow-md select-none w-fit">
            <Smartphone className="w-3.5 h-3.5 text-[var(--silver-400)]" />
            <span className="text-[8.5px] font-black uppercase tracking-[0.2em] text-[var(--silver-400)] font-mono">Flutter Application · v2.5.0</span>
          </div>

          <div className="flex flex-col gap-4 max-w-2xl">
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight pb-1 text-gradient bg-gradient-to-b from-[var(--silver-100)] via-[var(--silver-200)] to-[var(--silver-500)] bg-clip-text text-transparent">
              McdWallet.
            </h1>
            <p className="text-[13px] text-[var(--silver-500)] leading-relaxed font-light max-w-xl">
              Aplikasi manajemen keuangan pribadi berbasis mobile yang membantu mencatat transaksi, memantau anggaran, menganalisis arus kas, dan mengelola keuangan secara disiplin dan aman — ditenagai oleh AI.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/projects/mcdwallet/download"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--silver-200)] text-[#0f0f13] text-xs font-black uppercase tracking-widest hover:bg-[var(--silver-100)] transition-all hover:shadow-[0_0_20px_rgba(212,212,216,0.15)] active:scale-[0.99] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download APK
            </Link>
            <a
              href="https://github.com/SukaMCD/McdWallet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-xs font-black uppercase tracking-widest text-[var(--silver-400)] hover:text-[var(--silver-100)] hover:border-[var(--border-silver)] transition-all cursor-pointer"
            >
              <Github className="w-3.5 h-3.5" />
              View Source
            </a>
          </div>

          {/* Quick stats row */}
          <div className="flex flex-wrap gap-6 pt-4 border-t border-[var(--border-subtle)]">
            {[
              { label: 'Versi Saat Ini', value: '2.5.0' },
              { label: 'Platform', value: 'Android' },
              { label: 'Engine AI', value: 'LLaMA 3.3' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[8px] font-mono uppercase tracking-widest text-[var(--silver-600)] mb-1">{s.label}</p>
                <p className="text-sm font-bold text-[var(--silver-200)]">{s.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features Grid ── */}
        <section className="flex flex-col gap-8">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-[var(--silver-600)] mb-2">— Fitur Unggulan</p>
            <h2 className="text-2xl font-black tracking-tight text-[var(--silver-100)]">Apa yang bisa McdWallet lakukan.</h2>
          </div>

          <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 snap-x snap-mandatory pb-4 md:pb-0 no-scrollbar">
            {FEATURES.map((feat) => {
              const Icon = feat.icon
              return (
                <div
                  key={feat.title}
                  className="card p-5 rounded-2xl border border-[var(--border-subtle)] group w-[285px] shrink-0 snap-start md:w-auto md:shrink"
                >
                  <div className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-soft)] flex items-center justify-center mb-4 group-hover:border-[var(--border-silver)] transition-all">
                    <Icon className="w-3.5 h-3.5 text-[var(--silver-400)]" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--silver-100)] mb-2 tracking-tight">{feat.title}</h3>
                  <p className="text-[11.5px] text-[var(--silver-500)] leading-relaxed font-light">{feat.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Tech Stack ── */}
        <section className="flex flex-col gap-8">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-[var(--silver-600)] mb-2">— Teknologi</p>
            <h2 className="text-2xl font-black tracking-tight text-[var(--silver-100)]">Dibangun dengan stack terpilih.</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-soft)] transition-all"
              >
                <p className="text-xs font-bold text-[var(--silver-200)] mb-1">{tech.name}</p>
                <p className="text-[10px] text-[var(--silver-600)] font-mono">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Changelog ── */}
        <section className="flex flex-col gap-8">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-[var(--silver-600)] mb-2">— Riwayat Versi</p>
            <h2 className="text-2xl font-black tracking-tight text-[var(--silver-100)]">Changelog.</h2>
          </div>

          <div className="flex flex-col divide-y divide-[var(--border-subtle)]">
            {CHANGELOG.map((entry) => (
              <div key={entry.version} className="py-4">
                <button
                  className="w-full flex items-center justify-between gap-4 text-left cursor-pointer group"
                  onClick={() => setOpenChangelog(openChangelog === entry.version ? null : entry.version)}
                >
                  <div className="flex items-center gap-4">
                    <span className="px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-soft)] text-[8px] font-black font-mono uppercase tracking-widest text-[var(--silver-400)] shrink-0 group-hover:border-[var(--border-silver)] transition-all">
                      v{entry.version}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[var(--silver-200)] group-hover:text-white transition-colors">{entry.title}</p>
                      <p className="text-[9px] font-mono text-[var(--silver-600)] mt-0.5">{entry.date}</p>
                    </div>
                  </div>
                  {openChangelog === entry.version
                    ? <ChevronUp className="w-3.5 h-3.5 text-[var(--silver-500)] shrink-0" />
                    : <ChevronDown className="w-3.5 h-3.5 text-[var(--silver-600)] shrink-0" />
                  }
                </button>
                {openChangelog === entry.version && (
                  <p className="text-[12px] text-[var(--silver-500)] leading-relaxed mt-3 pl-16 font-light animate-in fade-in duration-300">
                    {entry.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 border-t border-[var(--border-subtle)] pt-6 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 z-10 shrink-0 select-none pb-6 text-center sm:text-left">
        <div className="space-y-2.5">
          <div className="text-[9px] font-black uppercase tracking-wider text-[var(--silver-600)] font-mono">
            &copy; {new Date().getFullYear()} SukaMCD. All rights reserved.
          </div>
          <div className="flex gap-5 justify-center sm:justify-start">
            <a href="https://github.com/SukaMCD" className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Github</a>
            <a href="https://www.instagram.com/sukamcd.dev/" className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.linkedin.com/in/fabianrizkypratama/" className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">LinkedIn</a>
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
