import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  ShieldCheck,
  Database,
  Loader2,
  AlertTriangle,
  History,
  Cloud,
  Info,
  Cpu,
  HardDrive,
  RefreshCw,
} from "lucide-react";

export const BackupPage: React.FC = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupLogs, setBackupLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/backup/history");
      const data = (await res.json()) as any;
      if (data?.success && Array.isArray(data.history)) {
        setBackupLogs(data.history);
      }
    } catch (err) {
      console.error("Error fetching backup history:", err);
    }
  };

  const handleRunBackup = async () => {
    setIsBackingUp(true);
    setError(null);
    try {
      const res = await fetch("/api/backup/trigger", {
        method: "POST",
      });
      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        await fetchHistory();
      } else {
        setError(data.error || "Gagal menjalankan backup.");
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error.");
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300 select-none">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] font-black text-zinc-400 font-mono mb-1">
            Automated Server Vault
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5 text-zinc-100">
            <UploadCloud className="w-6 h-6 text-zinc-300" />
            Backup & Snapshot
          </h1>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1c1c22] border border-white/[0.08]">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300 font-mono">
            Cloud Node Online
          </span>
        </div>
      </div>

      {/* ── Metrics Strip (Real Data, Compact Height) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Target Storage",
            value: "Cloudflare D1",
            detail: "SQLite Edge Database",
            icon: Cloud,
          },
          {
            label: "Total Snapshots",
            value: `${backupLogs.length} Snapshots`,
            detail: "Encrypted Cloud Vault",
            icon: ShieldCheck,
          },
          {
            label: "Latest Backup",
            value: backupLogs[0]?.created_at ? new Date(backupLogs[0].created_at).toLocaleDateString("id-ID") : "Belum Ada",
            detail: backupLogs[0]?.created_at ? new Date(backupLogs[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " WIB" : "Manual / Cron Trigger",
            icon: Database,
          },
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div
              key={i}
              className="p-3.5 rounded-xl border border-white/[0.06] flex items-center justify-between gap-3 bg-[#141418] hover:bg-[#1a1a20] transition-colors"
            >
              <div className="min-w-0">
                <p className="text-[8.5px] font-black uppercase tracking-[0.2em] text-zinc-400 font-mono mb-0.5">
                  {metric.label}
                </p>
                <p className="text-sm font-extrabold text-zinc-100 tracking-tight font-mono">
                  {metric.value}
                </p>
                <p className="text-[8.5px] text-zinc-400 font-mono mt-0.5 truncate">
                  {metric.detail}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#1c1c22] border border-white/[0.06] shrink-0">
                <Icon className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Layout Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── Left: Interactive Cloud Sync Hub ── */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="rounded-xl flex flex-col p-5 gap-4 bg-[#141418] border border-white/[0.06]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-200 font-mono">
                  Sync Control
                </h3>
                <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono mt-0.5">
                  Cloud snapshot creation
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#1c1c22] border border-white/[0.06]">
                <Cpu className="w-4 h-4 text-zinc-400" />
              </div>
            </div>

            {/* Visual Radar Block */}
            <div className="flex-1 flex flex-col items-center justify-center py-4 select-none relative">
              <div className="relative flex items-center justify-center w-28 h-28">
                <div className="absolute inset-0 rounded-full border border-white/[0.06] flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border border-white/[0.08] flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border border-white/[0.1]" />
                  </div>
                </div>

                <div className="z-10 p-4 rounded-full bg-[#1c1c22] border border-white/[0.12] flex items-center justify-center shadow-md">
                  <HardDrive
                    className={`w-7 h-7 text-zinc-200 ${
                      isBackingUp ? "animate-bounce" : ""
                    }`}
                  />
                </div>
              </div>

              <div className="text-center mt-3">
                <p className="text-[9.5px] font-black uppercase tracking-[0.2em] text-zinc-300 font-mono">
                  {isBackingUp
                    ? "COMPILING SYSTEM DATA..."
                    : "VAULT READY FOR SNAPSHOT"}
                </p>
                <p className="text-[8.5px] text-zinc-400 uppercase font-mono tracking-wider mt-0.5">
                  Database snapshot generation
                </p>
              </div>
            </div>

            {/* Compact Action Button */}
            <button
              onClick={handleRunBackup}
              disabled={isBackingUp}
              className={`w-full h-11 rounded-xl font-mono font-black uppercase tracking-[0.2em] text-[9.5px] flex items-center justify-center gap-2.5 transition-all duration-200 border cursor-pointer ${
                isBackingUp
                  ? "bg-[#1c1c22] text-zinc-500 border-white/[0.06] cursor-not-allowed"
                  : "bg-zinc-200 text-black border-zinc-300 hover:bg-white active:scale-[0.98]"
              }`}
            >
              {isBackingUp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                  Writing Snapshot Node...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Initiate Secure Sync
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Right: Audit Session Logs ── */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-xl flex flex-col overflow-hidden bg-[#141418] border border-white/[0.06]">
            <div className="px-5 py-3.5 flex items-center gap-2.5 border-b border-white/[0.06] bg-black/20 select-none">
              <div className="p-1.5 rounded-lg bg-[#1c1c22] border border-white/[0.06]">
                <History className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--silver-200)] font-mono">
                  Vault Session Logs
                </h3>
                <p className="text-[9px] uppercase tracking-wider text-[var(--silver-600)] font-mono">
                  Recent cloud archive records
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-black/30 max-h-[340px]">
              <AnimatePresence initial={false} mode="popLayout">
                {backupLogs.length > 0 ? (
                  backupLogs.map((log, index) => (
                    <motion.div
                      key={log.id || log.filename}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div
                        className="p-3.5 rounded-xl border border-white/[0.06] hover:border-white/[0.14] bg-[#18181f] relative group transition-colors"
                      >
                        <div
                          className={`absolute top-0 bottom-0 left-0 w-0.5 rounded-l-lg transition-all ${
                            index === 0
                              ? "bg-zinc-400"
                              : "bg-transparent group-hover:bg-zinc-600"
                          }`}
                        />

                        <div className="flex items-center justify-between gap-3 pl-1">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded-md bg-[#1c1c22] border border-white/[0.08] text-zinc-300">
                              <Database className="w-3.5 h-3.5" />
                            </div>
                            <span
                              className={`text-[9px] font-black uppercase tracking-widest font-mono ${
                                index === 0
                                  ? "text-zinc-200"
                                  : "text-zinc-400"
                              }`}
                            >
                              {index === 0 ? "Latest Sync" : log.type || "Manual"}
                            </span>
                          </div>

                          <span className="text-[9px] font-mono text-[var(--silver-600)]">
                            {new Date(log.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="mt-3 pl-1 space-y-1.5 border-t border-[var(--border-subtle)] pt-3">
                          <div>
                            <span className="text-[8px] font-mono uppercase text-[var(--silver-700)]">
                              Filename
                            </span>
                            <p className="text-[10px] font-bold font-mono tracking-tight text-[var(--silver-300)] break-all mt-0.5">
                              {log.filename}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-4 pt-1">
                            <div>
                              <span className="text-[8px] font-mono uppercase text-[var(--silver-700)]">
                                Size
                              </span>
                              <p className="text-[9px] font-mono text-[var(--silver-500)] mt-0.5">
                                {log.size || "--"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : error ? (
                  <div className="p-5 rounded-xl border border-red-500/25 bg-red-950/5 space-y-2">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest font-mono">
                        Vault Fault Detected
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[var(--silver-400)] font-light font-mono">
                      {error}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 select-none">
                    <Cloud className="w-10 h-10 text-[var(--silver-600)] mb-3" />
                    <p className="text-[9px] uppercase tracking-widest font-black font-mono text-[var(--silver-600)]">
                      No Archives Record Found
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="p-4.5 rounded-2xl border border-dashed border-[var(--border-soft)] bg-[rgba(10,10,14,0.15)] flex gap-3.5 items-center select-none">
            <Info className="w-4 h-4 text-[var(--silver-500)] shrink-0" />
            <p className="text-[9.5px] leading-relaxed font-mono uppercase text-[var(--silver-600)]">
              Manual snapshots are preserved in the server cloud vault according to the established retention policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupPage;
