"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Shield, User, Database, Terminal,
  RefreshCw, Clock, Eye, Info, Server, Layers, CheckCircle2
} from "lucide-react";
import { getSystemLogs, LogCategory } from "@/lib/actions/log-actions";

interface LogsClientProps {
  initialLogs: any[];
}

export default function LogsClient({ initialLogs }: LogsClientProps) {
  const [logs, setLogs] = useState<any[]>(initialLogs);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<LogCategory | "ALL">("ALL");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  useEffect(() => { setLogs(initialLogs); }, [initialLogs]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const result = await getSystemLogs(50);
      if (result.success && result.logs) setLogs(result.logs);
    } catch (error) {
      console.error("Failed to load logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => filter === "ALL" ? true : log.category === filter);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "SECURITY": return { bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.2)", text: "#ef4444" };
      case "USER_ACTION": return { bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.2)", text: "#10b981" };
      case "DATABASE": return { bg: "rgba(212,212,216,0.06)", border: "rgba(212,212,216,0.15)", text: "var(--silver-300)" };
      default: return { bg: "rgba(255,255,255,0.03)", border: "var(--border-soft)", text: "var(--silver-400)" };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "SECURITY": return <Shield className="w-3 h-3" />;
      case "USER_ACTION": return <User className="w-3 h-3" />;
      case "DATABASE": return <Database className="w-3 h-3" />;
      default: return <Terminal className="w-3 h-3" />;
    }
  };

  const filterCategories = ["ALL", "SYSTEM", "USER_ACTION", "SECURITY"] as const;

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 select-none">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[var(--silver-500)] font-mono mb-2">
            Immutable Audit Trail
          </p>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3 text-[var(--silver-100)]">
            <Activity className="w-7 h-7 text-[var(--silver-300)]" />
            System Audit Logs
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-soft)] text-[var(--silver-500)] transition-all hover:border-[var(--border-silver)] hover:text-[var(--silver-200)] disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            {filterCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer border ${
                  filter === cat
                    ? "bg-[var(--bg-active)] border-[var(--border-silver)] text-[var(--silver-100)] shadow-[0_0_12px_rgba(255,255,255,0.03)]"
                    : "border-transparent text-[var(--silver-600)] hover:text-[var(--silver-300)]"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Metrics Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: "Active Stream", value: "Audit Pipeline Online", icon: Server, color: "text-emerald-400" },
          { label: "Pipeline Status", value: "Operational", icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Active Buffer", value: `${logs.length} Buffered Events`, icon: Layers, color: "text-[var(--silver-300)]" }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between gap-4">
              <div>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--silver-500)] font-mono">{stat.label}</span>
                <p className={`text-xs font-bold font-mono tracking-tight ${stat.color} mt-1`}>{stat.value}</p>
              </div>
              <div className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-soft)]">
                <Icon className="w-4 h-4 text-[var(--silver-400)]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* ── Left: Audit Table Terminal ── */}
        <div className="lg:col-span-8 rounded-2xl flex flex-col overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]" style={{ height: "calc(100vh - 280px)" }}>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead className="sticky top-0 z-10 bg-[var(--bg-surface)]">
                <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--silver-600)] font-mono">
                  <th className="pb-3 pl-4">Event Trigger / Scope</th>
                  <th className="pb-3 text-center w-28">Category</th>
                  <th className="pb-3 text-right pr-4">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredLogs.map((log) => {
                    const isSelected = selectedLog?.id === log.id;
                    return (
                      <motion.tr
                        key={log.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        onClick={() => setSelectedLog(log)}
                        className="group cursor-pointer"
                      >
                        <td
                          className="rounded-l-xl py-3.5 pl-4 transition-all duration-150 relative"
                          style={{
                            background: isSelected ? "var(--bg-active)" : "var(--bg-elevated)",
                            borderTop: "1px solid var(--border-subtle)",
                            borderBottom: "1px solid var(--border-subtle)"
                          }}
                        >
                          {/* Active accent vertical bar */}
                          <div className={`absolute top-0 bottom-0 left-0 w-0.5 rounded-l-xl transition-all ${
                            isSelected ? "bg-[var(--silver-400)]" : "bg-transparent group-hover:bg-[var(--border-soft)]"
                          }`} />

                          <div className="flex items-center gap-4.5 pl-1.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-[var(--bg-active)] border border-[var(--border-subtle)]">
                              {log.profiles?.profile_picture ? (
                                <img src={log.profiles.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 text-[var(--silver-500)]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-black uppercase tracking-tight font-mono text-[var(--silver-200)] group-hover:text-white transition-colors">
                                {log.action.replace(/_/g, " ")}
                              </p>
                              <p className="text-[10.5px] text-[var(--silver-600)] truncate max-w-[280px] md:max-w-[360px] mt-0.5 font-medium leading-tight">
                                {log.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td
                          className="py-3.5 text-center transition-all duration-150"
                          style={{
                            background: isSelected ? "var(--bg-active)" : "var(--bg-elevated)",
                            borderTop: "1px solid var(--border-subtle)",
                            borderBottom: "1px solid var(--border-subtle)"
                          }}
                        >
                          {(() => {
                            const c = getCategoryColor(log.category);
                            return (
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded border text-[7.5px] font-black uppercase tracking-widest font-mono"
                                style={{ background: c.bg, borderColor: c.border, color: c.text }}
                              >
                                {getCategoryIcon(log.category)}
                                {log.category.replace("_", " ")}
                              </span>
                            );
                          })()}
                        </td>

                        <td
                          className="rounded-r-xl py-3.5 pr-4 text-right transition-all duration-150 border-r border-[var(--border-subtle)]"
                          style={{
                            background: isSelected ? "var(--bg-active)" : "var(--bg-elevated)",
                            borderTop: "1px solid var(--border-subtle)",
                            borderBottom: "1px solid var(--border-subtle)"
                          }}
                        >
                          <div className="flex flex-col items-end font-mono">
                            <span className="text-[10px] font-bold text-[var(--silver-400)]">
                              {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                            <span className="text-[8px] uppercase font-black text-[var(--silver-700)] mt-0.5">
                              {new Date(log.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
                {filteredLogs.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={3} className="py-24 text-center opacity-30 select-none">
                      <Terminal className="w-10 h-10 mx-auto mb-4 text-[var(--silver-600)]" />
                      <p className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-600)]">No matching audit logs buffered</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right: Event Intelligence HUD ── */}
        <div className="lg:col-span-4 space-y-4 flex flex-col min-h-0">
          <div className="rounded-2xl flex-1 overflow-hidden flex flex-col border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="px-6 py-5 flex items-center gap-3 border-b border-[var(--border-subtle)] bg-[rgba(10,10,14,0.2)] shrink-0 select-none">
              <div className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-soft)]">
                <Eye className="w-4 h-4 text-[var(--silver-400)]" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--silver-200)] font-mono">
                  Log Intelligence
                </h3>
                <p className="text-[9px] uppercase tracking-wider text-[var(--silver-600)] font-mono">
                  Inspect raw event variables
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <AnimatePresence mode="wait">
                {selectedLog ? (
                  <motion.div key={selectedLog.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <div className="p-4.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-soft)] space-y-4 font-mono select-text">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-[var(--silver-600)]">Event UUID</label>
                        <p className="text-[8.5px] p-2 rounded bg-black/40 border border-[var(--border-subtle)] text-[var(--silver-400)] break-all">{selectedLog.id}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-[var(--silver-600)]">User Context</label>
                        <p className="text-[10px] font-extrabold text-[var(--silver-300)] break-words">
                          {selectedLog.profiles?.user_email || "Anonymous Server Service"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-[var(--silver-600)]">Description</label>
                        <p className="text-[10px] p-3 rounded-lg bg-black/30 border border-[var(--border-subtle)] text-[var(--silver-200)] leading-relaxed">
                          {selectedLog.description}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-[var(--silver-600)]">Raw Metadata Object</label>
                        <div className="p-3.5 rounded-xl bg-black/55 border border-[var(--border-subtle)] overflow-x-auto max-h-[160px] custom-scrollbar">
                          <pre className="text-[9.5px] leading-relaxed text-emerald-400/80 font-mono">
                            {JSON.stringify(selectedLog.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] select-none">
                      <Info className="w-4 h-4 text-[var(--silver-600)] shrink-0" />
                      <p className="text-[9.5px] font-mono uppercase text-[var(--silver-600)] leading-normal">
                        Logs are immutable transaction hashes stored in the centralized system vault.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-25 py-24 select-none">
                    <Terminal className="w-12 h-12 mb-4 text-[var(--silver-600)]" />
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-center font-mono text-[var(--silver-600)]">
                      Select event node<br/>for deep inspection
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-soft)] shrink-0 select-none">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 font-mono text-[var(--silver-600)]">
                <Clock className="w-3.5 h-3.5 text-[var(--silver-500)]" /> Pipeline Health
              </span>
              <span className="text-[8px] font-mono text-emerald-400 font-bold tracking-widest">STABLE OPERATIONAL</span>
            </div>
            <div className="w-full h-1 rounded-full bg-[var(--bg-active)] overflow-hidden">
              <div className="w-[99%] h-full bg-emerald-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
