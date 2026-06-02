'use client'

import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, Mail, MapPin, Clock, Send, Loader2, CheckCircle, Lock, User } from 'lucide-react'
import Link from 'next/link'

import { createMobileClient } from '@/lib/supabase'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = useMemo(() => createMobileClient(), [])

  useEffect(() => {
    let isMounted = true

    async function initializeAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (isMounted) {
          setIsLoggedIn(!!session)
        }
      } catch (error) {
        console.error('Error loading session:', error)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setIsLoggedIn(!!session)
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createMobileClient()

      // Deteksi OS sederhana untuk info perangkat premium
      let os = 'Unknown'
      if (typeof window !== 'undefined' && window.navigator) {
        const ua = window.navigator.userAgent
        if (ua.indexOf('Windows') !== -1) os = 'Windows'
        else if (ua.indexOf('Mac') !== -1) os = 'macOS'
        else if (ua.indexOf('Linux') !== -1) os = 'Linux'
        else if (ua.indexOf('Android') !== -1) os = 'Android'
        else if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) os = 'iOS'
      }

      const formattedDescription = `[Contact Form Message]\nNama: ${name}\nSubjek: ${subject}\n\nPesan:\n${message}`

      const { error } = await supabase
        .from('feedbacks')
        .insert([
          {
            user_email: email,
            type: 'saran',
            priority: 'normal',
            description: formattedDescription,
            device_info: {
              os: os,
              model: 'Web Browser',
              os_version: 'Web'
            },
            app_version: '1.0.0',
            status: 'open',
            created_at: new Date().toISOString()
          }
        ])

      if (error) {
        throw error
      }

      setSubmitted(true)
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Gagal mengirim pesan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lg:h-screen lg:max-h-screen lg:overflow-hidden min-h-screen overflow-y-auto flex flex-col bg-[var(--bg-root)] text-[var(--silver-100)] select-none">

      {/* Subtle background texture */}
      <div
        className="fixed inset-0 opacity-[0.018] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--silver-500) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* ── Header ── */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 pt-7 pb-0 flex justify-between items-center relative z-50 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 group relative z-50">
          <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center shadow-lg group-hover:border-[var(--border-silver)] transition-all">
            <ArrowLeft className="w-3 h-3 text-[var(--silver-500)] group-hover:text-[var(--silver-200)] transition-colors" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.25em] font-mono text-[var(--silver-200)] group-hover:text-white transition-colors">
            SUKAMCD
          </span>
        </Link>
        
        <div className="h-px bg-gradient-to-r from-[var(--border-subtle)] via-[var(--border-soft)] to-transparent flex-grow mx-8 hidden sm:block" />

        {isLoggedIn ? (
          <Link 
            href="/profile" 
            className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] hover:border-[var(--border-silver)] text-[11px] font-mono tracking-[0.15em] text-[var(--silver-300)] hover:text-[var(--silver-100)] transition-all duration-200 flex items-center gap-1.5 cursor-pointer z-10"
          >
            <User className="w-3 h-3 text-[var(--silver-500)]" />
            Profile
          </Link>
        ) : (
          <Link 
            href="/gateway" 
            className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] hover:border-[var(--border-silver)] text-[11px] font-mono tracking-[0.15em] text-[var(--silver-300)] hover:text-[var(--silver-100)] transition-all duration-200 flex items-center gap-1.5 cursor-pointer z-10"
          >
            Sign-in
          </Link>
        )}
      </header>

      {/* ── Main ── */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 flex-1 flex flex-col justify-center z-10 gap-8 py-4">

        {/* Page title */}
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-[var(--silver-600)] mb-2.5">
            — Get in touch
          </p>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] text-[var(--silver-100)] mb-3">
            Let&apos;s work{' '}
            <span className="text-[var(--silver-500)]">together.</span>
          </h1>
          <p className="text-[12px] text-[var(--silver-500)] leading-relaxed max-w-sm font-light">
            Got a project in mind or just want to say hi? Fill in the form below.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

          {/* Left — Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="space-y-4">
              {[
                { icon: Mail, label: 'Email', value: 'dev@sukamcd.tech', href: 'mailto:dev@sukamcd.tech', isLink: true },
                { icon: MapPin, label: 'Based in', value: 'Indonesia', isLink: false },
                { icon: Clock, label: 'Timezone', value: 'GMT+7 · WIB', isLink: false },
              ].map(({ icon: Icon, label, value, href, isLink }) => (
                <div key={label} className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[var(--silver-500)]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)] mb-0.5">{label}</p>
                    {isLink && href ? (
                      <a href={href} className="text-xs font-medium text-[var(--silver-300)] hover:text-white transition-colors select-text">{value}</a>
                    ) : (
                      <p className="text-xs font-medium text-[var(--silver-300)]">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-4 space-y-2">
              <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)] mb-3">Elsewhere</p>
              {[
                { label: 'GitHub', href: 'https://github.com/SukaMCD' },
                { label: 'Instagram', href: 'https://www.instagram.com/sukamcd.dev/' },
                { label: 'LinkedIn', href: 'https://www.linkedin.com/in/fabianrizkypratama/' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--silver-500)] hover:text-[var(--silver-100)] transition-colors duration-200 flex items-center gap-1.5 group w-fit"
                >
                  <span className="w-1 h-1 rounded-full bg-[var(--silver-700)] group-hover:bg-[var(--silver-400)] transition-colors" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-3">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:outline-none focus:bg-[var(--bg-elevated)] transition-all duration-200 placeholder-[var(--silver-700)]"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:outline-none focus:bg-[var(--bg-elevated)] transition-all duration-200 placeholder-[var(--silver-700)]"
                      placeholder="you@sukamcd.tech"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:outline-none focus:bg-[var(--bg-elevated)] transition-all duration-200 placeholder-[var(--silver-700)]"
                    placeholder="What's this about?"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:outline-none focus:bg-[var(--bg-elevated)] transition-all duration-200 placeholder-[var(--silver-700)] resize-none leading-relaxed"
                    placeholder="Tell me about your project, idea, or anything on your mind..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                    loading
                      ? 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--silver-600)] cursor-not-allowed'
                      : 'bg-[var(--silver-200)] text-[#0f0f13] hover:bg-[var(--silver-100)] active:scale-[0.99] cursor-pointer shadow-lg hover:shadow-[0_0_24px_rgba(212,212,216,0.12)]'
                  }`}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send message</>
                  )}
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-4 animate-in fade-in duration-500">
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--silver-100)] mb-1.5">Message sent!</h2>
                  <p className="text-sm text-[var(--silver-500)] leading-relaxed max-w-xs">
                    Thanks, {name}. I&apos;ll get back to you at {email} soon.
                  </p>
                </div>
                <button
                  onClick={() => { setName(''); setEmail(''); setSubject(''); setMessage(''); setSubmitted(false) }}
                  className="text-[10px] font-mono uppercase tracking-widest text-[var(--silver-600)] hover:text-[var(--silver-300)] transition-colors border-b border-[var(--border-subtle)] pb-0.5"
                >
                  Send another
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 border-t border-[var(--border-subtle)] pt-6 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 z-10 shrink-0 select-none pb-6 text-center sm:text-left">
        <div className="space-y-2.5">
          <div className="text-[9px] font-black uppercase tracking-wider text-[var(--silver-600)] font-mono">
            &copy; {new Date().getFullYear()} SukaMCD. All rights reserved.
          </div>
          <div className="flex justify-center sm:justify-start gap-5">
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
