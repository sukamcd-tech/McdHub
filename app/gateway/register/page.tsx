'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Lock, Mail, ShieldAlert, ArrowLeft, Loader2, User, CheckCircle, Eye, EyeOff, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()
  const isGoogleOAuthEnabled = process.env.NEXT_PUBLIC_SUPABASE_GOOGLE_OAUTH_ENABLED === 'true'

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    if (provider === 'google' && !isGoogleOAuthEnabled) {
      setError('Google sign-in is not enabled for this site.')
      return
    }

    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) {
      setError(error.message || 'OAuth sign in failed. Please try again.')
      setLoading(false)
    }
  }

  // Load and render Cloudflare Turnstile widget
  useEffect(() => {
    const loadedKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    // Define Turnstile render callback globally
    (window as any).onloadTurnstileCallback = () => {
      const container = document.getElementById('turnstile-container')

      if ((window as any).turnstile && container && loadedKey) {
        if (container.hasChildNodes()) {
          return
        }

        (window as any).turnstile.render(container, {
          sitekey: loadedKey,
          theme: 'dark',
          callback: (token: string) => {
            setTurnstileToken(token)
          },
          'expired-callback': () => {
            setTurnstileToken(null)
          },
          'error-callback': () => {
            setTurnstileToken(null)
            console.warn("Cloudflare Turnstile failed to load or verify.");
          }
        })
      } else if (!loadedKey) {
        setError('Turnstile site key is not configured.')
      }
    }

    const scriptId = 'cloudflare-turnstile-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement
    
    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    } else if ((window as any).turnstile) {
      // Script is already loaded, render widget immediately
      (window as any).onloadTurnstileCallback()
    }

    return () => {
      // Clean up callback, but keep script in DOM for caching
      delete (window as any).onloadTurnstileCallback
    }
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (!turnstileToken) {
      setError('Please complete the anti-bot verification.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        captchaToken: turnstileToken
      }
    })

    if (error) {
      setError(error.message || 'Failed to create account. Please try again.')
      setLoading(false)
      
      // Reset Turnstile on registration failure
      if ((window as any).turnstile) {
        (window as any).turnstile.reset('#turnstile-container')
      }
      setTurnstileToken(null)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full flex items-start justify-center py-10 px-6 relative overflow-x-hidden overflow-y-auto select-none bg-[var(--bg-root)]">
      {/* ── High-Tech Cyber Grid Background ── */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,212,216,0.02)_0%,transparent_75%)] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--silver-400) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* ── Visual Ambient Glows ── */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[var(--silver-glow)] blur-[100px] pointer-events-none opacity-40" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-zinc-900/20 blur-[100px] pointer-events-none opacity-40" />

      <div className="w-full max-w-[440px] z-10 space-y-7 animate-in fade-in zoom-in-95 duration-700">
        
        {/* ── Header ── */}
        <div className="text-center flex flex-col items-center">
          <h1 className="text-3xl font-black tracking-tight uppercase text-[var(--silver-100)] flex items-center gap-2 select-none">
            Register
          </h1>
          <p className="text-[10px] uppercase tracking-wider text-[var(--silver-500)] font-mono mt-1 leading-relaxed">
            Create a new administrative account
          </p>
        </div>

        {/* ── Main Panel ── */}
        <div className="panel rounded-2xl overflow-hidden relative border border-[var(--border-soft)] shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--silver-400)] to-transparent opacity-20" />

          {!success ? (
            <form onSubmit={handleRegister} className="p-7 space-y-4">
              
              {/* Full Name field */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase tracking-widest text-[var(--silver-500)] font-mono ml-1">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-[var(--silver-600)] pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-3.5 pl-11 text-xs rounded-xl bg-black/40 border border-[var(--border-soft)] text-[var(--silver-200)] focus:border-[var(--border-silver)] focus:bg-[rgba(10,10,14,0.6)] focus:outline-none transition-all duration-300 placeholder-[var(--silver-700)] font-mono"
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase tracking-widest text-[var(--silver-500)] font-mono ml-1">
                  Email Address
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
                    className="w-full p-3.5 pl-11 text-xs rounded-xl bg-black/40 border border-[var(--border-soft)] text-[var(--silver-200)] focus:border-[var(--border-silver)] focus:bg-[rgba(10,10,14,0.6)] focus:outline-none transition-all duration-300 placeholder-[var(--silver-700)] font-mono"
                    placeholder="admin@sukamcd.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase tracking-widest text-[var(--silver-500)] font-mono ml-1">
                  Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-[var(--silver-600)] pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-3.5 pl-11 pr-11 text-xs rounded-xl bg-black/40 border border-[var(--border-soft)] text-[var(--silver-200)] focus:border-[var(--border-silver)] focus:bg-[rgba(10,10,14,0.6)] focus:outline-none transition-all duration-300 placeholder-[var(--silver-700)] font-mono"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-[var(--silver-600)] hover:text-[var(--silver-300)] transition-colors focus:outline-none cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password field */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase tracking-widest text-[var(--silver-500)] font-mono ml-1">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-[var(--silver-600)] pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full p-3.5 pl-11 pr-11 text-xs rounded-xl bg-black/40 border border-[var(--border-soft)] text-[var(--silver-200)] focus:border-[var(--border-silver)] focus:bg-[rgba(10,10,14,0.6)] focus:outline-none transition-all duration-300 placeholder-[var(--silver-700)] font-mono"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* Cloudflare Turnstile */}
              <div className="space-y-2">
                <label className="block text-[9px] font-black uppercase tracking-widest text-[var(--silver-500)] font-mono ml-1">
                  Anti-Bot Verification
                </label>
                <div className="flex justify-center p-3 rounded-xl bg-black/30 border border-[var(--border-soft)]">
                  <div id="turnstile-container" className="cf-turnstile"></div>
                </div>
              </div>

              {/* Error Output */}
              {error && (
                <div className="flex gap-3 p-3.5 rounded-xl border border-red-500/20 bg-red-950/5 animate-in zoom-in-95 duration-200 select-text">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-relaxed text-red-400 font-mono uppercase font-bold">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full h-12 rounded-xl overflow-hidden relative group font-mono font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2.5 transition-all duration-300 border ${
                  loading
                    ? 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--silver-600)] cursor-not-allowed'
                    : 'bg-[var(--silver-200)] text-[#0f0f13] border-[var(--silver-300)] hover:bg-[var(--silver-100)] hover:shadow-[0_0_20px_var(--silver-glow)] active:scale-[0.98] cursor-pointer'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--silver-500)]" />
                    Registering...
                  </>
                ) : (
                  <>
                    Register Account
                  </>
                )}
              </button>

              {/* Separator */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[var(--border-subtle)]"></div>
                <span className="flex-shrink mx-4 text-[8px] font-mono uppercase font-black text-[var(--silver-600)] tracking-[0.2em]">
                  Or Continue With
                </span>
                <div className="flex-grow border-t border-[var(--border-subtle)]"></div>
              </div>

              {/* OAuth Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={!isGoogleOAuthEnabled || loading}
                  onClick={() => handleOAuthSignIn('google')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-black/40 border border-[var(--border-soft)] hover:border-[var(--border-silver)] text-xs text-[var(--silver-300)] transition-all duration-300 select-none font-bold ${(!isGoogleOAuthEnabled || loading) ? 'cursor-not-allowed opacity-50' : 'hover:text-white cursor-pointer'}`}>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleOAuthSignIn('github')}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-black/40 border border-[var(--border-soft)] hover:border-[var(--border-silver)] text-xs text-[var(--silver-300)] hover:text-white transition-all duration-300 cursor-pointer select-none font-bold"
                >
                  <svg className="w-4 h-4 shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center space-y-5 animate-in fade-in duration-500 select-text">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[var(--silver-100)] tracking-tight">Registration Successful!</h3>
                <p className="text-[11px] text-[var(--silver-500)] leading-relaxed font-light">
                  Akun Anda berhasil didaftarkan. Tautan konfirmasi telah dikirimkan ke email Anda (<strong className="text-[var(--silver-300)]">{email}</strong>). Silakan periksa kotak masuk atau folder spam Anda untuk memverifikasi pendaftaran sebelum masuk.
                </p>
              </div>
              <Link
                href="/gateway"
                className="w-full py-3 rounded-xl bg-[var(--silver-200)] text-[#0f0f13] text-[10px] font-mono tracking-[0.15em] font-black uppercase hover:bg-[var(--silver-100)] shadow-lg transition-all flex items-center justify-center cursor-pointer font-bold"
              >
                Return to Sign In
              </Link>
            </div>
          )}

          {/* ── Footer of Register Panel: Sign in link ── */}
          <div className="px-7 pb-6 pt-3 text-center border-t border-[var(--border-subtle)] bg-[rgba(10,10,14,0.2)]">
            <p className="text-[10.5px] font-mono text-[var(--silver-500)]">
              Already have an administrative account?{' '}
              <Link 
                href="/gateway" 
                className="text-[var(--silver-200)] hover:text-white font-black underline decoration-dotted transition-colors cursor-pointer"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* ── Home Link ── */}
        <div className="text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-[9px] font-mono uppercase font-black text-[var(--silver-600)] hover:text-[var(--silver-300)] transition-colors duration-250 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
