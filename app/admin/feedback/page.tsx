"use client";

import { useEffect, useState } from "react";
import { createMobileClient } from "@/lib/supabase";
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Clock, 
  Smartphone, 
  Cpu, 
  Tag, 
  Check, 
  Trash2, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";

interface Feedback {
  id: string;
  created_at: string;
  user_email: string | null;
  type: "bug" | "saran";
  priority: "rendah" | "normal" | "tinggi";
  description: string;
  device_info: {
    os?: string;
    os_version?: string;
    model?: string;
  } | null;
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

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("feedbacks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
      
      // Auto-select first item if available
      if (data && data.length > 0) {
        // Find first item matching active filter
        const openItems = data.filter(f => f.status === "open");
        if (openItems.length > 0) {
          setSelectedId(openItems[0].id);
        } else {
          setSelectedId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const { error } = await supabase
        .from("feedbacks")
        .update({ status: "resolved" })
        .eq("id", id);

      if (error) throw error;
      
      setFeedbacks(prev => 
        prev.map(f => f.id === id ? { ...f, status: "resolved" as const } : f)
      );
    } catch (err) {
      console.error("Error resolving feedback:", err);
    }
  };

  const handlePriorityChange = async (id: string, newPriority: "rendah" | "normal" | "tinggi") => {
    try {
      const { error } = await supabase
        .from("feedbacks")
        .update({ priority: newPriority })
        .eq("id", id);

      if (error) throw error;
      
      setFeedbacks(prev => 
        prev.map(f => f.id === id ? { ...f, priority: newPriority } : f)
      );
    } catch (err) {
      console.error("Error updating priority:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus laporan ini secara permanen?")) return;
    
    try {
      const { error } = await supabase
        .from("feedbacks")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (err) {
      console.error("Error deleting feedback:", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  // Helper untuk urutan prioritas
  const priorityOrder = { tinggi: 0, normal: 1, rendah: 2 };

  // Filter & Urutan Data
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
      // Urutkan prioritas tinggi -> normal -> rendah
      const pDiff = (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
      if (pDiff !== 0) return pDiff;
      // Jika prioritas sama, urutkan tanggal terbaru
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const selectedFeedback = feedbacks.find(f => f.id === selectedId);

  // Statistik Ringkasan
  const totalOpenBug = feedbacks.filter(f => f.type === "bug" && f.status === "open").length;
  const totalOpenSaran = feedbacks.filter(f => f.type === "saran" && f.status === "open").length;
  const totalResolved = feedbacks.filter(f => f.status === "resolved").length;

  return (
    <div className="h-full flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000 overflow-hidden">

      {/* Header: Title (full width) */}
      <div className="flex-shrink-0 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px w-6 bg-zinc-800"></div>
            <p className="text-[10px] text-zinc-500 tracking-[0.3em] uppercase font-bold">Feedback Management</p>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-gradient leading-none">
            Masukan & Bug
          </h1>
        </div>

        {/* Stat bar — single unified glass panel */}
        <div className="glass-panel rounded-2xl flex items-stretch divide-x divide-zinc-900 overflow-hidden flex-shrink-0">
          <div className="flex items-center gap-3 px-5 py-3">
            <div className="p-1.5 rounded-lg bg-red-950/30 border border-red-500/15 text-red-400">
              <Bug className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black leading-none mb-1">Bug Aktif</p>
              <p className="text-2xl font-light text-red-500 leading-none">{totalOpenBug}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3">
            <div className="p-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/15 text-emerald-400">
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black leading-none mb-1">Saran Fitur</p>
              <p className="text-2xl font-light text-emerald-400 leading-none">{totalOpenSaran}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3">
            <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black leading-none mb-1">Selesai</p>
              <p className="text-2xl font-light text-white leading-none">{totalResolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: fills remaining height, clips overflow at page level */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: List (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl flex flex-col overflow-hidden min-h-0">
          {/* Header Controls — fixed inside left card */}
          <div className="p-5 border-b border-zinc-900 space-y-3 flex-shrink-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Cari deskripsi atau email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>

            {/* Filter Tabs Status */}
            <div className="flex border-b border-zinc-900 pb-1">
              <button
                onClick={() => { setFilterStatus("open"); }}
                className={`flex-1 pb-2 text-xs font-bold uppercase tracking-widest transition-colors relative ${
                  filterStatus === "open" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Aktif ({feedbacks.filter(f => f.status === "open").length})
                {filterStatus === "open" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white shadow-[0_0_8px_white]"></div>
                )}
              </button>
              <button
                onClick={() => { setFilterStatus("resolved"); }}
                className={`flex-1 pb-2 text-xs font-bold uppercase tracking-widest transition-colors relative ${
                  filterStatus === "resolved" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Selesai ({feedbacks.filter(f => f.status === "resolved").length})
                {filterStatus === "resolved" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white shadow-[0_0_8px_white]"></div>
                )}
              </button>
            </div>

            {/* Filter Chips Type */}
            <div className="flex gap-2">
              {(["all", "bug", "saran"] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-widest border transition-all ${
                    filterType === type 
                      ? "bg-white text-black border-white" 
                      : "bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  {type === "all" ? "Semua" : type === "bug" ? "Bug" : "Saran"}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback List — scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 min-h-0">
            {loading ? (
              <div className="text-center py-16 text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                Memuat data masukan...
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="text-center py-16 text-zinc-600 text-xs font-bold uppercase tracking-[0.15em] italic">
                Tidak ada laporan masukan ditemukan.
              </div>
            ) : (
              filteredFeedbacks.map(item => {
                const isSelected = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 active:scale-98 ${
                      isSelected
                        ? "bg-zinc-900 border-zinc-700 shadow-lg shadow-black/40"
                        : "bg-zinc-950/30 border-zinc-900/60 hover:bg-zinc-900/20 hover:border-zinc-800"
                    }`}
                  >
                    {/* Icon Type */}
                    <div className={`p-2.5 rounded-xl border mt-0.5 ${
                      item.type === "bug" 
                        ? "bg-red-950/20 text-red-500 border-red-500/10" 
                        : "bg-emerald-950/20 text-emerald-400 border-emerald-500/10"
                    }`}>
                      {item.type === "bug" ? <Bug className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
                    </div>

                    {/* Content Brief */}
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span className="text-[10px] text-zinc-400 font-bold truncate">
                          {item.user_email || "Anonim"}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider ${
                          item.priority === "tinggi" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                          item.priority === "normal" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          "bg-zinc-900 text-zinc-500 border border-zinc-800"
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 font-medium line-clamp-2 leading-relaxed mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 text-zinc-600 mt-4 transition-transform ${isSelected ? "translate-x-1 text-white" : ""}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detail (7 cols) — scrollable */}
        <div className="lg:col-span-7 glass-panel rounded-3xl flex flex-col overflow-hidden min-h-0">
          {selectedFeedback ? (
            <div className="flex flex-col h-full min-h-0">
              {/* Scrollable detail body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6 min-h-0">
                {/* Meta details header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-900">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl border ${
                      selectedFeedback.type === "bug" 
                        ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]" 
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.15)]"
                    }`}>
                      {selectedFeedback.type === "bug" ? <Bug className="w-6 h-6" /> : <Lightbulb className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Tipe Laporan</div>
                      <h2 className="text-xl font-bold tracking-tight text-white capitalize">
                        {selectedFeedback.type === "bug" ? "Bug & Kendala Sistem" : "Usulan Ide & Saran"}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-500 font-black uppercase tracking-wider mb-1">Tingkat Prioritas</div>
                      <select
                        value={selectedFeedback.priority}
                        onChange={(e) => handlePriorityChange(selectedFeedback.id, e.target.value as any)}
                        className={`text-[10px] px-2.5 py-1 rounded-xl font-black uppercase tracking-widest bg-zinc-950 border cursor-pointer focus:outline-none transition-all ${
                          selectedFeedback.priority === "tinggi" ? "text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.15)] font-extrabold animate-pulse" :
                          selectedFeedback.priority === "normal" ? "text-amber-400 border-amber-500/25 font-bold" :
                          "text-zinc-400 border-zinc-800 font-bold"
                        }`}
                      >
                        <option value="rendah" className="bg-zinc-950 text-zinc-400 font-bold">🟢 RENDAH</option>
                        <option value="normal" className="bg-zinc-950 text-amber-400 font-bold">🟡 NORMAL</option>
                        <option value="tinggi" className="bg-zinc-950 text-red-500 font-bold">🔴 TINGGI</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sender Email & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl">
                  <div>
                    <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">PENGIRIM</div>
                    <div className="text-sm font-semibold text-zinc-200 mt-0.5 truncate">
                      {selectedFeedback.user_email || "Anonymous (Tidak Login)"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">WAKTU DIKIRIM</div>
                    <div className="text-sm font-semibold text-zinc-200 mt-0.5">
                      {new Date(selectedFeedback.created_at).toLocaleString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                  </div>
                </div>

                {/* Description Body */}
                <div className="space-y-2">
                  <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">DESKRIPSI KENDALA / MASUKAN</div>
                  <div className="bg-zinc-950/20 border border-zinc-900/60 p-6 rounded-2xl text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedFeedback.description}
                  </div>
                </div>

                {/* Device Info */}
                {selectedFeedback.device_info && (
                  <div className="space-y-2">
                    <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">SPESIFIKASI HP & VERSI APLIKASI</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="p-3 bg-zinc-950/30 border border-zinc-900 rounded-xl flex items-center gap-3">
                        <Smartphone className="w-4 h-4 text-zinc-500" />
                        <div>
                          <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Model HP</div>
                          <div className="text-xs font-bold text-white capitalize">
                            {selectedFeedback.device_info.model || "-"}
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-zinc-950/30 border border-zinc-900 rounded-xl flex items-center gap-3">
                        <Cpu className="w-4 h-4 text-zinc-500" />
                        <div>
                          <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Sistem Operasi</div>
                          <div className="text-xs font-bold text-white capitalize">
                            {selectedFeedback.device_info.os} {selectedFeedback.device_info.os_version || ""}
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-zinc-950/30 border border-zinc-900 rounded-xl flex items-center gap-3">
                        <Tag className="w-4 h-4 text-zinc-500" />
                        <div>
                          <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Versi App</div>
                          <div className="text-xs font-bold text-white">
                            {selectedFeedback.app_version || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Log Section */}
                {selectedFeedback.type === "bug" && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Info className="w-3 h-3 text-red-400" /> DIAGNOSTIK ERROR LOG (errors.log)
                      </div>
                      {selectedFeedback.error_log && (
                        <button
                          onClick={() => copyToClipboard(selectedFeedback.error_log!)}
                          className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-bold text-zinc-400 hover:text-white hover:border-zinc-700 active:scale-95 transition-all flex items-center gap-1.5 uppercase tracking-wider"
                        >
                          <Copy className="w-3 h-3" />
                          {copying ? "Tersalin!" : "Salin Log"}
                        </button>
                      )}
                    </div>
                    {selectedFeedback.error_log ? (
                      <pre className="bg-zinc-950 border border-zinc-900/80 p-4 rounded-xl text-[11px] font-mono text-red-400/90 overflow-x-auto max-h-44 custom-scrollbar text-left leading-relaxed">
                        {selectedFeedback.error_log}
                      </pre>
                    ) : (
                      <div className="bg-zinc-950/30 border border-zinc-900 p-4 rounded-xl text-center text-xs text-zinc-600 font-medium italic">
                        Tidak ada log error terlampir.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Actions Row — fixed at bottom of right card */}
              <div className="flex-shrink-0 px-8 py-4 border-t border-zinc-900 flex justify-between items-center gap-4">
                <button
                  onClick={() => handleDelete(selectedFeedback.id)}
                  className="px-5 py-3 bg-zinc-950 border border-zinc-900 hover:border-red-950 hover:bg-red-500/5 hover:text-red-400 rounded-2xl text-xs text-zinc-500 transition-all flex items-center gap-2 font-bold uppercase tracking-widest active:scale-95"
                >
                  <Trash2 className="w-4 h-4" /> Hapus Laporan
                </button>

                {selectedFeedback.status === "open" ? (
                  <button
                    onClick={() => handleResolve(selectedFeedback.id)}
                    className="px-6 py-3 bg-white text-black hover:bg-zinc-200 rounded-2xl text-xs transition-all flex items-center gap-2 font-black uppercase tracking-widest active:scale-95 shadow-lg shadow-white/10"
                  >
                    <Check className="w-4 h-4 stroke-[3px]" /> Tandai Selesai
                  </button>
                ) : (
                  <span className="px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest rounded-2xl flex items-center gap-2">
                    <Check className="w-4 h-4 stroke-[3px]" /> Laporan Selesai
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 rounded-full bg-zinc-950 border border-zinc-900 text-zinc-700">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-500 uppercase tracking-widest text-xs">Pilih Masukan</h3>
                <p className="text-[10px] text-zinc-600 mt-1 max-w-xs leading-relaxed">
                  Pilih salah satu laporan bug atau saran di sebelah kiri untuk melihat rincian diagnostik & detail lengkap.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
