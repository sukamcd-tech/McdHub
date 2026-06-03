'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Smartphone, Shield, CheckCircle2,
  AlertTriangle, ChevronDown, ChevronUp, ExternalLink,
  FileDown, Cpu, HardDrive, Wifi, Star, Zap, Package
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Fallback values if database is empty
const DEFAULT_VERSION = '2.5.0'
const DEFAULT_RELEASE_DATE = '03 Jun 2026'
const DEFAULT_APK_SIZE = '~32 MB'

const DEFAULT_RELEASE_NOTES = [
  { type: 'new', text: 'Homescreen widget realtime — pengeluaran hari ini langsung dari Supabase tanpa buka app' },
  { type: 'new', text: 'Light theme konsisten di splash screen, widget, dan seluruh UI' },
  { type: 'fix', text: 'Splash screen tidak lagi hitam di HP dengan dark mode aktif' },
  { type: 'fix', text: 'Widget dot icon dihapus untuk tampilan lebih bersih' },
  { type: 'improve', text: 'Widget update periodik setiap 30 menit (sebelumnya 24 jam)' },
]

const REQUIREMENTS = [
  { icon: Smartphone, label: 'Android', value: '7.0+ (API 24)' },
  { icon: HardDrive, label: 'Storage', value: '≥ 60 MB' },
  { icon: Cpu, label: 'RAM', value: '≥ 2 GB' },
  { icon: Wifi, label: 'Koneksi', value: 'Internet diperlukan' },
]

const INSTALL_STEPS = [
  {
    step: '01',
    title: 'Izinkan sumber tidak dikenal',
    desc: 'Buka Pengaturan → Keamanan → aktifkan "Install aplikasi tidak dikenal" untuk browser atau file manager yang kamu gunakan.',
  },
  {
    step: '02',
    title: 'Unduh file APK',
    desc: 'Tap tombol Download APK di atas. File akan tersimpan ke folder Downloads perangkatmu.',
  },
  {
    step: '03',
    title: 'Buka dan instal',
    desc: 'Buka file APK dari notifikasi unduhan atau folder Downloads, lalu tap Instal dan ikuti petunjuk.',
  },
  {
    step: '04',
    title: 'Buat akun & mulai',
    desc: 'Buka McdWallet, daftar akun baru, lalu buat PIN keamanan untuk melindungi data keuanganmu.',
  },
]

type DownloadState = 'idle' | 'loading' | 'error' | 'unavailable'

interface ReleaseData {
  version: string;
  release_date: string;
  size_label: string;
  changelog: Array<{ type: string; text: string }>;
}

interface DownloadClientProps {
  initialRelease: ReleaseData | null;
  initialDownloadCount: number | null;
}

function formatDate(dateString: string) {
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const day = String(d.getDate()).padStart(2, '0')
    const month = months[d.getMonth()]
    const year = d.getFullYear()
    return `${day} ${month} ${year}`
  } catch {
    return dateString
  }
}

