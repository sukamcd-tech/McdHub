"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ShieldAlert, Lock, Zap, AlertOctagon,
  Fingerprint, HardDrive, Activity, LogOut, RefreshCw,
  Loader2, ShieldQuestion, Info, AlertTriangle, Key, Terminal
} from "lucide-react";
import { getSecurityOverview, revokeAllSessions } from "@/lib/actions/security-actions";
import { getSystemLogs } from "@/lib/actions/log-actions";
import { useRouter } from "next/navigation";

interface SecurityClientProps {
  initialOverview: any;
  initialLogs: any[];
}

export default function SecurityClient({ initialOverview, initialLogs }: SecurityClientProps) {
  const router = useRouter();
  const [overview, setOverview] = useState<any>(initialOverview);
  const [securityLogs, setSecurityLogs] = useState<any[]>(initialLogs);
  const [isLoading, setIsLoading] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const fetchSecurityData = async () => {
    setIsLoading(true);
    try {
      const [ovResult, logsResult] = await Promise.all([
        getSecurityOverview(),
        getSystemLogs(20),
      ]);
      if (ovResult.success && ovResult.data) setOverview(ovResult.data);
      if (logsResult.success && logsResult.logs) {
        setSecurityLogs(logsResult.logs.filter((l: any) => l.category === "SECURITY"));
      }
    } catch (error) {
      console.error("Security data fetch failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setOverview(initialOverview);
    setSecurityLogs(initialLogs);
  }, [initialOverview, initialLogs]);

  useEffect(() => {
    const timer = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) { clearInterval(timer); return 100; }
        return prev + 2;
      });
    }, 20);
    return () => clearInterval(timer);
  }, []);

  const handleGlobalSignOut = async () => {
    setIsRevoking(true);
    try {
      const result = await revokeAllSessions();
      if (result.success) {
        router.push("/gateway");
      } else {
        alert("Failed to revoke sessions: " + result.error);
        setIsConfirmModalOpen(false);
      }
    } catch (error) {
      console.error(error);
      setIsConfirmModalOpen(false);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 select-none">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[var(--silver-500)] font-mono mb-2">
            Central Encryption & Access
          </p>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3 text-[var(--silver-100)]">
            <ShieldCheck className="w-7 h-7 text-emerald-500" />
            Security Core
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end pr-4 border-r border-[var(--border-subtle)] font-mono">
            <span className="text-[8px] font-black uppercase tracking-widest text-[var(--silver-600)]">Integrity Shield</span>
            <span className="text-[10px] text-emerald-400 font-black mt-0.5 tracking-tighter">MILITARY-GRADE (RLS)</span>
          </div>
          <button
            onClick={fetchSecurityData}
            disabled={isLoading}
            className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-soft)] text-[var(--silver-500)] transition-all hover:border-[var(--border-silver)] hover:text-[var(--silver-200)] disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Security Architecture Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* ── Left column: Env Health & Identity (3-cols) ── */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          
          {/* Health Shield Scanner */}
          <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col relative">
            {/* Scan progress sweep bar */}
            <div className="h-[2px] w-full bg-[rgba(255,255,255,0.02)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 via-[var(--silver-300)] to-emerald-400"
              />
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between gap-5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--silver-600)] font-mono flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Daemon Health
                </span>
                <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-800/10 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                  {scanProgress < 100 ? "SCANNING..." : "STABLE"}
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { label: "Supabase DB", status: overview?.envIntegrity?.supabase },
                  { label: "GDrive Vault", status: overview?.envIntegrity?.gdrive },
                  { label: "Groq AI Engine", status: overview?.envIntegrity?.ai },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                    <span className="text-[9.5px] font-bold font-mono text-[var(--silver-400)]">{item.label}</span>
                    {item.status ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[8px] font-black uppercase">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Enforced</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-red-400 font-mono text-[8px] font-black uppercase">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Missing</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Identity Shield Block */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 flex flex-col gap-4 flex-1">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--silver-600)] font-mono flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-[var(--silver-400)]" /> Cryptography
            </span>

            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-active)] border border-[var(--border-soft)] text-[var(--silver-400)]">
                <Lock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase font-mono text-[var(--silver-300)]">Supabase MFA</p>
                <p className="text-[8px] uppercase font-black font-mono tracking-widest text-[var(--silver-600)] mt-0.5">
                  STATUS: {overview?.mfaStatus || "PENDING"}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex-1 flex items-center justify-center">
              <p className="text-[9px] leading-relaxed text-[var(--silver-500)] italic font-mono uppercase text-center">
                Strict Auth handles validation via client-side Supabase JWT with auto-token rotation enabled.
              </p>
            </div>
          </div>
        </div>

        {/* ── Middle: RLS Panels & Live Threat Feed (6-cols) ── */}
        <div className="lg:col-span-6 space-y-6 flex flex-col min-h-0">
          
          {/* Armor Plates (RLS status) */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--silver-600)] font-mono flex items-center gap-1.5 mb-4">
              <HardDrive className="w-3.5 h-3.5 text-[var(--silver-400)]" /> Row-Level Protection (RLS)
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {overview?.rlsStatus?.map((item: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 font-mono">
                  <span className="text-[9.5px] font-bold text-[var(--silver-400)] truncate">{item.table}</span>
                  <span className="px-2 py-0.5 rounded text-[6.5px] font-black uppercase tracking-wider bg-emerald-950/20 border border-emerald-800/25 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Threat Audit Terminal */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-[var(--border-subtle)] bg-[rgba(10,10,14,0.2)] flex items-center justify-between shrink-0 select-none">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--silver-600)] font-mono flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[var(--silver-400)]" /> Threat Intel Feed
              </span>
              <Terminal className="w-3.5 h-3.5 text-[var(--silver-600)] animate-pulse" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3.5 bg-[rgba(10,10,14,0.4)]">
              <AnimatePresence mode="popLayout">
                {securityLogs.length > 0 ? (
                  securityLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] transition-all duration-300 hover:border-[var(--border-soft)] relative group"
                    >
                      <div className="absolute top-0 bottom-0 left-0 w-0.5 rounded-l-xl bg-red-500/60 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="flex items-center justify-between gap-3 pl-1 font-mono">
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-red-950/20 border border-red-800/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.05)]">
                          {log.action}
                        </span>
                        
                        <span className="text-[9px] text-[var(--silver-600)]">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      
                      <p className="text-[10px] pl-1 text-[var(--silver-400)] leading-relaxed mt-2.5 font-medium">{log.description}</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-25 py-24 select-none">
                    <ShieldQuestion className="w-10 h-10 text-[var(--silver-600)] mb-3" />
                    <p className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-600)]">All Systems Encrypted & Secure</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Right column: Emergency Kill Switch (3-cols) ── */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          
          {/* Emergency Kill-Switch Container */}
          <div className="rounded-2xl border border-dashed border-red-500/20 bg-[var(--bg-surface)] p-6 flex flex-col items-center justify-center text-center gap-5 flex-1 relative overflow-hidden">
            {/* Top red alert glow sweep */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent animate-pulse" />

            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-950/20 border border-red-800/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-[11px] font-black uppercase tracking-[0.1em] text-[var(--silver-200)] font-mono">Emergency Kill-Switch</h4>
              <p className="text-[9px] leading-relaxed text-[var(--silver-600)] px-2 font-mono uppercase">
                Terminate all active server session states globally.
              </p>
            </div>

            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isRevoking}
              className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 border font-mono font-black uppercase tracking-widest text-[9.5px] transition-all cursor-pointer ${
                isRevoking
                  ? "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--silver-600)]"
                  : "bg-red-500/80 border-red-500/20 text-white hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-[0.98]"
              }`}
            >
              {isRevoking ? (
                <Loader2 className="w-4 h-4 animate-spin text-[var(--silver-500)]" />
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  Initiate Global Revoke
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/5 border border-amber-800/15 flex gap-3 items-center select-none shrink-0">
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-[9px] leading-relaxed font-mono uppercase text-[var(--silver-600)]">
              All logins, access vectors, and security operations are audited by the SukaMCD security daemon.
            </p>
          </div>
        </div>
      </div>

      {/* ── Emergency Revocation Modal ── */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-red-500/30 bg-[var(--bg-elevated)]"
            >
              {/* Alert Stripe */}
              <div className="h-1 bg-gradient-to-r from-red-600 via-transparent to-red-600" />
              
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-950/20 border border-red-800/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)] mb-6">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                
                <h3 className="text-sm font-black uppercase tracking-[0.25em] font-mono text-[var(--silver-100)] mb-2">
                  Session Revocation
                </h3>
                
                <p className="text-[10px] leading-relaxed font-mono uppercase text-[var(--silver-500)] mb-8 px-2">
                  This action will force disconnect <span className="text-red-400 font-black">ALL SECURITY SESSIONS</span> across every client node. Do you proceed?
                </p>

                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={handleGlobalSignOut}
                    disabled={isRevoking}
                    className="w-full py-4 text-white font-mono font-black uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 bg-red-500 hover:bg-red-600 hover:shadow-[0_0_15px_rgba(239,68,68,0.35)]"
                  >
                    {isRevoking ? <Loader2 className="w-4 h-4 animate-spin" /> : "ENGAGE SYSTEM SHUTDOWN"}
                  </button>
                  <button
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="w-full py-4 font-mono font-black uppercase tracking-widest text-[10px] rounded-xl transition-all cursor-pointer bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--silver-500)] hover:bg-[var(--bg-active)] hover:text-[var(--silver-200)]"
                  >
                    Abort Operation
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
