export interface BastModuleItem {
  name: string;
  description: string;
  status: string;
}

export interface BastData {
  id?: string;
  bast_number: string;
  handover_date: string;
  status_badge?: string;
  client_id?: string;
  task_id?: string;
  client_name: string;
  client_company: string;
  client_phone: string;
  client_email: string;
  project_title: string;
  domain_primary: string;
  domain_secondary?: string;
  domain_provider?: string;
  hosting_provider?: string;
  domain_expiry: string;
  domain_cost_yearly?: string;
  invoice_ref?: string;
  email_project: string;
  password_default: string;
  server_infra?: string;
  cms_sheets?: string;
  search_console?: string;
  sitemap?: string;
  status?: string;
  modules: BastModuleItem[];
  terms: string[];
}

export const DEFAULT_BAST_PRESET: BastData = {
  bast_number: "BAST-2026-1027",
  handover_date: "27 Oktober 2026",
  status_badge: "SELESAI (FINAL HANDOVER)",
  client_name: "Eman Jamaludin",
  client_company: "Warkop Sudut Temu",
  client_phone: "08119923257",
  client_email: "eman.mtf@gmail.com",
  project_title: "Sistem POS & Keuangan Warkop",
  domain_primary: "https://sute.web.id",
  domain_secondary: "-",
  domain_provider: "IDwebhost",
  hosting_provider: "Cloudflare",
  domain_expiry: "3 Oktober 2027",
  domain_cost_yearly: "Rp60.939 per tahun",
  invoice_ref: "INV-2026-2030 (Lunas)",
  email_project: "sute.warkop@gmail.com",
  password_default: "Sute#2026!Eman",
  server_infra: "Cloudflare Pages & D1 Engine",
  cms_sheets: "-",
  search_console: "-",
  sitemap: "-",
  modules: [
    {
      name: "Konektivitas Cetak Thermal (APK)",
      description: "Aplikasi Android mandiri (APK) untuk koneksi langsung printer Bluetooth thermal tanpa dialog peramban. Penataan layout header pas 1 baris.",
      status: "Teruji & Aktif"
    },
    {
      name: "Beban Operasional & Kas Bulanan",
      description: "Modul pencatatan biaya rutin (sewa, listrik, WiFi, gaji kru) pada Laporan Bulanan dengan kalkulasi laba bersih otomatis.",
      status: "Teruji & Aktif"
    },
    {
      name: "Peringatan Stok & Daftar Belanja WA",
      description: "Deteksi bahan baku menipis dan tombol 1-klik untuk salin daftar kebutuhan belanja langsung ke WhatsApp tim logistik.",
      status: "Teruji & Aktif"
    },
    {
      name: "Antarmuka & Responsif Mobile",
      description: "Mode Fullscreen kasir bebas gangguan, ukuran font nama menu dipertebal (high-contrast legibility), serta tata letak ramah jemari di HP/tablet.",
      status: "Teruji & Aktif"
    },
    {
      name: "Pembersihan Data Uji Coba",
      description: "Reset seluruh data transaksi dummy masa testing. Database dalam kondisi bersih siap pencatatan transaksi riil.",
      status: "Selesai (Bersih)"
    }
  ],
  terms: [
    "Peralihan Hak & Kepemilikan: Sejak dokumen ini diterbitkan, hak pengelolaan sistem, data transaksi, dan seluruh kredensial akun diserahkan sepenuhnya kepada pihak Klien.",
    "Garansi Pemeliharaan (3 Bulan): SukaMCD memberikan garansi perbaikan gratis terhadap bug atau kendala teknis sistem selama 90 hari terhitung sejak tanggal serah terima ini.",
    "Keamanan Akun: Pihak Klien diimbau untuk segera menambahkan nomor verifikasi 2 langkah (2FA) pada email master demi perlindungan keamanan jangka panjang."
  ]
};

