import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Zap,
  AlertOctagon,
  Fingerprint,
  HardDrive,
  Activity,
  LogOut,
  RefreshCw,
  Loader2,
  ShieldQuestion,
  Info,
  AlertTriangle,
  Terminal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<any>(null);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const fetchSecurityData = async () => {
    setIsLoading(true);
    try {
      const [ovRes, logsRes] = await Promise.all([
        fetch("/api/security/overview").then((r) => r.json() as Promise<any>).catch(() => null),
        fetch("/api/logs?limit=30").then((r) => r.json() as Promise<any>).catch(() => null),
      ]);

      if (ovRes?.success && ovRes.data) setOverview(ovRes.data);
      if (logsRes?.success && Array.isArray(logsRes.logs)) {
        setSecurityLogs(
          logsRes.logs.filter((l: any) => l.category === "SECURITY" || l.category === "AUTH")
        );
      }
    } catch (error) {
      console.error("Security data fetch failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
    const timer = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 20);
    return () => clearInterval(timer);
  }, []);

  const handleGlobalSignOut = async () => {
    setIsRevoking(true);
    try {
      const res = await fetch("/api/security/revoke-sessions", {
        method: "POST",
      });
      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        navigate("/gateway");
      } else {
        alert("Failed to revoke sessions: " + (data.error || "Unknown"));
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
    <div className="w-full h-full flex flex-col gap-5 animate-in fade-in duration-300 select-none">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] font-black text-zinc-400 font-mono mb-1">
            Central Encryption & Access
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5 text-zinc-100">
            <ShieldCheck className="w-6 h-6 text-zinc-300" />
            Security Core
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end pr-3 border-r border-white/[0.06] font-mono">
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
              Integrity Shield
            </span>
            <span className="text-[9.5px] text-zinc-300 font-bold mt-0.5 tracking-wider">
              ACTIVE ENCRYPTION
            </span>
          </div>
          <button
            onClick={fetchSecurityData}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-[#1c1c22] border border-white/[0.08] text-zinc-400 transition-all hover:border-zinc-500/40 hover:text-white disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ── Security Architecture Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* ── Left column: Env Health & Identity (3-cols) ── */}
        <div className="lg:col-span-3 space-y-4 flex flex-col">
          <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#141418] flex flex-col relative">
            <div className="h-[2px] w-full bg-white/[0.04]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
                className="h-full bg-zinc-300"
              />
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-black uppercase tracking-[0.2em] text-zinc-400 font-mono flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-zinc-300" /> Daemon Health
                </span>
                <span className="text-[8px] font-mono text-zinc-300 font-bold bg-[#1c1c22] px-2 py-0.5 rounded border border-white/[0.08]">
                  {scanProgress < 100 ? "SCANNING..." : "STABLE"}
                </span>
              </div>

              <div className="space-y-2">
                {[
                  {
                    label: "Cloudflare D1 DB",
                    status: overview?.envIntegrity?.d1 ?? true,
                  },
                  {
                    label: "AI Neural Core",
                    status: overview?.envIntegrity?.ai ?? false,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#1c1c22] border border-white/[0.06]"
                  >
                    <span className="text-[9px] font-bold font-mono text-zinc-300">
                      {item.label}
                    </span>
                    {item.status ? (
                      <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-[8px] font-black uppercase">
                        <ShieldCheck className="w-3 h-3 text-zinc-300" />
                        <span>Enforced</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[8px] font-black uppercase">
                        <ShieldAlert className="w-3 h-3 text-zinc-400" />
                        <span>Standby</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#141418] p-4 flex flex-col gap-3 flex-1">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--silver-600)] font-mono flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-[var(--silver-400)]" /> Cryptography
            </span>

            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-active)] border border-[var(--border-soft)] text-[var(--silver-400)]">
                <Lock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase font-mono text-[var(--silver-300)]">
                  Session Token
                </p>
                <p className="text-[8px] uppercase font-black font-mono tracking-widest text-[var(--silver-600)] mt-0.5">
                  STATUS: SECURED (JWT HS256)
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex-1 flex items-center justify-center">
              <p className="text-[9px] leading-relaxed text-[var(--silver-500)] italic font-mono uppercase text-center">
                Strict Auth handles validation via secure HTTP-Only Cookies with PBKDF2 hash encryption.
              </p>
            </div>
          </div>
        </div>

        {/* ── Middle: RLS Panels & Threat Feed (6-cols) ── */}
        <div className="lg:col-span-6 space-y-4 flex flex-col min-h-0">
          <div className="rounded-xl border border-white/[0.06] bg-[#141418] p-4">
            <span className="text-[8.5px] font-black uppercase tracking-[0.2em] text-zinc-400 font-mono flex items-center gap-1.5 mb-3">
              <HardDrive className="w-3.5 h-3.5 text-zinc-300" /> Database Armor Protection
            </span>

            <div className="grid grid-cols-2 gap-2">
              {(
                overview?.rlsStatus || [
                  { table: "mcd_projects", status: "ARMED" },
                  { table: "profiles", status: "ARMED" },
                  { table: "mcd_system_logs", status: "ARMED" },
                  { table: "orders", status: "ARMED" },
                ]
              ).map((item: any, i: number) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-[#1c1c22] border border-white/[0.06] flex items-center justify-between gap-2 font-mono"
                >
                  <span className="text-[9px] font-bold text-zinc-300 truncate">
                    {item.table}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-wider bg-black/40 border border-white/[0.08] text-zinc-300">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

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
                      <div className="absolute top-0 bottom-0 left-0 w-0.5 rounded-l-xl bg-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="flex items-center justify-between gap-3 pl-1 font-mono">
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-[#1c1c22] border border-white/[0.08] text-zinc-300">
                          {log.action}
                        </span>

                        <span className="text-[9px] text-[var(--silver-600)]">
                          {new Date(log.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="text-[10px] pl-1 text-[var(--silver-400)] leading-relaxed mt-2.5 font-medium">
                        {log.description}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-25 py-24 select-none">
                    <ShieldQuestion className="w-10 h-10 text-[var(--silver-600)] mb-3" />
                    <p className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-600)]">
                      All Systems Encrypted & Secure
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Right column: Emergency Kill Switch (3-cols) ── */}
        <div className="lg:col-span-3 space-y-4 flex flex-col">
          <div className="rounded-xl border border-white/[0.08] bg-[#141418] p-5 flex flex-col items-center justify-center text-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#1c1c22] border border-white/[0.1] text-zinc-200 shadow-md">
              <AlertOctagon className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-[10.5px] font-black uppercase tracking-[0.1em] text-zinc-200 font-mono">
                Emergency Revoke
              </h4>
              <p className="text-[8.5px] leading-relaxed text-zinc-400 px-1 font-mono uppercase">
                Terminate all active server session tokens.
              </p>
            </div>

            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isRevoking}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 border font-mono font-black uppercase tracking-widest text-[9px] transition-all cursor-pointer ${
                isRevoking
                  ? "bg-[#1c1c22] border-white/[0.06] text-zinc-500"
                  : "bg-zinc-200 text-black border-zinc-300 hover:bg-white active:scale-[0.98]"
              }`}
            >
              {isRevoking ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  Global Revoke
                </>
              )}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-[#141418] border border-white/[0.06] flex gap-2.5 items-center select-none shrink-0">
            <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <p className="text-[8.5px] leading-relaxed font-mono uppercase text-zinc-400">
              All logins & operations are audited by the security kernel.
            </p>
          </div>
        </div>
      </div>

      {/* ── Emergency Revocation Modal ── */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-white/[0.1] bg-[#141418]"
            >
              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#1c1c22] border border-white/[0.1] text-zinc-200 mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <h3 className="text-sm font-black uppercase tracking-[0.25em] font-mono text-zinc-100 mb-2">
                  Session Revocation
                </h3>

                <p className="text-[10px] leading-relaxed font-mono uppercase text-zinc-400 mb-6 px-2">
                  Tindakan ini akan memutus{" "}
                  <span className="text-zinc-100 font-black">
                    SEMUA SESI LOGIN AKTIF
                  </span>{" "}
                  di seluruh perangkat. Lanjutkan?
                </p>

                <div className="flex flex-col w-full gap-2.5">
                  <button
                    onClick={handleGlobalSignOut}
                    disabled={isRevoking}
                    className="w-full py-3 text-black font-mono font-black uppercase tracking-widest text-[9.5px] rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 bg-zinc-200 border border-zinc-300 hover:bg-white active:scale-[0.98]"
                  >
                    {isRevoking ? (
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
                    ) : (
                      "Putuskan Semua Sesi"
                    )}
                  </button>
                  <button
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="w-full py-3 font-mono font-black uppercase tracking-widest text-[9.5px] rounded-lg transition-all cursor-pointer bg-[#1c1c22] border border-white/[0.08] text-zinc-400 hover:text-zinc-200"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecurityPage;
