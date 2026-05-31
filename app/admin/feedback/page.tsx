"use client";

import { useEffect, useState } from "react";
import { createMobileClient } from "@/lib/supabase";
import {
  MessageSquare, Bug, Lightbulb, CheckCircle2, AlertTriangle,
  Search, Clock, Smartphone, Cpu, Tag, Check, Trash2, Copy,
  ChevronRight, Info
} from "lucide-react";

interface Feedback {
  id: string;
  created_at: string;
  user_email: string | null;
  type: "bug" | "saran";
  priority: "rendah" | "normal" | "tinggi";
  description: string;
  device_info: { os?: string; os_version?: string; model?: string } | null;
  app_version: string | null;
  error_log: string | null;
  status: "open" | "resolved";
}

export default function FeedbackPage() {
  const supabase = createMobileClient();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "bug" | "saran">("all");
  const [filterStatus, setFilterStatus] = useState<"open" | "resolved">("open");
  const [copying, setCopying] = useState(false);

  useEffect(() => { fetchFeedbacks(); }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("feedbacks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setFeedbacks(data || []);
      if (data && data.length > 0) {
        const openItems = data.filter(f => f.status === "open");
        setSelectedId(openItems.length > 0 ? openItems[0].id : data[0].id);
      }
    } catch (err) { console.error("Error fetching feedbacks:", err); }
    finally { setLoading(false); }
  };

  const handleResolve = async (id: string) => {
    const { error } = await supabase.from("feedbacks").update({ status: "resolved" }).eq("id", id);
    if (!error) setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: "resolved" as const } : f));
  };

  const handlePriorityChange = async (id: string, newPriority: "rendah" | "normal" | "tinggi") => {
    const { error } = await supabase.from("feedbacks").update({ priority: newPriority }).eq("id", id);
    if (!error) setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, priority: newPriority } : f));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus laporan ini secara permanen?")) return;
    const { error } = await supabase.from("feedbacks").delete().eq("id", id);
    if (!error) {
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      if (selectedId === id) setSelectedId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const priorityOrder = { tinggi: 0, normal: 1, rendah: 2 };

  const filteredFeedbacks = feedbacks
    .filter(f => {
      const matchesSearch =
        (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (f.user_email && f.user_email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === "all" || f.type === filterType;
      const matchesStatus = f.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      const pDiff = (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
      if (pDiff !== 0) return pDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const selectedFeedback = feedbacks.find(f => f.id === selectedId);
  const totalOpenBug = feedbacks.filter(f => f.type === "bug" && f.status === "open").length;
  const totalOpenSaran = feedbacks.filter(f => f.type === "saran" && f.status === "open").length;
  const totalResolved = feedbacks.filter(f => f.status === "resolved").length;

  return (
    <div className="h-full flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-end justify-between gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] font-black font-mono mb-1" style={{ color: "var(--silver-600)" }}>
            Feedback Management
          </p>
          <h1 className="text-4xl font-black tracking-tighter leading-none" style={{ color: "var(--silver-100)" }}>
            Masukan & Bug
          </h1>
        </div>

        {/* Stat Pills */}
        <div className="flex items-stretch gap-3">
          {[
            { icon: Bug, count: totalOpenBug, label: "Bug Aktif", accent: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
            { icon: Lightbulb, count: totalOpenSaran, label: "Saran", accent: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" },
            { icon: CheckCircle2, count: totalResolved, label: "Selesai", accent: "var(--silver-300)", bg: "var(--bg-elevated)", border: "var(--border-soft)" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-5 py-3 rounded-xl" style={{ background: item.bg, border: `1px solid ${item.border}` }}>
              <item.icon className="w-4 h-4 shrink-0" style={{ color: item.accent }} />
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest font-mono leading-none mb-0.5" style={{ color: "var(--silver-600)" }}>
                  {item.label}
                </p>
                <p className="text-2xl font-light leading-none" style={{ color: item.accent }}>{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
        {/* ── Left: List ── */}
        <div className="lg:col-span-5 rounded-2xl flex flex-col overflow-hidden min-h-0" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
          {/* Controls */}
          <div className="p-4 flex-shrink-0 space-y-3" style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--silver-600)" }} />
              <input
                type="text"
                placeholder="Cari deskripsi atau email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm"
                style={{ background: "rgba(10,10,14,0.8)", border: "1px solid var(--border-soft)", color: "var(--silver-200)", outline: "none" }}
                onFocus={(e) => { e.target.style.borderColor = "var(--border-silver)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-soft)"; }}
              />
            </div>

            {/* Status Tabs */}
            <div className="flex pb-1" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {(["open", "resolved"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className="flex-1 pb-2 text-xs font-bold uppercase tracking-widest transition-colors relative cursor-pointer"
                  style={{ color: filterStatus === status ? "var(--silver-100)" : "var(--silver-600)" }}
                >
                  {status === "open" ? `Aktif (${feedbacks.filter(f => f.status === "open").length})` : `Selesai (${feedbacks.filter(f => f.status === "resolved").length})`}
                  {filterStatus === status && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "var(--silver-400)" }} />
                  )}
                </button>
              ))}
            </div>

            {/* Type Chips */}
            <div className="flex gap-2">
              {(["all", "bug", "saran"] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className="px-3 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-widest transition-all cursor-pointer"
                  style={
                    filterType === type
                      ? { background: "var(--silver-200)", color: "#0f0f13", border: "1px solid var(--silver-300)" }
                      : { background: "var(--bg-hover)", color: "var(--silver-500)", border: "1px solid var(--border-subtle)" }
                  }
                  onMouseEnter={(e) => { if (filterType !== type) { (e.currentTarget as HTMLElement).style.color = "var(--silver-200)"; } }}
                  onMouseLeave={(e) => { if (filterType !== type) { (e.currentTarget as HTMLElement).style.color = "var(--silver-500)"; } }}
                >
                  {type === "all" ? "Semua" : type === "bug" ? "Bug" : "Saran"}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 min-h-0" style={{ background: "rgba(10,10,14,0.3)" }}>
            {loading ? (
              <div className="text-center py-16 text-xs font-bold uppercase tracking-widest animate-pulse font-mono" style={{ color: "var(--silver-700)" }}>
                Memuat data...
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="text-center py-16 text-xs font-bold uppercase tracking-[0.15em] italic font-mono" style={{ color: "var(--silver-700)" }}>
                Tidak ada laporan ditemukan.
              </div>
            ) : (
              filteredFeedbacks.map(item => {
                const isSelected = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className="w-full text-left p-4 rounded-xl transition-all duration-200 flex items-start gap-3 cursor-pointer"
                    style={
                      isSelected
                        ? { background: "var(--bg-active)", border: "1px solid var(--border-silver)" }
                        : { background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }
                    }
                    onMouseEnter={(e) => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-soft)"; } }}
                    onMouseLeave={(e) => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; } }}
                  >
                    <div className={`p-2 rounded-lg border mt-0.5 shrink-0 ${
                      item.type === "bug"
                        ? "bg-red-900/10 text-red-500 border-red-500/20"
                        : "bg-emerald-900/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {item.type === "bug" ? <Bug className="w-3.5 h-3.5" /> : <Lightbulb className="w-3.5 h-3.5" />}
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold truncate" style={{ color: "var(--silver-400)" }}>
                          {item.user_email || "Anonim"}
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider shrink-0 ${
                          item.priority === "tinggi" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                          item.priority === "normal" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          "border"
                        }`} style={item.priority === "rendah" ? { background: "var(--bg-hover)", color: "var(--silver-600)", borderColor: "var(--border-subtle)" } : {}}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-xs font-medium line-clamp-2 leading-relaxed mb-2" style={{ color: "var(--silver-300)" }}>
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 text-[9px]" style={{ color: "var(--silver-600)" }}>
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 mt-4 shrink-0 transition-transform ${isSelected ? "translate-x-0.5" : ""}`} style={{ color: isSelected ? "var(--silver-300)" : "var(--silver-700)" }} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: Detail ── */}
        <div className="lg:col-span-7 rounded-2xl flex flex-col overflow-hidden min-h-0" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
          {selectedFeedback ? (
            <div className="flex flex-col h-full min-h-0">
              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-7 space-y-6 min-h-0">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl border ${
                      selectedFeedback.type === "bug"
                        ? "bg-red-500/8 text-red-500 border-red-500/20"
                        : "bg-emerald-500/8 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {selectedFeedback.type === "bug" ? <Bug className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider font-mono mb-0.5" style={{ color: "var(--silver-600)" }}>Tipe Laporan</div>
                      <h2 className="text-lg font-bold tracking-tight capitalize" style={{ color: "var(--silver-100)" }}>
                        {selectedFeedback.type === "bug" ? "Bug & Kendala Sistem" : "Usulan Ide & Saran"}
                      </h2>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[8px] font-black uppercase tracking-wider mb-1 font-mono" style={{ color: "var(--silver-600)" }}>Tingkat Prioritas</div>
                    <select
                      value={selectedFeedback.priority}
                      onChange={(e) => handlePriorityChange(selectedFeedback.id, e.target.value as any)}
                      className="text-xs px-2.5 py-1.5 rounded-xl font-bold uppercase cursor-pointer focus:outline-none transition-all"
                      style={{
                        background: "var(--bg-elevated)", border: "1px solid var(--border-soft)",
                        color: selectedFeedback.priority === "tinggi" ? "#ef4444" : selectedFeedback.priority === "normal" ? "#f59e0b" : "var(--silver-500)"
                      }}
                    >
                      <option value="rendah" style={{ background: "#111118" }}>🟢 RENDAH</option>
                      <option value="normal" style={{ background: "#111118" }}>🟡 NORMAL</option>
                      <option value="tinggi" style={{ background: "#111118" }}>🔴 TINGGI</option>
                    </select>
                  </div>
                </div>

                {/* Sender & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest font-mono mb-1" style={{ color: "var(--silver-600)" }}>PENGIRIM</div>
                    <div className="text-sm font-semibold truncate" style={{ color: "var(--silver-200)" }}>{selectedFeedback.user_email || "Anonymous"}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest font-mono mb-1" style={{ color: "var(--silver-600)" }}>WAKTU DIKIRIM</div>
                    <div className="text-sm font-semibold" style={{ color: "var(--silver-200)" }}>
                      {new Date(selectedFeedback.created_at).toLocaleString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="text-[9px] font-bold uppercase tracking-widest font-mono" style={{ color: "var(--silver-600)" }}>DESKRIPSI KENDALA / MASUKAN</div>
                  <div className="p-5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--silver-200)" }}>
                    {selectedFeedback.description}
                  </div>
                </div>

                {/* Device Info */}
                {selectedFeedback.device_info && (
                  <div className="space-y-2">
                    <div className="text-[9px] font-bold uppercase tracking-widest font-mono" style={{ color: "var(--silver-600)" }}>SPESIFIKASI & VERSI APLIKASI</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { icon: Smartphone, label: "Model HP", value: selectedFeedback.device_info.model || "-" },
                        { icon: Cpu, label: "OS", value: `${selectedFeedback.device_info.os || "-"} ${selectedFeedback.device_info.os_version || ""}` },
                        { icon: Tag, label: "Versi App", value: selectedFeedback.app_version || "-" },
                      ].map((item) => (
                        <div key={item.label} className="p-3 rounded-xl flex items-center gap-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                          <item.icon className="w-4 h-4 shrink-0" style={{ color: "var(--silver-600)" }} />
                          <div>
                            <div className="text-[7px] font-bold uppercase tracking-wider font-mono mb-0.5" style={{ color: "var(--silver-700)" }}>{item.label}</div>
                            <div className="text-xs font-bold capitalize" style={{ color: "var(--silver-200)" }}>{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error Log */}
                {selectedFeedback.type === "bug" && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 font-mono" style={{ color: "var(--silver-600)" }}>
                        <Info className="w-3 h-3 text-red-500" /> DIAGNOSTIK ERROR LOG
                      </div>
                      {selectedFeedback.error_log && (
                        <button
                          onClick={() => copyToClipboard(selectedFeedback.error_log!)}
                          className="px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
                          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--silver-500)" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-silver)"; (e.currentTarget as HTMLElement).style.color = "var(--silver-200)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; (e.currentTarget as HTMLElement).style.color = "var(--silver-500)"; }}
                        >
                          <Copy className="w-3 h-3" /> {copying ? "Tersalin!" : "Salin Log"}
                        </button>
                      )}
                    </div>
                    {selectedFeedback.error_log ? (
                      <pre className="p-4 rounded-xl text-[11px] font-mono text-red-400/80 overflow-x-auto max-h-44 custom-scrollbar text-left leading-relaxed" style={{ background: "rgba(10,10,14,0.9)", border: "1px solid rgba(239,68,68,0.15)" }}>
                        {selectedFeedback.error_log}
                      </pre>
                    ) : (
                      <div className="p-4 rounded-xl text-center text-xs italic font-medium" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--silver-700)" }}>
                        Tidak ada log error terlampir.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex-shrink-0 px-7 py-4 flex justify-between items-center gap-4" style={{ borderTop: "1px solid var(--border-subtle)", background: "rgba(10,10,14,0.3)" }}>
                <button
                  onClick={() => handleDelete(selectedFeedback.id)}
                  className="px-5 py-3 rounded-xl text-xs flex items-center gap-2 font-bold uppercase tracking-widest cursor-pointer transition-all"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--silver-500)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.2)"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; (e.currentTarget as HTMLElement).style.color = "var(--silver-500)"; }}
                >
                  <Trash2 className="w-4 h-4" /> Hapus Laporan
                </button>

                {selectedFeedback.status === "open" ? (
                  <button
                    onClick={() => handleResolve(selectedFeedback.id)}
                    className="px-6 py-3 rounded-xl text-xs flex items-center gap-2 font-black uppercase tracking-widest cursor-pointer transition-all"
                    style={{ background: "var(--silver-200)", color: "#0f0f13", border: "1px solid var(--silver-300)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--silver-100)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px var(--silver-glow)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--silver-200)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                  >
                    <Check className="w-4 h-4 stroke-[2.5px]" /> Tandai Selesai
                  </button>
                ) : (
                  <span className="px-5 py-3 text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981" }}>
                    <Check className="w-4 h-4 stroke-[2.5px]" /> Selesai
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-5 rounded-2xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                <MessageSquare className="w-8 h-8" style={{ color: "var(--silver-700)" }} />
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-widest text-xs font-mono mb-2" style={{ color: "var(--silver-600)" }}>Pilih Masukan</h3>
                <p className="text-[10px] max-w-xs leading-relaxed font-mono" style={{ color: "var(--silver-700)" }}>
                  Pilih salah satu laporan bug atau saran di sebelah kiri untuk melihat rincian detail.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
