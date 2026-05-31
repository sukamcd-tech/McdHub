"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, ShieldCheck, Database, Loader2, CheckCircle2,
  AlertTriangle, History, Cloud, Info, Cpu, HardDrive, RefreshCw
} from "lucide-react";
import { triggerManualBackup } from "@/lib/actions/backup-actions";

interface BackupClientProps {
  initialHistory: any[];
}

export default function BackupClient({ initialHistory }: BackupClientProps) {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupLogs, setBackupLogs] = useState<any[]>(initialHistory);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setBackupLogs(initialHistory); }, [initialHistory]);

  const handleRunBackup = async () => {
    setIsBackingUp(true);
    setError(null);
    try {
      const result = await triggerManualBackup();
      if (result.success) {
        setBackupLogs(prev => [result, ...prev].slice(0, 5));
      } else {
        setError(result.error || "Gagal menjalankan backup.");
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error.");
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 select-none">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[var(--silver-500)] font-mono mb-2">
            Automated Server Vault
          </p>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3 text-[var(--silver-100)]">
            <UploadCloud className="w-7 h-7 text-[var(--silver-300)]" />
            Backup & Snapshot
          </h1>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-950/10 border border-emerald-800/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
          <span className="dot-online animate-emerald-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 font-mono">Cloud Node Online</span>
        </div>
      </div>

      {/* ── High-Tech Metrics Strip ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: "Target Vault", value: "Google Drive API v3", detail: "Active OAuth2 Channel", icon: Cloud },
          { label: "Data Integrity", value: "99.98% Secured", detail: "SHA-256 Checksums", icon: ShieldCheck },
          { label: "Backup Allocation", value: "Unlimited Vault", detail: "Automatic rotation", icon: Database }
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl border border-[var(--border-subtle)] flex items-center justify-between gap-4 transition-all duration-300 hover:border-[var(--border-silver)] hover:bg-[var(--bg-elevated)]"
              style={{ background: "var(--bg-surface)" }}
            >
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--silver-500)] font-mono mb-1">{metric.label}</p>
                <p className="text-sm font-extrabold text-[var(--silver-200)] tracking-tight font-mono">{metric.value}</p>
                <p className="text-[9px] text-[var(--silver-600)] font-mono mt-0.5">{metric.detail}</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-soft)]">
                <Icon className="w-4.5 h-4.5 text-[var(--silver-400)]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Layout Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left: Interactive Cloud Sync Hub ── */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="panel-silver rounded-2xl flex flex-col overflow-hidden relative p-8 gap-8 min-h-[420px] justify-between">
            {/* Top glowing line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--silver-300)] to-transparent opacity-40" />

            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--silver-200)] font-mono mb-1">
                  Hyper Sync Control
                </h3>
                <p className="text-[9px] uppercase tracking-wider text-[var(--silver-600)] font-mono">
                  Cloud link snapshot process
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-soft)]">
                <Cpu className="w-5 h-5 text-[var(--silver-400)] animate-pulse" />
              </div>
            </div>

            {/* High-tech Visual Radar Block */}
            <div className="flex-1 flex flex-col items-center justify-center py-6 select-none relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_0%,transparent_60%)] pointer-events-none" />
              
              <div className="relative flex items-center justify-center w-36 h-36">
                {/* Radar sweep line */}
                <div className="absolute inset-0 rounded-full border border-[var(--border-subtle)] flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border border-[var(--border-soft)] flex items-center justify-center opacity-60">
                    <div className="w-12 h-12 rounded-full border border-[var(--border-med)] opacity-40" />
                  </div>
                </div>
                
                {/* Spinning border */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-t border-b border-dashed border-[var(--silver-400)] opacity-25"
                />

                <div className="z-10 p-5 rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--border-silver)] flex items-center justify-center shadow-[0_0_30px_var(--silver-glow)]">
                  <HardDrive className={`w-9 h-9 text-[var(--silver-200)] ${isBackingUp ? "animate-bounce" : ""}`} />
                </div>
              </div>

              <div className="text-center mt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--silver-300)] font-mono">
                  {isBackingUp ? "COMPILING SYSTEM DATA..." : "VAULT READY FOR SNAPSHOT"}
                </p>
                <p className="text-[9px] text-[var(--silver-600)] uppercase font-mono tracking-widest mt-1">
                  Google Drive Target Folder: ...GUl5YNhW-
                </p>
              </div>
            </div>

            {/* Premium Button */}
            <button
              onClick={handleRunBackup}
              disabled={isBackingUp}
              className={`w-full h-14 rounded-xl overflow-hidden relative group font-mono font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 transition-all duration-300 border ${
                isBackingUp 
                  ? "bg-[var(--bg-elevated)] text-[var(--silver-600)] border-[var(--border-subtle)] cursor-not-allowed" 
                  : "bg-[var(--silver-200)] text-[#0f0f13] border-[var(--silver-300)] hover:bg-[var(--silver-100)] hover:shadow-[0_0_25px_var(--silver-glow)] active:scale-[0.98] cursor-pointer"
              }`}
            >
              {/* Scan Sweep overlay */}
              {!isBackingUp && (
                <div className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
                  style={{ animation: "scan-sweep 1.5s ease-in-out infinite" }}
                />
              )}

              {isBackingUp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--silver-500)]" />
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
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="panel rounded-2xl flex flex-col overflow-hidden h-[420px]">
            {/* Session Logs Header */}
            <div className="px-6 py-5 flex items-center gap-3 border-b border-[var(--border-subtle)] bg-[rgba(10,10,14,0.25)] select-none">
              <div className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-soft)]">
                <History className="w-4 h-4 text-[var(--silver-400)]" />
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

            {/* Cascading Scrollable Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3.5 bg-[rgba(10,10,14,0.4)]">
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
                        className="p-4 rounded-xl border transition-all duration-300 hover:border-[var(--border-silver)] relative group"
                        style={{
                          background: index === 0 ? "rgba(16,185,129,0.02)" : "var(--bg-surface)",
                          borderColor: index === 0 ? "rgba(16,185,129,0.15)" : "var(--border-subtle)",
                        }}
                      >
                        {/* Dynamic Status Border Line */}
                        <div className={`absolute top-0 bottom-0 left-0 w-0.5 rounded-l-lg transition-all ${
                          index === 0 ? "bg-emerald-500/80" : "bg-transparent group-hover:bg-[var(--silver-500)]"
                        }`} />

                        <div className="flex items-center justify-between gap-3 pl-1">
                          <div className="flex items-center gap-2">
                            {index === 0 ? (
                              <div className="p-1 rounded-md bg-emerald-950/20 border border-emerald-800/20 text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className="p-1 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-soft)] text-[var(--silver-500)]">
                                <Database className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <span className={`text-[9px] font-black uppercase tracking-widest font-mono ${
                              index === 0 ? "text-emerald-400" : "text-[var(--silver-400)]"
                            }`}>
                              {index === 0 ? "Latest Sync" : log.type || "Manual"}
                            </span>
                          </div>
                          
                          <span className="text-[9px] font-mono text-[var(--silver-600)]">
                            {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <div className="mt-3 pl-1 space-y-1.5 border-t border-[var(--border-subtle)] pt-3">
                          <div>
                            <span className="text-[8px] font-mono uppercase text-[var(--silver-700)]">Filename</span>
                            <p className="text-[10px] font-bold font-mono tracking-tight text-[var(--silver-300)] break-all mt-0.5">
                              {log.filename}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-4 pt-1">
                            <div>
                              <span className="text-[8px] font-mono uppercase text-[var(--silver-700)]">Size</span>
                              <p className="text-[9px] font-mono text-[var(--silver-500)] mt-0.5">
                                {log.size || "--"}
                              </p>
                            </div>
                            
                            {index === 0 && log.driveId && (
                              <div className="text-right">
                                <span className="text-[8px] font-mono uppercase text-[var(--silver-700)]">Vault ID</span>
                                <p className="text-[9px] font-mono text-[var(--silver-500)] truncate w-32 ml-auto mt-0.5 opacity-60">
                                  {log.driveId}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : error ? (
                  <div className="p-5 rounded-xl border border-red-500/25 bg-red-950/5 space-y-2">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest font-mono">Vault Fault Detected</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[var(--silver-400)] font-light font-mono">{error}</p>
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
              Manual snapshots are preserved in the cloud vault according to the established Google Drive retention policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
