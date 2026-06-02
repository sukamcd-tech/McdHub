"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
  ShoppingBag, CheckCircle, Clock, AlertCircle, XCircle,
  Search, Phone, Mail, Calendar, Trash2, ChevronRight,
  ClipboardList, ExternalLink, RefreshCw, Ticket
} from "lucide-react";

interface Order {
  id: string;
  user_id: string | null;
  user_email: string;
  package_id: string;
  package_name: string;
  price: string;
  whatsapp: string;
  specs: string;
  addons: string[];
  description: string;
  promo_code?: string | null;
  status: "pending" | "processing" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "processing" | "completed" | "cancelled">("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      
      if (data && data.length > 0) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Order["status"]) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      setOrders(prev =>
        prev.map(order => (order.id === id ? { ...order, status: newStatus } : order))
      );
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Gagal memperbarui status pesanan.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data pesanan ini secara permanen?")) return;
    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setOrders(prev => prev.filter(order => order.id !== id));
      if (selectedId === id) {
        const remaining = orders.filter(order => order.id !== id);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Gagal menghapus pesanan.");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const selectedOrder = orders.find(order => order.id === selectedId);

  // Statistics helper
  const totalPending = orders.filter(o => o.status === "pending").length;
  const totalProcessing = orders.filter(o => o.status === "processing").length;
  const totalCompleted = orders.filter(o => o.status === "completed").length;

  return (
    <div className="h-full flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
      
      {/* ── Header ── */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] font-black font-mono mb-1" style={{ color: "var(--silver-600)" }}>
            Order Management
          </p>
          <h1 className="text-4xl font-black tracking-tighter leading-none" style={{ color: "var(--silver-100)" }}>
            Kelola Pembelian
          </h1>
        </div>

        {/* Stat Pills */}
        <div className="flex items-stretch gap-3">
          {[
            { icon: Clock, count: totalPending, label: "Menunggu", accent: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
            { icon: RefreshCw, count: totalProcessing, label: "Diproses", accent: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.2)" },
            { icon: CheckCircle, count: totalCompleted, label: "Selesai", accent: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-5 py-3 rounded-xl" style={{ background: item.bg, border: `1px solid ${item.border}` }}>
              <item.icon className={`w-4 h-4 shrink-0 ${item.label === "Diproses" ? "animate-spin [animation-duration:3s]" : ""}`} style={{ color: item.accent }} />
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
        
        {/* ── Left Side: List of Orders ── */}
        <div className="lg:col-span-5 rounded-2xl flex flex-col overflow-hidden min-h-0" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
          
          {/* List Controls */}
          <div className="p-4 flex-shrink-0 space-y-3" style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--silver-600)" }} />
              <input
                type="text"
                placeholder="Cari email, paket, kebutuhan..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm"
                style={{ background: "rgba(10,10,14,0.8)", border: "1px solid var(--border-soft)", color: "var(--silver-200)", outline: "none" }}
                onFocus={(e) => { e.target.style.borderColor = "var(--border-silver)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-soft)"; }}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {([
                { id: "all", label: "Semua" },
                { id: "pending", label: "Menunggu" },
                { id: "processing", label: "Diproses" },
                { id: "completed", label: "Selesai" },
                { id: "cancelled", label: "Batal" }
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className="flex-grow pb-2 text-[10px] font-bold uppercase tracking-wider transition-colors relative cursor-pointer text-center"
                  style={{ color: filterStatus === tab.id ? "var(--silver-100)" : "var(--silver-600)" }}
                >
                  {tab.label}
                  {filterStatus === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "var(--silver-400)" }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* List Scroll Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 min-h-0" style={{ background: "rgba(10,10,14,0.3)" }}>
            {loading ? (
              <div className="text-center py-16 text-xs font-bold uppercase tracking-widest animate-pulse font-mono" style={{ color: "var(--silver-700)" }}>
                Memuat data...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16 text-xs font-bold uppercase tracking-[0.15em] italic font-mono" style={{ color: "var(--silver-700)" }}>
                Tidak ada pesanan ditemukan.
              </div>
            ) : (
              filteredOrders.map(item => {
                const isSelected = item.id === selectedId;
                
                let badgeColor = "text-amber-400 bg-amber-950/10 border-amber-800/30";
                if (item.status === "processing") {
                  badgeColor = "text-sky-400 bg-sky-950/10 border-sky-800/30";
                } else if (item.status === "completed") {
                  badgeColor = "text-emerald-400 bg-emerald-950/10 border-emerald-800/30";
                } else if (item.status === "cancelled") {
                  badgeColor = "text-red-400 bg-red-950/10 border-red-800/30";
                }

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
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center shrink-0 mt-0.5">
                      <ShoppingBag className="w-4 h-4 text-[var(--silver-500)]" />
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold truncate" style={{ color: "var(--silver-400)" }}>
                          {item.user_email}
                        </span>
                        <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0 border leading-none ${badgeColor}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold leading-none mb-1.5" style={{ color: "var(--silver-100)" }}>
                        {item.package_name}
                      </p>
                      <p className="text-[10px] font-medium truncate mb-2" style={{ color: "var(--silver-500)" }}>
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 text-[9px]" style={{ color: "var(--silver-600)" }}>
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(item.created_at).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 mt-4 shrink-0 transition-transform ${isSelected ? "translate-x-0.5" : ""}`} style={{ color: isSelected ? "var(--silver-300)" : "var(--silver-700)" }} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Side: Detail Panel ── */}
        <div className="lg:col-span-7 rounded-2xl flex flex-col overflow-hidden min-h-0" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
          {selectedOrder ? (
            <div className="flex flex-col h-full min-h-0">
              
              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-7 space-y-6 min-h-0">
                
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl border bg-[var(--bg-surface)] border-[var(--border-soft)]">
                      <ShoppingBag className="w-5 h-5 text-[var(--silver-400)]" />
                    </div>
                    <div>
                      <span className="text-[8px] font-bold uppercase tracking-wider font-mono block mb-0.5 text-[var(--silver-600)]">Nama Paket</span>
                      <h2 className="text-lg font-bold tracking-tight text-[var(--silver-100)] leading-none mb-1">
                        {selectedOrder.package_name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-black text-[var(--silver-400)]">
                          {selectedOrder.price}
                        </span>
                        {selectedOrder.promo_code && (
                          <span className="px-2 py-0.5 rounded bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.15)] text-[8px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                            <Ticket className="w-2.5 h-2.5" />
                            Promo: {selectedOrder.promo_code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[8px] font-black uppercase tracking-wider mb-1 block font-mono text-[var(--silver-600)]">Status Pesanan</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as any)}
                      className="text-xs px-2.5 py-1.5 rounded-xl font-bold uppercase cursor-pointer focus:outline-none transition-all"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-soft)",
                        color: selectedOrder.status === "pending" ? "#f59e0b" :
                               selectedOrder.status === "processing" ? "#38bdf8" :
                               selectedOrder.status === "completed" ? "#10b981" : "#ef4444"
                      }}
                    >
                      <option value="pending" style={{ background: "#111118" }}>⏳ PENDING</option>
                      <option value="processing" style={{ background: "#111118" }}>⚙️ DIPROSES</option>
                      <option value="completed" style={{ background: "#111118" }}>✅ SELESAI</option>
                      <option value="cancelled" style={{ background: "#111118" }}>❌ BATAL</option>
                    </select>
                  </div>
                </div>

                {/* Sender Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest font-mono block mb-1 text-[var(--silver-600)]">CLIENT EMAIL</span>
                    <div className="text-sm font-semibold truncate flex items-center gap-2 text-[var(--silver-200)]">
                      <Mail className="w-3.5 h-3.5 text-[var(--silver-500)]" />
                      <span>{selectedOrder.user_email}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest font-mono block mb-1 text-[var(--silver-600)]">WHATSAPP</span>
                    <div className="text-sm font-semibold flex items-center justify-between text-[var(--silver-200)]">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[var(--silver-500)]" />
                        <span>{selectedOrder.whatsapp}</span>
                      </div>
                      <a
                        href={`https://wa.me/${selectedOrder.whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-all text-[9px] font-bold uppercase flex items-center gap-1 font-mono cursor-pointer"
                      >
                        Hubungi <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Specs Details */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest font-mono block text-[var(--silver-600)]">SPESIFIKASI PROYEK</span>
                  <pre className="p-4 rounded-xl text-[11px] font-mono whitespace-pre-wrap leading-relaxed select-text text-left" style={{ background: "rgba(10,10,14,0.9)", border: "1px solid var(--border-soft)", color: "var(--silver-400)" }}>
                    {selectedOrder.specs}
                  </pre>
                </div>

                {/* Add-ons Chips */}
                {selectedOrder.addons && selectedOrder.addons.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest font-mono block text-[var(--silver-600)]">LAYANAN TAMBAHAN (ADD-ONS)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedOrder.addons.map((addon) => (
                        <span
                          key={addon}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-soft)", color: "var(--silver-300)" }}
                        >
                          {addon}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Description */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest font-mono block text-[var(--silver-600)]">DESKRIPSI KEBUTUHAN</span>
                  <div className="p-5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap select-text" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--silver-200)" }}>
                    {selectedOrder.description}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-2 text-[9px] text-[var(--silver-600)] font-mono border-t border-[var(--border-subtle)] pt-4">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Dipesan pada: {new Date(selectedOrder.created_at).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "medium" })}</span>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex-shrink-0 px-7 py-4 flex justify-between items-center gap-4 animate-in fade-in" style={{ borderTop: "1px solid var(--border-subtle)", background: "rgba(10,10,14,0.3)" }}>
                <button
                  onClick={() => handleDelete(selectedOrder.id)}
                  className="px-5 py-3 rounded-xl text-xs flex items-center gap-2 font-bold uppercase tracking-widest cursor-pointer transition-all"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--silver-500)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.2)"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; (e.currentTarget as HTMLElement).style.color = "var(--silver-500)"; }}
                >
                  <Trash2 className="w-4 h-4" /> Hapus Pesanan
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[var(--silver-500)] uppercase tracking-wider">Status saat ini:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border tracking-wider leading-none ${
                    selectedOrder.status === "pending" ? "text-amber-400 bg-amber-950/10 border-amber-800/30" :
                    selectedOrder.status === "processing" ? "text-sky-400 bg-sky-950/10 border-sky-800/30" :
                    selectedOrder.status === "completed" ? "text-emerald-400 bg-emerald-950/10 border-emerald-800/30" :
                    "text-red-400 bg-red-950/10 border-red-800/30"
                  }`}>
                    {selectedOrder.status === "pending" ? "Menunggu" :
                     selectedOrder.status === "processing" ? "Diproses" :
                     selectedOrder.status === "completed" ? "Selesai" : "Batal"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-5 rounded-2xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                <ShoppingBag className="w-8 h-8" style={{ color: "var(--silver-700)" }} />
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-widest text-xs font-mono mb-2" style={{ color: "var(--silver-600)" }}>Pilih Pesanan</h3>
                <p className="text-[10px] max-w-xs leading-relaxed font-mono" style={{ color: "var(--silver-700)" }}>
                  Pilih salah satu pesanan di sebelah kiri untuk melihat detail transaksi dan konfigurasi kebutuhan proyek.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