export function generateBastHtml(data: BastData): string {
  const moduleRows = (data.modules || [])
    .map(
      (m) => `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:8px 12px;vertical-align:top;font-weight:700;color:#0f172a;font-size:11px;line-height:1.35;">${escapeHtml(m.name)}</td>
      <td style="padding:8px 12px;vertical-align:top;color:#334155;font-size:10.5px;line-height:1.4;">${escapeHtml(m.description)}</td>
      <td style="padding:8px 12px;vertical-align:top;text-align:right;font-weight:700;color:#059669;font-size:10.5px;white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">${escapeHtml(m.status || "Teruji & Aktif")}</td>
    </tr>
  `
    )
    .join("");

  const termsList = (data.terms || [])
    .map((term, idx) => {
      // Split on first colon to bold the title
      const colonIdx = term.indexOf(":");
      if (colonIdx !== -1) {
        const title = term.substring(0, colonIdx);
        const desc = term.substring(colonIdx + 1);
        return `<li style="margin-bottom:5px;"><strong>${idx + 1}. ${escapeHtml(title)}:</strong>${escapeHtml(desc)}</li>`;
      }
      return `<li style="margin-bottom:5px;">${idx + 1}. ${escapeHtml(term)}</li>`;
    })
    .join("");

  // Domain details label
  const domainExpiryFull = data.domain_cost_yearly && data.domain_cost_yearly !== "-"
    ? `${data.domain_expiry} (${data.domain_cost_yearly})`
    : data.domain_expiry;

  const domainProviderTag = data.domain_provider ? ` (${data.domain_provider.toUpperCase()})` : "";
  const domainValueWithExp = `${data.domain_primary.replace(/^https?:\/\//, "")} (Exp: ${data.domain_expiry})`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Berita Acara Serah Terima - ${escapeHtml(data.bast_number)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 11.5px;
      line-height: 1.45;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 14px;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin: 0;
      color: #09090b;
    }
    .bast-pill {
      font-size: 9.5px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 900;
      background: #09090b;
      color: #ffffff;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .tagline {
      font-size: 11px;
      color: #64748b;
      margin-top: 3px;
    }
    .subtext {
      font-size: 10.5px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #94a3b8;
      margin-top: 2px;
    }
    .bast-meta {
      text-align: right;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
    }
    .bast-no {
      font-size: 14.5px;
      font-weight: 900;
      color: #09090b;
      letter-spacing: 0.5px;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 9.5px;
      font-weight: 900;
      text-transform: uppercase;
      background: #059669;
      color: #ffffff;
      letter-spacing: 0.5px;
      margin-top: 5px;
    }
    .info-card {
      margin-top: 16px;
      padding: 12px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      font-size: 11.5px;
    }
    .section-label {
      font-size: 9px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #64748b;
      margin-bottom: 6px;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .meta-table td {
      padding: 2.5px 0;
      vertical-align: top;
    }
    .meta-label {
      width: 105px;
      color: #64748b;
    }
    .meta-sep {
      width: 12px;
      color: #94a3b8;
    }
    .meta-value {
      font-weight: 700;
      color: #0f172a;
    }
    .section-heading {
      display: flex;
      align-items: center;
      gap: 7px;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    .section-bar {
      width: 3.5px;
      height: 13px;
      background: #2563eb;
      border-radius: 2px;
    }
    .section-title {
      font-size: 10.5px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #0f172a;
    }
    .table-container {
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      overflow: hidden;
    }
    .modules-table {
      width: 100%;
      border-collapse: collapse;
    }
    .modules-table th {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 7px 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #475569;
    }
    .creds-container {
      margin-top: 14px;
      padding: 12px 14px;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
    }
    .creds-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .creds-title {
      font-size: 9.5px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #0369a1;
    }
    .creds-subtitle {
      font-size: 9.5px;
      color: #0284c7;
      font-weight: 600;
    }
    .creds-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .cred-box {
      background: #ffffff;
      border: 1px solid #e0f2fe;
      border-radius: 6px;
      padding: 7px 10px;
    }
    .cred-label {
      font-size: 8.5px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 2px;
    }
    .cred-value {
      font-size: 11px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 700;
      color: #0f172a;
      word-break: break-all;
    }
    .terms-card {
      margin-top: 13px;
      padding: 11px 14px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      font-size: 10.5px;
      line-height: 1.45;
      color: #334155;
    }
    .terms-card ol {
      margin: 0;
      padding-left: 0;
      list-style: none;
    }
    .terms-card li strong {
      color: #0f172a;
    }
    .footer {
      margin-top: 18px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      color: #94a3b8;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo-container">
        <h1 class="logo-title">SUKAMCD</h1>
        <span class="bast-pill">BERITA ACARA SERAH TERIMA (BAST)</span>
      </div>
      <div class="tagline">Official Software &amp; Technology Services</div>
      <div class="subtext">sukamcd.tech &bull; dev@sukamcd.tech</div>
    </div>
    <div class="bast-meta">
      <div class="bast-no">${escapeHtml(data.bast_number)}</div>
      <div style="color:#64748b;margin-top:3px;">Tanggal: ${escapeHtml(data.handover_date)}</div>
      <div class="status-badge">${escapeHtml(data.status_badge || "SELESAI (FINAL HANDOVER)")}</div>
    </div>
  </div>

  <div class="info-card">
    <div>
      <div class="section-label">PIHAK PENERIMA (KLIEN)</div>
      <table class="meta-table">
        <tr>
          <td class="meta-label">Nama Klien</td>
          <td class="meta-sep">:</td>
          <td class="meta-value">${escapeHtml(data.client_name)}</td>
        </tr>
        <tr>
          <td class="meta-label">Unit Usaha</td>
          <td class="meta-sep">:</td>
          <td class="meta-value">${escapeHtml(data.client_company || "-")}</td>
        </tr>
        <tr>
          <td class="meta-label">No. WhatsApp</td>
          <td class="meta-sep">:</td>
          <td class="meta-value" style="font-family:ui-monospace,monospace;">${escapeHtml(data.client_phone || "-")}</td>
        </tr>
        <tr>
          <td class="meta-label">Email Klien</td>
          <td class="meta-sep">:</td>
          <td class="meta-value" style="color:#2563eb;font-family:ui-monospace,monospace;">${escapeHtml(data.client_email || "-")}</td>
        </tr>
      </table>
    </div>

    <div>
      <div class="section-label">DETAIL PROYEK &amp; SISTEM</div>
      <table class="meta-table">
        <tr>
          <td class="meta-label" style="width:115px;">Nama Sistem</td>
          <td class="meta-sep">:</td>
          <td class="meta-value">${escapeHtml(data.project_title)}</td>
        </tr>
        <tr>
          <td class="meta-label">Domain Utama</td>
          <td class="meta-sep">:</td>
          <td class="meta-value" style="color:#2563eb;font-family:ui-monospace,monospace;">${escapeHtml(data.domain_primary || "-")}</td>
        </tr>
        <tr>
          <td class="meta-label">Jatuh Tempo Domain</td>
          <td class="meta-sep">:</td>
          <td class="meta-value">${escapeHtml(domainExpiryFull || "-")}</td>
        </tr>
        <tr>
          <td class="meta-label">Ref. Invoice</td>
          <td class="meta-sep">:</td>
          <td class="meta-value" style="font-family:ui-monospace,monospace;">${escapeHtml(data.invoice_ref || "-")}</td>
        </tr>
      </table>
    </div>
  </div>

  <div class="section-heading">
    <div class="section-bar"></div>
    <div class="section-title">LINGKUP PEKERJAAN &amp; MODUL YANG DISERAHTERIMAKAN</div>
  </div>

  <div class="table-container">
    <table class="modules-table">
      <thead>
        <tr>
          <th style="text-align:left;width:30%;">MODUL / FITUR</th>
          <th style="text-align:left;width:52%;">DESKRIPSI PENGERJAAN</th>
          <th style="text-align:right;width:18%;">STATUS</th>
        </tr>
      </thead>
      <tbody>
        ${moduleRows}
      </tbody>
    </table>
  </div>

  <div class="creds-container">
    <div class="creds-header">
      <div class="creds-title">AKUN MASTER &amp; KREDENSIAL PROYEK (MANDIRI)</div>
      <div class="creds-subtitle">Rahasia &amp; Kepemilikan Penuh Klien</div>
    </div>
    <div class="creds-grid">
      <div class="cred-box">
        <div class="cred-label">EMAIL MASTER PROYEK (GOOGLE)</div>
        <div class="cred-value">${escapeHtml(data.email_project || "-")}</div>
      </div>
      <div class="cred-box">
        <div class="cred-label">PASSWORD DEFAULT AKUN</div>
        <div class="cred-value">${escapeHtml(data.password_default || "-")}</div>
      </div>
      <div class="cred-box">
        <div class="cred-label">PENYEDIA DOMAIN${escapeHtml(domainProviderTag)}</div>
        <div class="cred-value">${escapeHtml(domainValueWithExp)}</div>
      </div>
      <div class="cred-box">
        <div class="cred-label">INFRASTRUKTUR SERVER &amp; DATABASE</div>
        <div class="cred-value">${escapeHtml(data.server_infra || "Cloudflare Pages & D1 Engine")}</div>
      </div>
    </div>
  </div>

  <div class="terms-card">
    <ol>
      ${termsList}
    </ol>
  </div>

  <div class="footer">
    <div>Dokumen resmi Berita Acara Serah Terima diterbitkan otomatis oleh Sistem Portal SukaMCD.</div>
    <div>sukamcd.tech &bull; Halaman 1 dari 1</div>
  </div>
</body>
</html>`;
}

function escapeHtml(str?: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function printBast(data: BastData): void {
  const htmlContent = generateBastHtml(data);

  const printFrame = document.createElement("iframe");
  printFrame.style.position = "fixed";
  printFrame.style.right = "0";
  printFrame.style.bottom = "0";
  printFrame.style.width = "0";
  printFrame.style.height = "0";
  printFrame.style.border = "0";
  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 1000);
    }, 400);
  }
}
