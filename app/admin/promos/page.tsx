"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
  Ticket,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  AlertCircle,
  Check,
  X,
} from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  benefit: string;
  is_active: boolean;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
}

const toDatetimeLocal = (isoString: string | null | undefined) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatValidity = (start: string | null | undefined, end: string | null | undefined) => {
  if (!start && !end) return "Selamanya";
  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  if (start && !end) return `Mulai: ${formatDate(start)}`;
  if (!start && end) return `Sampai: ${formatDate(end)}`;
  return `${formatDate(start!)} s.d ${formatDate(end!)}`;
};

export default function AdminPromosPage() {
  const supabase = createClient();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);

  // Form State
  const [formCode, setFormCode] = useState("");
  const [formBenefit, setFormBenefit] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPromos(data || []);
    } catch (err) {
      console.error("Error fetching promos:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedPromo(null);
    setFormCode("");
    setFormBenefit("");
    setFormIsActive(true);
    setFormStartDate("");
    setFormEndDate("");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (promo: PromoCode) => {
    setIsEditMode(true);
    setSelectedPromo(promo);
    setFormCode(promo.code);
    setFormBenefit(promo.benefit);
    setFormIsActive(promo.is_active);
    setFormStartDate(toDatetimeLocal(promo.start_date));
    setFormEndDate(toDatetimeLocal(promo.end_date));
    setFormError("");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formBenefit.trim()) {
      setFormError("Kode dan benefit harus diisi.");
      return;
    }

    if (formStartDate && formEndDate && new Date(formStartDate) >= new Date(formEndDate)) {
      setFormError("Tanggal selesai harus setelah tanggal mulai.");
      return;
    }

    setFormSubmitting(true);
    setFormError("");

    const upperCode = formCode.trim().toUpperCase();
    const startDateValue = formStartDate ? new Date(formStartDate).toISOString() : null;
    const endDateValue = formEndDate ? new Date(formEndDate).toISOString() : null;

    try {
      if (isEditMode && selectedPromo) {
        // Update
        const { error } = await supabase
          .from("promo_codes")
          .update({
            code: upperCode,
            benefit: formBenefit.trim(),
            is_active: formIsActive,
            start_date: startDateValue,
            end_date: endDateValue,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedPromo.id);

        if (error) throw error;

        setPromos((prev) =>
          prev.map((item) =>
            item.id === selectedPromo.id
              ? {
                  ...item,
                  code: upperCode,
                  benefit: formBenefit.trim(),
                  is_active: formIsActive,
                  start_date: startDateValue,
                  end_date: endDateValue,
                  updated_at: new Date().toISOString(),
                }
              : item
          )
        );
      } else {
        // Insert
        const { data, error } = await supabase
          .from("promo_codes")
          .insert([
            {
              code: upperCode,
              benefit: formBenefit.trim(),
              is_active: formIsActive,
              start_date: startDateValue,
              end_date: endDateValue,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select();

        if (error) {
          if (error.code === "23505") {
            throw new Error("Kode diskon ini sudah ada. Harap gunakan kode unik.");
          }
          throw error;
        }

        if (data) {
          setPromos((prev) => [data[0], ...prev]);
        }
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error submitting promo:", err);
      setFormError(err.message || "Gagal menyimpan kode diskon.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      const { error } = await supabase
        .from("promo_codes")
        .update({ is_active: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      setPromos((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_active: newStatus } : item))
      );
    } catch (err) {
      console.error("Error toggling active status:", err);
      alert("Gagal merubah status aktif.");
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kode diskon "${code}" secara permanen?`)) return;
    try {
      const { error } = await supabase.from("promo_codes").delete().eq("id", id);

      if (error) throw error;

      setPromos((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting promo code:", err);
      alert("Gagal menghapus kode diskon.");
    }
  };

  const filteredPromos = promos.filter((promo) => {
    const matchesSearch =
      promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.benefit.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalActive = promos.filter((p) => p.is_active).length;
  const totalInactive = promos.filter((p) => !p.is_active).length;

  return (
    <div className="h-full flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
      
      {/* ── Header ── */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] font-black font-mono mb-1" style={{ color: "var(--silver-600)" }}>
            Discount Codes Management
          </p>
          <h1 className="text-4xl font-black tracking-tighter leading-none" style={{ color: "var(--silver-100)" }}>
            Kelola Kode Diskon
          </h1>
        </div>

        {/* Action & Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-stretch gap-2.5">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.15)] text-xs text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Aktif: <strong>{totalActive}</strong></span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)] text-xs text-rose-400">
              <XCircle className="w-3.5 h-3.5" />
              <span>Nonaktif: <strong>{totalInactive}</strong></span>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-xs font-mono font-black uppercase bg-[var(--silver-200)] text-[#0f0f13] hover:bg-[var(--silver-100)] shadow-lg hover:shadow-[0_0_16px_rgba(212,212,216,0.15)] cursor-pointer transition-all duration-200 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            Tambah Kode
          </button>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div
        className="flex-shrink-0 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 relative overflow-hidden"
        style={{
          background: "rgba(10,10,14,0.3)",
          border: "1px solid var(--border-soft)",
        }}
      >
        <div className="relative w-full md:w-80 flex items-center">
          <div className="absolute left-3 text-[var(--silver-600)] pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Cari kode atau benefit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:bg-[var(--bg-elevated)] focus:outline-none transition-all placeholder-[var(--silver-700)]"
          />
        </div>
      </div>

      {/* ── Promos Table List ── */}
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
        {loading ? (
          <div className="flex-grow flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[var(--silver-500)] border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-mono tracking-widest uppercase text-[var(--silver-500)]">
              Memuat Kode Diskon...
            </p>
          </div>
        ) : filteredPromos.length === 0 ? (
          <div
            className="flex-grow rounded-2xl border border-dashed border-[var(--border-subtle)] flex flex-col items-center justify-center text-center p-8 gap-4 select-none"
            style={{ background: "rgba(10,10,14,0.15)" }}
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center text-[var(--silver-500)]">
              <Ticket className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[var(--silver-200)]">
                Tidak ada kode diskon ditemukan
              </h3>
              <p className="text-[11px] text-[var(--silver-600)] max-w-xs font-light">
                {searchTerm
                  ? "Coba sesuaikan kata kunci pencarian Anda."
                  : "Buat kode diskon baru dengan mengeklik tombol 'Tambah Kode' di kanan atas."}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="flex-grow overflow-y-auto custom-scrollbar border rounded-2xl relative"
            style={{
              background: "rgba(10,10,14,0.3)",
              borderColor: "var(--border-soft)",
            }}
          >
            <table className="w-full border-collapse text-left">
              <thead>
                <tr
                  className="border-b text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)] select-none sticky top-0 z-10"
                  style={{
                    background: "#131318",
                    borderColor: "var(--border-soft)",
                  }}
                >
                  <th className="py-4 px-6 font-mono font-black">Kode Diskon</th>
                  <th className="py-4 px-6 font-mono font-black">Benefit / Keterangan</th>
                  <th className="py-4 px-6 font-mono font-black text-center">Status</th>
                  <th className="py-4 px-6 font-mono font-black">Masa Berlaku</th>
                  <th className="py-4 px-6 font-mono font-black">Dibuat</th>
                  <th className="py-4 px-6 font-mono font-black text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02] text-xs text-[var(--silver-300)]">
                {filteredPromos.map((promo) => (
                  <tr
                    key={promo.id}
                    className="hover:bg-white/[0.01] transition-colors"
                  >
                    {/* Code name */}
                    <td className="py-4 px-6 font-mono">
                      <span className="px-2.5 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border-soft)] text-[10px] font-black text-[var(--silver-100)] uppercase tracking-wider">
                        {promo.code}
                      </span>
                    </td>

                    {/* Benefit */}
                    <td className="py-4 px-6 font-medium text-[var(--silver-200)] max-w-xs truncate">
                      {promo.benefit}
                    </td>

                    {/* Status Toggle Button */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleActive(promo.id, promo.is_active)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border cursor-pointer select-none transition-all ${
                          promo.is_active
                            ? "bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.2)] text-emerald-400 hover:bg-[rgba(16,185,129,0.15)]"
                            : "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)] text-rose-400 hover:bg-[rgba(239,68,68,0.15)]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${promo.is_active ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                        {promo.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>

                    {/* Validity Period */}
                    <td className="py-4 px-6 text-[var(--silver-400)] font-mono text-[10px]">
                      {formatValidity(promo.start_date, promo.end_date)}
                    </td>

                    {/* Created Date */}
                    <td className="py-4 px-6 text-[var(--silver-500)] whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <Calendar className="w-3.5 h-3.5 text-[var(--silver-600)]" />
                        {new Date(promo.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(promo)}
                          className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-silver)] text-[var(--silver-400)] hover:text-white transition-all flex items-center justify-center cursor-pointer"
                          title="Edit Kode"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(promo.id, promo.code)}
                          className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-red-500/30 hover:bg-red-500/5 text-[var(--silver-400)] hover:text-red-400 transition-all flex items-center justify-center cursor-pointer"
                          title="Hapus Kode"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Premium Glassmorphic Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--border-silver)] shadow-[0_24px_50px_rgba(0,0,0,0.8)] overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #18181f 0%, #111116 100%)",
            }}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[var(--silver-400)]" />
                <h3 className="font-bold text-base text-[var(--silver-100)] tracking-tight">
                  {isEditMode ? "Edit Kode Diskon" : "Tambah Kode Diskon Baru"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-6 h-6 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--silver-500)] hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-[11px] text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Code */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-500)]">
                  Kode Diskon
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: DISKON50"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:outline-none focus:bg-[var(--bg-elevated)] transition-all font-mono uppercase tracking-wider"
                  disabled={formSubmitting}
                />
              </div>

              {/* Benefit */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-500)]">
                  Benefit / Keterangan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Potongan Rp 500.000 atau Diskon 10%"
                  value={formBenefit}
                  onChange={(e) => setFormBenefit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:outline-none focus:bg-[var(--bg-elevated)] transition-all"
                  disabled={formSubmitting}
                />
              </div>

              {/* Start & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-500)]">
                    Tanggal Mulai (Opsional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:outline-none focus:bg-[var(--bg-elevated)] transition-all font-mono"
                    disabled={formSubmitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-500)]">
                    Tanggal Selesai (Opsional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:outline-none focus:bg-[var(--bg-elevated)] transition-all font-mono"
                    disabled={formSubmitting}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <div>
                  <p className="text-[11px] font-bold text-[var(--silver-200)]">Aktifkan Kode</p>
                  <p className="text-[9px] text-[var(--silver-500)] font-light leading-none mt-0.5">
                    Izinkan client menggunakan kode ini saat pemesanan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`w-9 h-5 rounded-full relative p-0.5 transition-colors duration-200 cursor-pointer ${
                    formIsActive ? "bg-emerald-500" : "bg-zinc-800"
                  }`}
                  disabled={formSubmitting}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                      formIsActive ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-3 border-t border-white/[0.04] mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-[10px] font-mono tracking-[0.15em] font-black uppercase text-[var(--silver-400)] border border-[var(--border-soft)] hover:border-[var(--border-silver)] hover:text-white cursor-pointer transition-all"
                  disabled={formSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-[10px] font-mono tracking-[0.15em] font-black uppercase bg-[var(--silver-200)] text-[#0f0f13] hover:bg-[var(--silver-100)] shadow-lg hover:shadow-[0_0_16px_rgba(212,212,216,0.15)] cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? "Menyimpan..." : "Simpan Kode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
