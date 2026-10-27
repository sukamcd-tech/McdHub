import React, { useState } from "react";
import {
  X,
  FileCheck,
  Plus,
  Trash2,
  Sparkles,
  Printer,
  Eye,
  Globe,
  Lock,
} from "lucide-react";
import type { BastData, BastModuleItem } from "../../lib/bastPrintHelper";
import { DEFAULT_BAST_PRESET } from "../../lib/bastPrintHelper";

interface BastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bastData: BastData, printImmediately?: boolean) => Promise<void>;
  onPreview: (bastData: BastData) => void;
  initialData?: BastData | null;
  clients?: Array<{ id: string; name: string; company?: string; email?: string; phone?: string }>;
  tasks?: Array<{ id: string; title: string; client_name?: string; domain_name?: string }>;
}

export const BastModal: React.FC<BastModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onPreview,
  initialData,
  clients = [],
  tasks = [],
}) => {
  const [formData, setFormData] = useState<BastData>(() => {
    if (initialData) return initialData;
    return {
      ...DEFAULT_BAST_PRESET,
      bast_number: `BAST-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      handover_date: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  });

  const [activeTab, setActiveTab] = useState<"client" | "domain" | "modules" | "terms">("client");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Preset loader
  const loadWarkopPreset = () => {
    setFormData({
      ...DEFAULT_BAST_PRESET,
      bast_number: formData.bast_number || DEFAULT_BAST_PRESET.bast_number,
    });
  };

  const handleClientSelect = (clientId: string) => {
    const c = clients.find((item) => item.id === clientId);
    if (c) {
      setFormData((prev) => ({
        ...prev,
        client_id: c.id,
        client_name: c.name,
        client_company: c.company || "",
        client_phone: c.phone || "",
        client_email: c.email || "",
      }));
    }
  };

  const handleTaskSelect = (taskId: string) => {
    const t = tasks.find((item) => item.id === taskId);
    if (t) {
      setFormData((prev) => ({
        ...prev,
        task_id: t.id,
        project_title: t.title,
        domain_primary: t.domain_name || prev.domain_primary,
      }));
    }
  };

  const handleModuleChange = (index: number, field: keyof BastModuleItem, value: string) => {
    const updated = [...formData.modules];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, modules: updated });
  };

  const addModuleRow = () => {
    setFormData({
      ...formData,
      modules: [
        ...formData.modules,
        {
          name: "",
          description: "",
          status: "Teruji & Aktif",
        },
      ],
    });
  };

  const removeModuleRow = (index: number) => {
    if (formData.modules.length <= 1) return;
    setFormData({
      ...formData,
      modules: formData.modules.filter((_, i) => i !== index),
    });
  };

  const handleTermChange = (index: number, value: string) => {
    const updated = [...formData.terms];
    updated[index] = value;
    setFormData({ ...formData, terms: updated });
  };

  const addTermRow = () => {
    setFormData({
      ...formData,
      terms: [...formData.terms, ""],
    });
  };

  const removeTermRow = (index: number) => {
    if (formData.terms.length <= 1) return;
    setFormData({
      ...formData,
      terms: formData.terms.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (printImmediately = false) => {
    if (!formData.client_name.trim()) {
      alert("Nama Klien wajib diisi!");
      return;
    }
    if (!formData.project_title.trim()) {
      alert("Nama Sistem / Proyek wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData, printImmediately);
      onClose();
    } catch (err: any) {
      alert("Gagal menyimpan BAST: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[650] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-[#141418] border border-white/[0.1] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#18181c] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-zinc-200">
              <FileCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-black font-mono uppercase tracking-wider text-zinc-100">
                {initialData ? "Edit Dokumen Serah Terima (BAST)" : "Generator Berita Acara Serah Terima (BAST)"}
              </h3>
              <p className="text-[10px] font-mono text-zinc-400">
                Format standar serah terima sistem, kredensial, dan garansi pemeliharaan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadWarkopPreset}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-zinc-300 hover:text-white text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Isi otomatis dengan data Warkop Sudut Temu (Eman Jamaludin)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Preset Warkop Sudut Temu</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-2 border-b border-white/[0.06] bg-[#121215] text-[10px] font-mono font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("client")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "client"
                ? "bg-white/[0.1] text-white border border-white/[0.15]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            1. Pihak Klien & Proyek
          </button>
          <button
            onClick={() => setActiveTab("domain")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "domain"
                ? "bg-white/[0.1] text-white border border-white/[0.15]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            2. Domain & Kredensial
          </button>
          <button
            onClick={() => setActiveTab("modules")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "modules"
                ? "bg-white/[0.1] text-white border border-white/[0.15]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            3. Lingkup Modul ({formData.modules.length})
          </button>
          <button
            onClick={() => setActiveTab("terms")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "terms"
                ? "bg-white/[0.1] text-white border border-white/[0.15]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            4. Klausul Garansi ({formData.terms.length})
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs text-zinc-300">
          {/* TAB 1: CLIENT & PROJECT */}
          {activeTab === "client" && (
            <div className="space-y-4">
              {/* Quick selectors */}
              {(clients.length > 0 || tasks.length > 0) && (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clients.length > 0 && (
                    <div>
                      <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                        Pilih Klien Terdaftar
                      </label>
                      <select
                        onChange={(e) => handleClientSelect(e.target.value)}
                        defaultValue=""
                        className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-zinc-200 text-xs focus:outline-none"
                      >
                        <option value="" disabled>-- Pilih Klien --</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id} style={{ background: "#18181b" }}>
                            {c.name} {c.company ? `(${c.company})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {tasks.length > 0 && (
                    <div>
                      <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                        Pilih Proyek / Task
                      </label>
                      <select
                        onChange={(e) => handleTaskSelect(e.target.value)}
                        defaultValue=""
                        className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-zinc-200 text-xs focus:outline-none"
                      >
                        <option value="" disabled>-- Pilih Proyek --</option>
                        {tasks.map((t) => (
                          <option key={t.id} value={t.id} style={{ background: "#18181b" }}>
                            {t.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Nomor BAST *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bast_number}
                    onChange={(e) => setFormData({ ...formData, bast_number: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 font-bold focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Tanggal Serah Terima *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 27 Oktober 2026"
                    value={formData.handover_date}
                    onChange={(e) => setFormData({ ...formData, handover_date: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Nama Klien (Penerima) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Eman Jamaludin"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Unit Usaha / Perusahaan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Warkop Sudut Temu"
                    value={formData.client_company}
                    onChange={(e) => setFormData({ ...formData, client_company: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    No. WhatsApp Klien
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 08119923257"
                    value={formData.client_phone}
                    onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Email Klien
                  </label>
                  <input
                    type="email"
                    placeholder="Contoh: eman.mtf@gmail.com"
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Nama Sistem / Proyek *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sistem POS & Keuangan Warkop"
                    value={formData.project_title}
                    onChange={(e) => setFormData({ ...formData, project_title: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 font-bold focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Referensi Invoice
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: INV-2026-2030 (Lunas)"
                    value={formData.invoice_ref}
                    onChange={(e) => setFormData({ ...formData, invoice_ref: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOMAIN & CREDENTIALS */}
          {activeTab === "domain" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  Domain &amp; Hosting
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                      Domain Utama *
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: https://sute.web.id"
                      value={formData.domain_primary}
                      onChange={(e) => setFormData({ ...formData, domain_primary: e.target.value })}
                      className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                      Domain Cadangan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: -"
                      value={formData.domain_secondary || "-"}
                      onChange={(e) => setFormData({ ...formData, domain_secondary: e.target.value })}
                      className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                      Penyedia Domain
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: IDwebhost"
                      value={formData.domain_provider || "IDwebhost"}
                      onChange={(e) => setFormData({ ...formData, domain_provider: e.target.value })}
                      className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                      Penyedia Hosting / Server
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Cloudflare"
                      value={formData.hosting_provider || "Cloudflare"}
                      onChange={(e) => setFormData({ ...formData, hosting_provider: e.target.value })}
                      className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                      Jatuh Tempo Domain
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 3 Oktober 2027"
                      value={formData.domain_expiry}
                      onChange={(e) => setFormData({ ...formData, domain_expiry: e.target.value })}
                      className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                      Estimasi Biaya Domain Tahunan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Rp60.939 per tahun"
                      value={formData.domain_cost_yearly || "Rp60.939 per tahun"}
                      onChange={(e) => setFormData({ ...formData, domain_cost_yearly: e.target.value })}
                      className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Master Account */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Akun Master &amp; Kredensial Proyek (Mandiri)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                      Email Master Proyek (Google)
                    </label>
                    <input
                      type="email"
                      placeholder="Contoh: sute.warkop@gmail.com"
                      value={formData.email_project}
                      onChange={(e) => setFormData({ ...formData, email_project: e.target.value })}
                      className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                      Password Default Akun
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Sute#2026!Eman"
                      value={formData.password_default}
                      onChange={(e) => setFormData({ ...formData, password_default: e.target.value })}
                      className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Infrastruktur Server &amp; Database
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Cloudflare Pages & D1 Engine"
                    value={formData.server_infra || "Cloudflare Pages & D1 Engine"}
                    onChange={(e) => setFormData({ ...formData, server_infra: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* CMS & Google Tools */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-200">
                  CMS &amp; Google Tools (Opsional)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                      Google Sheets CMS
                    </label>
                    <input
                      type="text"
                      placeholder="-"
                      value={formData.cms_sheets || "-"}
                      onChange={(e) => setFormData({ ...formData, cms_sheets: e.target.value })}
                      className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-1.5 text-zinc-100 focus:outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                      Search Console
                    </label>
                    <input
                      type="text"
                      placeholder="-"
                      value={formData.search_console || "-"}
                      onChange={(e) => setFormData({ ...formData, search_console: e.target.value })}
                      className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-1.5 text-zinc-100 focus:outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                      Sitemap
                    </label>
                    <input
                      type="text"
                      placeholder="-"
                      value={formData.sitemap || "-"}
                      onChange={(e) => setFormData({ ...formData, sitemap: e.target.value })}
                      className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-1.5 text-zinc-100 focus:outline-none text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MODULES */}
          {activeTab === "modules" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <p className="text-[10px] text-zinc-400">
                  Daftar fitur, aplikasi, atau modul sistem yang selesai dikerjakan &amp; diuji.
                </p>
                <button
                  type="button"
                  onClick={addModuleRow}
                  className="px-2.5 py-1 rounded bg-white/[0.08] hover:bg-white/[0.14] text-[9.5px] font-bold text-zinc-200 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Tambah Modul
                </button>
              </div>

              <div className="space-y-2.5">
                {formData.modules.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <label className="text-[8.5px] uppercase font-bold text-zinc-400 block mb-0.5">
                          Nama Modul / Fitur #{idx + 1}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Konektivitas Cetak Thermal (APK)"
                          value={m.name}
                          onChange={(e) => handleModuleChange(idx, "name", e.target.value)}
                          className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-zinc-100 font-bold focus:outline-none"
                        />
                      </div>
                      <div className="w-40">
                        <label className="text-[8.5px] uppercase font-bold text-zinc-400 block mb-0.5">
                          Status
                        </label>
                        <input
                          type="text"
                          value={m.status}
                          onChange={(e) => handleModuleChange(idx, "status", e.target.value)}
                          placeholder="Teruji & Aktif"
                          className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-emerald-400 font-bold focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeModuleRow(idx)}
                        disabled={formData.modules.length <= 1}
                        className="mt-4 p-1.5 text-zinc-500 hover:text-red-400 disabled:opacity-30 cursor-pointer"
                        title="Hapus baris modul"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="text-[8.5px] uppercase font-bold text-zinc-400 block mb-0.5">
                        Deskripsi Pengerjaan
                      </label>
                      <textarea
                        rows={2}
                        value={m.description}
                        onChange={(e) => handleModuleChange(idx, "description", e.target.value)}
                        placeholder="Rincian fitur teknis..."
                        className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TERMS & WARRANTY */}
          {activeTab === "terms" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <p className="text-[10px] text-zinc-400">
                  Klausul legal, peralihan hak kepemilikan, dan garansi pemeliharaan 3 bulan (90 hari).
                </p>
                <button
                  type="button"
                  onClick={addTermRow}
                  className="px-2.5 py-1 rounded bg-white/[0.08] hover:bg-white/[0.14] text-[9.5px] font-bold text-zinc-200 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Tambah Klausul
                </button>
              </div>

              <div className="space-y-2.5">
                {formData.terms.map((term, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="mt-2 text-zinc-500 font-mono text-xs">{idx + 1}.</span>
                    <textarea
                      rows={2}
                      value={term}
                      onChange={(e) => handleTermChange(idx, e.target.value)}
                      placeholder="Judul Klausul: Deskripsi penjelasan klausul..."
                      className="flex-1 bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeTermRow(idx)}
                      disabled={formData.terms.length <= 1}
                      className="mt-2 p-1.5 text-zinc-500 hover:text-red-400 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-[#18181c] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/[0.1] text-zinc-400 hover:text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors"
          >
            Batal
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onPreview(formData)}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-zinc-200 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Pratinjau
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.1] hover:bg-white/[0.18] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
            >
              Simpan Data
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              Simpan &amp; Cetak PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
