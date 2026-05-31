'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Lock, Mail, ShieldAlert, ArrowLeft, Cpu, Loader2, Fingerprint } from 'lucide-react'

export default function GatewayPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Cryptographic authentication failed. Access denied.')
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden select-none bg-[var(--bg-root)]">
      {/* ── High-Tech Cyber Grid Background ── */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,212,216,0.02)_0%,transparent_75%)] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--silver-400) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* ── Visual Ambient Glows ── */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[var(--silver-glow)] blur-[100px] pointer-events-none opacity-50" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-950/10 blur-[100px] pointer-events-none opacity-40 animate-pulse" />

      <div className="w-full max-w-[420px] z-10 space-y-8 animate-in fade-in zoom-in-95 duration-700">
        
        {/* ── Gateway restricted header ── */}
        <div className="text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/10 border border-red-800/15 shadow-[0_0_15px_rgba(239,68,68,0.05)] mb-4 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-red-400 font-mono">Restricted Access Portal</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-soft)] mb-5 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            <Fingerprint className="w-9 h-9 text-[var(--silver-300)]" />
          </div>

          <h1 className="text-3xl font-black tracking-tight uppercase text-[var(--silver-100)] flex items-center gap-2">
            Gateway <span className="text-[11px] font-mono text-[var(--silver-600)] lowercase font-medium">v3.0</span>
          </h1>
          <p className="text-[9px] uppercase tracking-wider text-[var(--silver-500)] font-mono mt-1.5 leading-relaxed">
            Enter administrative decryption keys
          </p>
        </div>

        {/* ── Main Decryption Form ── */}
        <div className="panel-silver rounded-2xl overflow-hidden relative">
          {/* Top premium indicator line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--silver-300)] to-transparent opacity-40" />

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            
            {/* Username / Email field */}
            <div className="space-y-2">
              <label className="block text-[9px] font-black uppercase tracking-widest text-[var(--silver-500)] font-mono ml-1">
                Access Identifier (Email)
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-[var(--silver-600)] pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-4 pl-11 text-xs rounded-xl bg-black/40 border border-[var(--border-soft)] text-[var(--silver-200)] focus:border-[var(--border-silver)] focus:outline-none transition-all duration-300 placeholder-[var(--silver-700)] font-mono font-bold"
                  placeholder="admin@gmail.com"
                />
              </div>
            </div>

            {/* Decryption Password field */}
            <div className="space-y-2">
              <label className="block text-[9px] font-black uppercase tracking-widest text-[var(--silver-500)] font-mono ml-1">
                Decryption Key (Password)
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-[var(--silver-600)] pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-4 pl-11 text-xs rounded-xl bg-black/40 border border-[var(--border-soft)] text-[var(--silver-200)] focus:border-[var(--border-silver)] focus:outline-none transition-all duration-300 placeholder-[var(--silver-700)] font-mono tracking-[0.2em]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error logs output */}
            {error && (
              <div className="flex gap-3 p-3.5 rounded-xl border border-red-500/25 bg-red-950/5 animate-in zoom-in-95 duration-200 select-text">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed text-red-400 font-mono uppercase font-bold">
                  {error}
                </p>
              </div>
            )}

            {/* Authenticate Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-13 rounded-xl overflow-hidden relative group font-mono font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-2.5 transition-all duration-300 border ${
                loading
                  ? 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--silver-600)] cursor-not-allowed'
                  : 'bg-[var(--silver-200)] text-[#0f0f13] border-[var(--silver-300)] hover:bg-[var(--silver-100)] hover:shadow-[0_0_20px_var(--silver-glow)] active:scale-[0.98] cursor-pointer'
              }`}
            >
              {/* Laser sweep animation on hover */}
              {!loading && (
                <div 
                  className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
                  style={{ animation: 'scan-sweep 1.5s ease-in-out infinite' }}
                />
              )}

              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--silver-500)]" />
                  Verifying Signatures...
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5" />
                  Decrypt & Enter
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Retro Home Link ── */}
        <div className="text-center">
          <a 
            href="/" 
            className="inline-flex items-center gap-1.5 text-[9px] font-mono uppercase font-black text-[var(--silver-600)] hover:text-[var(--silver-300)] transition-colors duration-250 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Terminal
          </a>
        </div>
      </div>
    </div>
  )
}
