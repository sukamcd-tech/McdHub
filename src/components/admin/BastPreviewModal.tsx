import React from "react";
import { X, Printer } from "lucide-react";
import type { BastData } from "../../lib/bastPrintHelper";
import { printBast } from "../../lib/bastPrintHelper";

interface BastPreviewModalProps {
  bast: BastData;
  onClose: () => void;
}

export const BastPreviewModal: React.FC<BastPreviewModalProps> = ({ bast, onClose }) => {
  const handlePrint = () => {
    printBast(bast);
  };

  const domainExpiryFull =
    bast.domain_cost_yearly && bast.domain_cost_yearly !== "-"
      ? `${bast.domain_expiry} (${bast.domain_cost_yearly})`
      : bast.domain_expiry;

  const domainProviderTag = bast.domain_provider ? ` (${bast.domain_provider.toUpperCase()})` : "";
  const domainValueWithExp = `${(bast.domain_primary || "").replace(/^https?:\/\//, "")} (Exp: ${bast.domain_expiry || "-"})`;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[95vh] flex flex-col bg-[#141418] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#18181c] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                Pratinjau Dokumen Serah Terima (BAST)
              </h3>
              <p className="text-[10px] font-mono text-zinc-400">
                {bast.bast_number} • {bast.client_name} ({bast.client_company || "Klien"})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shadow transition-all active:scale-95"
              title="Cetak atau Simpan sebagai PDF (A4)"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / Unduh PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Scroll Area (Simulated Crisp A4 Sheet) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0c0c0e] flex justify-center">
          <div className="w-full max-w-[760px] bg-white text-zinc-900 rounded-lg shadow-2xl p-7 sm:p-10 font-sans text-xs border border-zinc-200 select-text">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-zinc-200 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-black tracking-tight text-zinc-950 font-sans">
                    SUKAMCD
                  </h1>
                  <span className="text-[9.5px] font-mono font-black bg-zinc-950 text-white px-2 py-0.5 rounded tracking-wide">
                    BERITA ACARA SERAH TERIMA (BAST)
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Official Software &amp; Technology Services
                </div>
                <div className="text-[10.5px] font-mono text-zinc-400 mt-0.5">
                  sukamcd.tech • dev@sukamcd.tech
                </div>
              </div>

              <div className="text-right font-mono text-[11px]">
                <div className="text-sm font-black text-zinc-950 tracking-wide">
                  {bast.bast_number}
                </div>
                <div className="text-zinc-500 mt-0.5">Tanggal: {bast.handover_date}</div>
                <div className="mt-1.5">
                  <span className="inline-block px-2.5 py-0.5 rounded text-[9.5px] font-black uppercase bg-emerald-600 text-white tracking-wide">
                    {bast.status_badge || "SELESAI (FINAL HANDOVER)"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2-Column Client & System Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px]">
              <div>
                <div className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 mb-2">
                  PIHAK PENERIMA (KLIEN)
                </div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="w-24 text-slate-500 py-0.5">Nama Klien</td>
                      <td className="w-3 text-slate-400">:</td>
                      <td className="font-bold text-slate-900">{bast.client_name}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 py-0.5">Unit Usaha</td>
                      <td className="text-slate-400">:</td>
                      <td className="font-bold text-slate-800">{bast.client_company || "-"}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 py-0.5">No. WhatsApp</td>
                      <td className="text-slate-400">:</td>
                      <td className="font-bold text-slate-800 font-mono">{bast.client_phone || "-"}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 py-0.5">Email Klien</td>
                      <td className="text-slate-400">:</td>
                      <td className="font-semibold text-blue-600 font-mono">{bast.client_email || "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <div className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 mb-2">
                  DETAIL PROYEK &amp; SISTEM
                </div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="w-28 text-slate-500 py-0.5">Nama Sistem</td>
                      <td className="w-3 text-slate-400">:</td>
                      <td className="font-bold text-slate-900">{bast.project_title}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 py-0.5">Domain Utama</td>
                      <td className="text-slate-400">:</td>
                      <td className="font-bold text-blue-600 font-mono truncate max-w-[170px]">
                        {bast.domain_primary || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 py-0.5">Jatuh Tempo Domain</td>
                      <td className="text-slate-400">:</td>
                      <td className="font-bold text-slate-800">{domainExpiryFull || "-"}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 py-0.5">Ref. Invoice</td>
                      <td className="text-slate-400">:</td>
                      <td className="font-bold text-slate-800 font-mono">{bast.invoice_ref || "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scope / Modules Section */}
            <div className="flex items-center gap-2 mt-4 mb-2">
              <div className="w-1 h-3.5 bg-blue-600 rounded"></div>
              <div className="text-[10.5px] font-mono font-black uppercase tracking-wide text-slate-900">
                LINGKUP PEKERJAAN &amp; MODUL YANG DISERAHTERIMAKAN
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-mono font-black uppercase tracking-wider text-slate-600">
                    <th className="py-2 px-3 w-[30%]">MODUL / FITUR</th>
                    <th className="py-2 px-3 w-[52%]">DESKRIPSI PENGERJAAN</th>
                    <th className="py-2 px-3 text-right w-[18%]">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bast.modules && bast.modules.length > 0 ? (
                    bast.modules.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 align-top font-bold text-slate-900 text-[11px] leading-snug">
                          {m.name}
                        </td>
                        <td className="py-2 px-3 align-top text-slate-600 text-[10.5px] leading-relaxed">
                          {m.description}
                        </td>
                        <td className="py-2 px-3 align-top text-right font-mono font-bold text-emerald-600 text-[10.5px] whitespace-nowrap">
                          {m.status || "Teruji & Aktif"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400 font-mono text-[10px]">
                        Tidak ada modul terdaftar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Master Credentials Box */}
            <div className="mt-4 p-3 bg-sky-50 border border-sky-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9.5px] font-mono font-black uppercase tracking-wider text-sky-800">
                  AKUN MASTER &amp; KREDENSIAL PROYEK (MANDIRI)
                </span>
                <span className="text-[9.5px] font-medium text-sky-600">
                  Rahasia &amp; Kepemilikan Penuh Klien
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-white border border-sky-100 rounded p-2">
                  <div className="text-[8.5px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    EMAIL MASTER PROYEK (GOOGLE)
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-[11px] mt-0.5">
                    {bast.email_project || "-"}
                  </div>
                </div>

                <div className="bg-white border border-sky-100 rounded p-2">
                  <div className="text-[8.5px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    PASSWORD DEFAULT AKUN
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-[11px] mt-0.5">
                    {bast.password_default || "-"}
                  </div>
                </div>

                <div className="bg-white border border-sky-100 rounded p-2">
                  <div className="text-[8.5px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    PENYEDIA DOMAIN{domainProviderTag}
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-[11px] mt-0.5">
                    {domainValueWithExp}
                  </div>
                </div>

                <div className="bg-white border border-sky-100 rounded p-2">
                  <div className="text-[8.5px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    INFRASTRUKTUR SERVER &amp; DATABASE
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-[11px] mt-0.5">
                    {bast.server_infra || "Cloudflare Pages & D1 Engine"}
                  </div>
                </div>
              </div>

              {/* Optional CMS / Tools if present */}
              {(bast.cms_sheets || bast.search_console || bast.sitemap) && (
                <div className="mt-2 pt-2 border-t border-sky-200/60 grid grid-cols-3 gap-2 text-[9.5px] font-mono text-slate-500">
                  <div>Sheets CMS: <span className="font-bold text-slate-800">{bast.cms_sheets || "-"}</span></div>
                  <div>Search Console: <span className="font-bold text-slate-800">{bast.search_console || "-"}</span></div>
                  <div>Sitemap: <span className="font-bold text-slate-800">{bast.sitemap || "-"}</span></div>
                </div>
              )}
            </div>

            {/* Terms / Clauses */}
            <div className="mt-3.5 p-3 bg-white border border-slate-200 rounded-lg text-[10.5px] text-slate-600 leading-relaxed">
              <ol className="space-y-1.5 list-none p-0 m-0">
                {(bast.terms || []).map((term, i) => {
                  const colonIdx = term.indexOf(":");
                  if (colonIdx !== -1) {
                    const title = term.substring(0, colonIdx);
                    const desc = term.substring(colonIdx + 1);
                    return (
                      <li key={i}>
                        <strong className="text-slate-900">{i + 1}. {title}:</strong>
                        <span>{desc}</span>
                      </li>
                    );
                  }
                  return (
                    <li key={i}>
                      <span className="font-bold text-slate-900">{i + 1}. </span>
                      {term}
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[9.5px] font-mono text-slate-400">
              <div>Dokumen resmi Berita Acara Serah Terima diterbitkan otomatis oleh Sistem Portal SukaMCD.</div>
              <div>sukamcd.tech • Halaman 1 dari 1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
