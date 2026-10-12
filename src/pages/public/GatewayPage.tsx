import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, Mail, ShieldAlert, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";

export const GatewayPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/admin/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as any;

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid email or password. Access denied.");
        setLoading(false);
        return;
      }

      // Check role or redirect to appropriate portal
      if (data.user?.role === "admin") {
        navigate(redirectParam.startsWith("/admin") ? redirectParam : "/admin/dashboard");
      } else {
        navigate(redirectParam.startsWith("/admin") ? "/profile" : redirectParam);
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 relative overflow-x-hidden select-none bg-[var(--bg-root)]">
      {/* ── Background Wrapper to prevent scrolling/overflow ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* ── High-Tech Cyber Grid Background ── */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,212,216,0.02)_0%,transparent_75%)]" />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(var(--silver-400) 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        />
        
        {/* ── Visual Ambient Glows ── */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[var(--silver-glow)] blur-[100px] opacity-40" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-zinc-900/20 blur-[100px] opacity-40" />
      </div>

      <div className="w-full max-w-[440px] z-10 space-y-7 animate-in fade-in zoom-in-95 duration-700">
        
        {/* ── Gateway restricted header ── */}
        <div className="text-center flex flex-col items-center">
          <h1 className="text-3xl font-black tracking-tight uppercase text-[var(--silver-100)] flex items-center gap-2 select-none">
            Sign In
          </h1>
          <p className="text-[10px] uppercase tracking-wider text-[var(--silver-500)] font-mono mt-1 leading-relaxed">
            Enter your credentials to continue
          </p>
        </div>

        {/* ── Main Login Panel ── */}
        <div className="panel rounded-2xl overflow-hidden relative border border-[var(--border-soft)] shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--silver-400)] to-transparent opacity-20" />

          <form onSubmit={handleLogin} className="p-5 sm:p-7 space-y-5">
            
            {/* Email Address field */}
            <div className="space-y-2">
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
                  className="w-full p-4 pl-11 text-xs rounded-xl bg-black/40 border border-[var(--border-soft)] text-[var(--silver-200)] focus:border-[var(--border-silver)] focus:bg-[rgba(10,10,14,0.6)] focus:outline-none transition-all duration-300 placeholder-[var(--silver-700)] font-mono"
                  placeholder="you@sukamcd.tech"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
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
                  className="w-full p-4 pl-11 pr-11 text-xs rounded-xl bg-black/40 border border-[var(--border-soft)] text-[var(--silver-200)] focus:border-[var(--border-silver)] focus:bg-[rgba(10,10,14,0.6)] focus:outline-none transition-all duration-300 placeholder-[var(--silver-700)] font-mono"
                  placeholder="••••••••"
                  autoComplete="current-password"
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
                  ? "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--silver-600)] cursor-not-allowed"
                  : "bg-[var(--silver-200)] text-[#0f0f13] border-[var(--silver-300)] hover:bg-[var(--silver-100)] hover:shadow-[0_0_20px_var(--silver-glow)] active:scale-[0.98] cursor-pointer"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--silver-500)]" />
                  Verifying...
                </>
              ) : (
                <>
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* ── Footer of Login Panel: Register link ── */}
          <div className="px-7 pb-6 pt-3 text-center border-t border-[var(--border-subtle)] bg-[rgba(10,10,14,0.2)]">
            <p className="text-[10.5px] font-mono text-[var(--silver-500)]">
              Don&apos;t have an account?{" "}
              <Link 
                to="/gateway/register" 
                className="text-[var(--silver-200)] hover:text-white font-black underline decoration-dotted transition-colors cursor-pointer"
              >
                Register Here
              </Link>
            </p>
          </div>
        </div>

        {/* ── Home Link ── */}
        <div className="text-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-[9px] font-mono uppercase font-black text-[var(--silver-600)] hover:text-[var(--silver-300)] transition-colors duration-250 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