export default function DownloadClient({ initialRelease, initialDownloadCount }: DownloadClientProps) {
  const [downloadState, setDownloadState] = useState<DownloadState>(
    initialRelease ? 'idle' : 'unavailable'
  )
  const [openStep, setOpenStep] = useState<string | null>(null)
  const [downloadCount, setDownloadCount] = useState<number | null>(initialDownloadCount)
  const [isChangelogExpanded, setIsChangelogExpanded] = useState(false)

  // Use release data or placeholders if empty
  const hasRelease = !!initialRelease
  const version = initialRelease?.version || '-'
  const releaseDate = initialRelease?.release_date ? formatDate(initialRelease.release_date) : '-'
  const apkSize = initialRelease?.size_label || '-'
  const releaseNotes = (initialRelease?.changelog && initialRelease.changelog.length > 0) 
    ? initialRelease.changelog 
    : hasRelease
      ? DEFAULT_RELEASE_NOTES
      : [{ type: 'new', text: 'Belum ada catatan rilis. Silakan periksa kembali nanti setelah admin mempublikasikan versi baru.' }]

  // Reconstruct markdown from array notes
  const markdownContent = releaseNotes.map(note => {
    if (/^\s*[#*\->1-9]/.test(note.text)) {
      return note.text
    }
    const prefix = note.type === 'new' ? '**[Baru]**' : note.type === 'fix' ? '**[Perbaikan]**' : '**[Peningkatan]**'
    return `- ${prefix} ${note.text}`
  }).join('\n')

  useEffect(() => {
    // Refresh count client-side occasionally or if not set
    if (downloadCount === null) {
      fetch('/api/mcdwallet/download-count')
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data && typeof data.count === 'number') setDownloadCount(data.count) })
        .catch(() => {})
    }
  }, [downloadCount])

  const handleDownload = async () => {
    setDownloadState('loading')
    try {
      const res = await fetch('/api/mcdwallet/download')
      if (res.ok) {
        const { url } = await res.json()
        if (url) {
          const a = document.createElement('a')
          a.href = url
          a.download = `McdWallet-v${version}.apk`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          setDownloadState('idle')
          // Increment locally
          setDownloadCount(prev => (prev !== null ? prev + 1 : 1))
        } else {
          setDownloadState('unavailable')
        }
      } else if (res.status === 503) {
        setDownloadState('unavailable')
      } else {
        setDownloadState('error')
      }
    } catch {
      setDownloadState('error')
    }
  }

  const typeColors: Record<string, string> = {
    new: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    fix: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    improve: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  }
  const typeLabel: Record<string, string> = { new: 'Baru', fix: 'Perbaikan', improve: 'Peningkatan' }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-root)] text-[var(--silver-100)] overflow-x-hidden">
      {/* Dot Grid */}
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none z-0"
        style={{ backgroundImage: `radial-gradient(var(--silver-500) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
      />

      {/* Subtle gradient top */}
      <div className="fixed top-0 left-0 right-0 h-64 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,212,216,0.04) 0%, transparent 100%)' }} />

      {/* ── Header ── */}
      <header className="w-full max-w-5xl mx-auto px-6 lg:px-10 pt-7 pb-0 flex justify-between items-center z-10 shrink-0 relative">
        <Link href="/projects/mcdwallet" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center shadow-lg group-hover:border-[var(--border-silver)] transition-all">
            <ArrowLeft className="w-3 h-3 text-[var(--silver-500)] group-hover:text-[var(--silver-200)] transition-colors" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.25em] font-mono text-[var(--silver-200)] group-hover:text-white transition-colors">
            McdWallet
          </span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-soft)]">
          <span className={`w-1.5 h-1.5 rounded-full ${hasRelease ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-[8px] font-mono uppercase tracking-widest text-[var(--silver-400)]">
            {hasRelease ? `v${version} · Tersedia` : 'Belum Tersedia'}
          </span>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="w-full max-w-5xl mx-auto px-6 lg:px-10 z-10 flex flex-col gap-16 pb-24 mt-14 relative">

        {/* ── Hero / Download Card ── */}
        <section className="flex flex-col lg:flex-row gap-8 items-start animate-in fade-in slide-in-from-top-4 duration-700">

          {/* Left: Info */}
          <div className="flex-1 flex flex-col gap-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-soft)] w-fit">
              <Package className="w-3 h-3 text-[var(--silver-400)]" />
              <span className="text-[8.5px] font-black uppercase tracking-[0.2em] text-[var(--silver-400)] font-mono">Android APK</span>
            </div>

            <div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight pb-1"
                style={{ background: 'linear-gradient(135deg, #f4f4f6, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Download<br />McdWallet
              </h1>
              <p className="text-[13px] text-[var(--silver-500)] leading-relaxed mt-3 max-w-md font-light">
                Aplikasi manajemen keuangan pribadi bertenaga AI. Catat transaksi, pantau anggaran, analisis arus kas — dari satu genggaman.
              </p>
            </div>

            <div className="flex gap-6 pt-1 border-t border-[var(--border-subtle)]">
              {[
                { label: 'Versi', value: `v${version}` },
                { label: 'Rilis', value: releaseDate },
                { label: 'Ukuran', value: apkSize },
                ...(downloadCount !== null ? [{ label: 'Unduhan', value: `${downloadCount.toLocaleString('id-ID')}×` }] : []),
              ].map(s => (
                <div key={s.label}>
                  <p className="text-[8px] font-mono uppercase tracking-widest text-[var(--silver-600)] mb-1">{s.label}</p>
                  <p className="text-sm font-bold text-[var(--silver-200)]">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Download Box */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-surface)] p-6 flex flex-col gap-5"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.5)' }}>

              {/* App icon mock */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-soft)] flex items-center justify-center shrink-0"
                  style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                  <Zap className="w-6 h-6 text-[var(--silver-300)]" />
                </div>
                <div>
                  <p className="text-sm font-black text-[var(--silver-100)]">McdWallet</p>
                  <p className="text-[10px] text-[var(--silver-500)] font-mono">com.sukamcd.wallet</p>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={downloadState === 'loading' || downloadState === 'unavailable'}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 disabled:cursor-not-allowed"
                style={
                  downloadState === 'unavailable'
                    ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'var(--silver-600)' }
                    : downloadState === 'loading'
                      ? { background: 'var(--silver-400)', color: '#0f0f13' }
                      : { background: 'var(--silver-200)', color: '#0f0f13', boxShadow: '0 0 20px rgba(212,212,216,0.12)' }
                }
              >
                {downloadState === 'loading' ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Menyiapkan...
                  </>
                ) : downloadState === 'unavailable' ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Belum Tersedia
                  </>
                ) : (
                  <>
                    <FileDown className="w-3.5 h-3.5" />
                    Download APK
                  </>
                )}
              </button>

              {downloadState === 'error' && (
                <p className="text-[10px] text-red-400 text-center font-mono animate-in fade-in duration-300">
                  Gagal menghubungi server. Coba lagi.
                </p>
              )}

              {downloadState === 'unavailable' && (
                <p className="text-[10px] text-[var(--silver-600)] text-center font-mono animate-in fade-in duration-300">
                  APK sedang dipersiapkan. Cek kembali nanti.
                </p>
              )}

              {/* Requirements */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--border-subtle)]">
                {REQUIREMENTS.map(req => {
                  const Icon = req.icon
                  return (
                    <div key={req.label} className="flex items-center gap-2">
                      <Icon className="w-3 h-3 text-[var(--silver-600)] shrink-0" />
                      <div>
                        <p className="text-[8px] text-[var(--silver-600)] font-mono uppercase tracking-wider">{req.label}</p>
                        <p className="text-[10px] font-bold text-[var(--silver-400)]">{req.value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-400/5 border border-amber-400/15">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-300/70 leading-relaxed font-light">
                  Izinkan instalasi dari sumber tidak dikenal di pengaturan perangkatmu sebelum menginstal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── What's New ── */}
        <section className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-[var(--silver-600)] mb-2">— Versi {version}</p>
            <h2 className="text-2xl font-black tracking-tight text-[var(--silver-100)]">Yang baru di rilis ini.</h2>
          </div>

          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-surface)] overflow-hidden transition-all duration-300">
            {/* Header row */}
            <button 
              onClick={() => setIsChangelogExpanded(!isChangelogExpanded)}
              className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-[var(--bg-elevated)]/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-soft)] flex items-center justify-center">
                  <Package className="w-4 h-4 text-[var(--silver-400)]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--silver-200)] group-hover:text-white transition-colors">
                    {isChangelogExpanded ? 'Tutup Catatan Rilis' : 'Lihat Catatan Rilis Lengkap'}
                  </p>
                  <p className="text-[10px] text-[var(--silver-600)] font-mono">
                    {releaseNotes.length} pembaruan terdeteksi
                  </p>
                </div>
              </div>
              {isChangelogExpanded ? (
                <ChevronUp className="w-4 h-4 text-[var(--silver-500)]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[var(--silver-500)]" />
              )}
            </button>

            {/* Body content */}
            <div className={`accordion-transition ${isChangelogExpanded ? 'expanded' : ''}`}>
              <div className="accordion-inner border-t border-[var(--border-subtle)]">
                <div className="px-6 pb-6 pt-5 markdown-content text-sm leading-relaxed text-[var(--silver-400)] space-y-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdownContent}
                  </ReactMarkdown>
                </div>
                <style>{`
                  .accordion-transition {
                    display: grid;
                    grid-template-rows: 0fr;
                    opacity: 0;
                    transition: grid-template-rows 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease;
                  }
                  .accordion-transition.expanded {
                    grid-template-rows: 1fr;
                    opacity: 1;
                  }
                  .accordion-inner {
                    overflow: hidden;
                    min-height: 0;
                  }
                  .markdown-content h1, .markdown-content h2, .markdown-content h3 {
                    font-family: var(--font-mono, monospace);
                    text-transform: uppercase;
                    letter-spacing: -0.025em;
                  }
                  .markdown-content h1 { font-size: 1.3em; margin: 1.2em 0 0.6em; color: var(--silver-100); font-weight: 900; }
                  .markdown-content h2 { font-size: 1.15em; margin: 1.2em 0 0.6em; color: var(--silver-100); font-weight: 900; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.3em; }
                  .markdown-content h3 { font-size: 1.0em; margin: 1.0em 0 0.5em; color: var(--silver-200); font-weight: 850; }
                  .markdown-content ul { list-style-type: disc; padding-left: 1.4em; margin: 0.5em 0 0.8em; }
                  .markdown-content li { margin-bottom: 0.3em; color: var(--silver-400); line-height: 1.6; }
                  .markdown-content li ul { list-style-type: circle; margin: 0.3em 0 0.3em 1.2em; }
                  .markdown-content strong { color: var(--silver-200); font-weight: 700; }
                  .markdown-content hr { border-color: var(--border-subtle); margin: 1.5em 0; }
                  .markdown-content p { margin-bottom: 0.8em; color: var(--silver-300); }
                `}</style>
              </div>
            </div>
          </div>
        </section>

        {/* ── Install Guide ── */}
        <section className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-[var(--silver-600)] mb-2">— Panduan</p>
            <h2 className="text-2xl font-black tracking-tight text-[var(--silver-100)]">Cara install.</h2>
          </div>

          <div className="flex flex-col divide-y divide-[var(--border-subtle)]">
            {INSTALL_STEPS.map((item) => (
              <div key={item.step} className="py-4">
                <button
                  className="w-full flex items-center justify-between gap-4 text-left cursor-pointer group"
                  onClick={() => setOpenStep(openStep === item.step ? null : item.step)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black font-mono text-[var(--silver-700)] shrink-0 w-5">{item.step}</span>
                    <p className="text-sm font-bold text-[var(--silver-200)] group-hover:text-white transition-colors">{item.title}</p>
                  </div>
                  {openStep === item.step
                    ? <ChevronUp className="w-3.5 h-3.5 text-[var(--silver-500)] shrink-0" />
                    : <ChevronDown className="w-3.5 h-3.5 text-[var(--silver-600)] shrink-0" />
                  }
                </button>
                <div className={`accordion-transition ${openStep === item.step ? 'expanded' : ''}`}>
                  <div className="accordion-inner">
                    <p className="text-[12px] text-[var(--silver-500)] leading-relaxed mt-3 pl-9 font-light pb-2">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Trust & Safety ── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-700 delay-200">
          {[
            { icon: Shield, title: 'Data Aman', desc: 'Semua data keuangan dienkripsi dan disimpan di Supabase. Tidak ada pihak ketiga yang mengakses data pribadimu.' },
            { icon: CheckCircle2, title: 'Open Build', desc: 'APK dibangun langsung dari source code Flutter di repositori SukaMCD/McdWallet di GitHub.' },
            { icon: ExternalLink, title: 'Sumber Terbuka', desc: 'Kode sumber tersedia publik di GitHub. Kamu bisa audit, fork, atau berkontribusi sesuai keinginan.' },
          ].map(item => {
            const Icon = item.icon
            return (
              <div key={item.title} className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-soft)] transition-all">
                <div className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-soft)] flex items-center justify-center mb-4">
                  <Icon className="w-3.5 h-3.5 text-[var(--silver-400)]" />
                </div>
                <p className="text-sm font-bold text-[var(--silver-100)] mb-2">{item.title}</p>
                <p className="text-[11px] text-[var(--silver-500)] leading-relaxed font-light">{item.desc}</p>
              </div>
            )
          })}
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="w-full max-w-5xl mx-auto px-6 lg:px-10 border-t border-[var(--border-subtle)] pt-6 flex justify-between items-end z-10 shrink-0 select-none pb-8 relative">
        <div className="space-y-2.5">
          <div className="text-[9px] font-black uppercase tracking-wider text-[var(--silver-600)] font-mono">
            &copy; {new Date().getFullYear()} SukaMCD. All rights reserved.
          </div>
          <div className="flex gap-5">
            <Link href="/projects/mcdwallet" className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-white transition-colors">← Kembali</Link>
            <a href="https://github.com/SukaMCD/McdWallet" className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
        <Link href="/" className="text-[9.5px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-[var(--silver-100)] transition-colors border-b border-[var(--border-subtle)] pb-0.5">
          ← Back home
        </Link>
      </footer>
    </div>
  )
}
