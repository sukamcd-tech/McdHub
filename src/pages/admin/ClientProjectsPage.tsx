import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Building2,
  Phone,
  Mail,
  Receipt,
  Printer,
  Trash2,
  Edit3,
  X,
  Loader2,
  UserPlus,
  RefreshCw,
  TrendingUp,
  Globe,
  ShieldCheck,
  ExternalLink,
  Lock,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";

interface ClientContact {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  status: "active" | "lead" | "completed";
  notes?: string;
  total_tasks?: number;
  total_revenue?: number;
  created_at: string;
}

interface ClientTask {
  id: string;
  client_id?: string;
  client_name?: string;
  client_company?: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  budget: number;
  paid: number;
  deadline?: string;
  domain_name?: string;
  domain_price?: number;
  staging_url?: string;
  stage_step?: number; // 1: Menunggu DP 50% & Domain, 2: Pengerjaan Staging, 3: Web ACC (Pelunasan 50%), 4: Handover & Garansi Aktif
  warranty_ends_at?: string;
  cloudflare_connected?: number;
  credentials_handed_over?: number;
  created_at: string;
}

interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
  total: number;
}

interface ClientInvoice {
  id: string;
  invoice_number: string;
  client_id?: string;
  client_name?: string;
  client_company?: string;
  client_email?: string;
  client_phone?: string;
  task_id?: string;
  invoice_type?: "dp_50" | "final_50" | "general";
  project_title: string;
  amount: number;
  status: "draft" | "pending" | "paid" | "overdue";
  issue_date: string;
  due_date: string;
  items_json?: string;
  notes?: string;
  created_at: string;
}

export const ClientProjectsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"kanban" | "clients" | "invoices">("kanban");
  
  // Data States
  const [clients, setClients] = useState<ClientContact[]>([]);
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterInvoiceStatus, setFilterInvoiceStatus] = useState<string>("all");

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ClientTask | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientContact | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<ClientInvoice | null>(null);

  // Form states
  const [taskForm, setTaskForm] = useState({
    client_id: "",
    title: "",
    description: "",
    status: "todo" as ClientTask["status"],
    priority: "medium" as ClientTask["priority"],
    budget: "",
    paid: false,
    deadline: "",
    domain_name: "",
    domain_price: "150000",
    staging_url: "",
    stage_step: 1,
    warranty_ends_at: "",
    cloudflare_connected: false,
    credentials_handed_over: false,
  });

  const [clientForm, setClientForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "active" as ClientContact["status"],
    notes: "",
  });

  const [invoiceForm, setInvoiceForm] = useState({
    invoice_number: "",
    client_id: "",
    task_id: "",
    invoice_type: "general" as "dp_50" | "final_50" | "general",
    project_title: "",
    status: "pending" as ClientInvoice["status"],
    issue_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    notes: "",
    items: [{ description: "Pengembangan Website & Sistem", qty: 1, price: 1500000, total: 1500000 }] as InvoiceItem[],
  });

  const [showFreelanceGuide, setShowFreelanceGuide] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [clientsRes, tasksRes, invRes] = await Promise.all([
        fetch("/api/clients").then((r) => r.json() as Promise<any>).catch(() => null),
        fetch("/api/clients/tasks").then((r) => r.json() as Promise<any>).catch(() => null),
        fetch("/api/clients/invoices").then((r) => r.json() as Promise<any>).catch(() => null),
      ]);

      if (clientsRes?.success && Array.isArray(clientsRes.clients)) {
        setClients(clientsRes.clients);
      }
      if (tasksRes?.success && Array.isArray(tasksRes.tasks)) {
        setTasks(tasksRes.tasks);
      }
      if (invRes?.success && Array.isArray(invRes.invoices)) {
        setInvoices(invRes.invoices);
      }
    } catch (err) {
      console.error("Error fetching client data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // ──────────────────────────────────────────────
  // TASK ACTIONS & 50-50 FREELANCE PIPELINE
  // ──────────────────────────────────────────────
  const openNewTaskModal = () => {
    setEditingTask(null);
    setTaskForm({
      client_id: selectedClientId !== "all" ? selectedClientId : clients[0]?.id || "",
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      budget: "",
      paid: false,
      deadline: "",
      domain_name: "",
      domain_price: "150000",
      staging_url: "",
      stage_step: 1,
      warranty_ends_at: "",
      cloudflare_connected: false,
      credentials_handed_over: false,
    });
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: ClientTask) => {
    setEditingTask(task);
    setTaskForm({
      client_id: task.client_id || "",
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      budget: task.budget ? String(task.budget) : "",
      paid: !!task.paid,
      deadline: task.deadline || "",
      domain_name: task.domain_name || "",
      domain_price: task.domain_price ? String(task.domain_price) : "0",
      staging_url: task.staging_url || "",
      stage_step: task.stage_step || 1,
      warranty_ends_at: task.warranty_ends_at || "",
      cloudflare_connected: !!task.cloudflare_connected,
      credentials_handed_over: !!task.credentials_handed_over,
    });
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    setIsSubmitting(true);
    try {
      const url = editingTask ? `/api/clients/tasks/${editingTask.id}` : "/api/clients/tasks";
      const method = editingTask ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: taskForm.client_id || null,
          title: taskForm.title.trim(),
          description: taskForm.description.trim(),
          status: taskForm.status,
          priority: taskForm.priority,
          budget: Number(taskForm.budget) || 0,
          paid: taskForm.paid ? 1 : 0,
          deadline: taskForm.deadline,
          domain_name: taskForm.domain_name.trim(),
          domain_price: Number(taskForm.domain_price) || 0,
          staging_url: taskForm.staging_url.trim(),
          stage_step: Number(taskForm.stage_step) || 1,
          warranty_ends_at: taskForm.warranty_ends_at || null,
          cloudflare_connected: taskForm.cloudflare_connected ? 1 : 0,
          credentials_handed_over: taskForm.credentials_handed_over ? 1 : 0,
        }),
      });

      const data = (await res.json()) as any;
      if (data.success) {
        setIsTaskModalOpen(false);
        await fetchData();
      } else {
        alert(data.error || "Gagal menyimpan task");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper Preset Invoice 1 (DP 50% + 100% Domain)
  const createDPInvoiceForTask = (task: ClientTask) => {
    const invNum = `INV-DP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const halfBudget = Math.round((Number(task.budget) || 0) * 0.5);
    const domainPrice = Number(task.domain_price) || (task.domain_name ? 150000 : 0);

    const items: InvoiceItem[] = [
      {
        description: `Down Payment (DP) 50% Jasa: ${task.title} (Total Nilai Proyek: ${formatIDR(task.budget || 0)})`,
        qty: 1,
        price: halfBudget,
        total: halfBudget,
      },
    ];

    if (domainPrice > 0 || task.domain_name) {
      items.push({
        description: `Biaya Beli Domain (100%): ${task.domain_name || "Domain Klien"}`,
        qty: 1,
        price: domainPrice,
        total: domainPrice,
      });
    }

    setInvoiceForm({
      invoice_number: invNum,
      client_id: task.client_id || "",
      task_id: task.id,
      invoice_type: "dp_50",
      project_title: `Invoice 1 (DP 50% + Domain): ${task.title}`,
      status: "pending",
      issue_date: new Date().toISOString().split("T")[0],
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      notes: `SKEMA TAHAP 1: Pembayaran DP 50% jasa (${formatIDR(halfBudget)}) dan biaya registrasi domain 100% (${formatIDR(domainPrice)}). Pengerjaan website dan setup domain akan dimulai setelah pembayaran invoice ini terkonfirmasi. Sisa pelunasan 50% (${formatIDR(halfBudget)}) dibayarkan setelah web selesai dan disetujui (ACC) di link staging preview.`,
      items,
    });
    setIsInvoiceModalOpen(true);
  };

  // Helper Preset Invoice 2 (Pelunasan 50%)
  const createFinalInvoiceForTask = (task: ClientTask) => {
    const invNum = `INV-FINAL-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const halfBudget = Math.round((Number(task.budget) || 0) * 0.5);

    const items: InvoiceItem[] = [
      {
        description: `Pelunasan 50% Jasa (Web ACC): ${task.title} (Total Nilai Proyek: ${formatIDR(task.budget || 0)})`,
        qty: 1,
        price: halfBudget,
        total: halfBudget,
      },
    ];

    setInvoiceForm({
      invoice_number: invNum,
      client_id: task.client_id || "",
      task_id: task.id,
      invoice_type: "final_50",
      project_title: `Invoice 2 (Pelunasan 50%): ${task.title}`,
      status: "pending",
      issue_date: new Date().toISOString().split("T")[0],
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      notes: `SKEMA 50%-50%: Total Kontrak Jasa: ${formatIDR(task.budget || 0)}. DP 50% sebelumnya telah lunas. Tagihan saat ini adalah Pelunasan 50% (${formatIDR(halfBudget)}) setelah web ACC. Setelah pelunasan masuk, domain Cloudflare disambungkan, kredensial diserahkan, dan masa garansi 3 bulan mulai dihitung.`,
      items,
    });
    setIsInvoiceModalOpen(true);
  };

  // Helper Print Invoice via Clean Iframe (Guaranteed Full Page A4)
  const handlePrintInvoice = (invoice: ClientInvoice) => {
    let items: InvoiceItem[] = [];
    try {
      items = invoice.items_json ? JSON.parse(invoice.items_json) : [];
    } catch {
      items = [];
    }

    const stageBadge =
      invoice.invoice_type === "dp_50"
        ? '<span style="font-size:10px;font-family:monospace;font-weight:900;text-transform:uppercase;background:#18181b;color:#fff;padding:2px 8px;border-radius:4px;letter-spacing:1px;">TAHAP 1: DP 50% & DOMAIN</span>'
        : invoice.invoice_type === "final_50"
        ? '<span style="font-size:10px;font-family:monospace;font-weight:900;text-transform:uppercase;background:#18181b;color:#fff;padding:2px 8px;border-radius:4px;letter-spacing:1px;">TAHAP 2: PELUNASAN 50% (WEB ACC)</span>'
        : '<span style="font-size:10px;font-family:monospace;font-weight:900;text-transform:uppercase;background:#18181b;color:#fff;padding:2px 8px;border-radius:4px;letter-spacing:1px;">PEMBAYARAN PENUH 100%</span>';

    const statusBadge =
      invoice.status === "paid"
        ? '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:900;text-transform:uppercase;background:#f4f4f5;color:#18181b;border:1px solid #d4d4d8;">LUNAS (PAID)</span>'
        : '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:900;text-transform:uppercase;background:#fafafa;color:#3f3f46;border:1px solid #e4e4e7;">BELUM LUNAS</span>';

    const itemsRows =
      items.length > 0
        ? items
            .map(
              (item) => `
          <tr style="border-bottom:1px solid #f4f4f5;">
            <td style="padding:10px 14px;font-family:monospace;font-size:12px;color:#18181b;font-weight:500;">${item.description}</td>
            <td style="padding:10px 14px;font-family:monospace;font-size:12px;color:#52525b;text-align:center;">${item.qty}</td>
            <td style="padding:10px 14px;font-family:monospace;font-size:12px;color:#52525b;text-align:right;">${formatIDR(item.price)}</td>
            <td style="padding:10px 14px;font-family:monospace;font-size:12px;color:#18181b;font-weight:700;text-align:right;">${formatIDR(item.total)}</td>
          </tr>
        `
            )
            .join("")
        : `<tr><td colspan="4" style="padding:14px;text-align:center;color:#a1a1aa;font-family:monospace;font-size:12px;">Tidak ada rincian item</td></tr>`;

    const notesHtml = invoice.notes
      ? `
      <div style="margin-top:18px;padding:14px 16px;background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;font-family:monospace;font-size:11.5px;color:#3f3f46;line-height:1.6;">
        <div style="font-weight:900;text-transform:uppercase;font-size:9.5px;color:#71717a;letter-spacing:1px;margin-bottom:4px;">Catatan Pembayaran:</div>
        <div>${invoice.notes}</div>
      </div>
    `
      : "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${invoice.invoice_number}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm 16mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #18181b;
            background: #fff;
          }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e4e4e7; padding-bottom: 20px; }
          .logo-title { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin: 0; color: #09090b; }
          .tagline { font-size: 12px; color: #71717a; margin-top: 4px; }
          .subtext { font-size: 11px; font-family: monospace; color: #a1a1aa; margin-top: 2px; }
          .inv-meta { text-align: right; font-family: monospace; font-size: 12px; }
          .inv-no { font-size: 16px; font-weight: 900; color: #09090b; }
          .client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 22px; font-size: 12.5px; }
          .label { font-size: 9.5px; font-family: monospace; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: #a1a1aa; margin-bottom: 5px; }
          .client-name { font-weight: 800; font-size: 14px; color: #09090b; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 22px; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; }
          .items-table th { background: #f4f4f5; border-bottom: 1px solid #e4e4e7; padding: 10px 14px; font-family: monospace; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #71717a; }
          .terms-box { margin-top: 18px; padding: 14px 16px; background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; font-family: monospace; font-size: 10.5px; color: #52525b; line-height: 1.6; }
          .terms-title { font-weight: 900; text-transform: uppercase; font-size: 9.5px; color: #3f3f46; letter-spacing: 1px; margin-bottom: 6px; }
          .footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #e4e4e7; display: flex; justify-content: space-between; font-size: 10.5px; color: #a1a1aa; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <h1 class="logo-title">SUKAMCD</h1>
              <span style="font-size:10px;font-family:monospace;font-weight:900;background:#f4f4f5;color:#3f3f46;padding:2px 6px;border-radius:4px;">INVOICE</span>
              ${stageBadge}
            </div>
            <div class="tagline">Official Software & Technology Services</div>
            <div class="subtext">sukamcd.tech • admin@sukamcd.tech</div>
          </div>
          <div class="inv-meta">
            <div class="inv-no">${invoice.invoice_number}</div>
            <div style="color:#71717a;margin-top:4px;">Terbit: ${invoice.issue_date}</div>
            <div style="color:#71717a;">Jatuh Tempo: ${invoice.due_date}</div>
            <div style="margin-top:6px;">${statusBadge}</div>
          </div>
        </div>

        <div class="client-grid">
          <div>
            <div class="label">DITAGIHKAN KEPADA:</div>
            <div class="client-name">${invoice.client_name || "Klien Umum"}</div>
            ${invoice.client_company ? `<div style="color:#52525b;margin-top:2px;">${invoice.client_company}</div>` : ""}
            ${invoice.client_email ? `<div style="color:#71717a;font-family:monospace;font-size:11px;">${invoice.client_email}</div>` : ""}
            ${invoice.client_phone ? `<div style="color:#71717a;font-family:monospace;font-size:11px;">${invoice.client_phone}</div>` : ""}
          </div>
          <div>
            <div class="label">DESKRIPSI PROYEK:</div>
            <div style="font-weight:700;color:#09090b;font-size:13px;">${invoice.project_title}</div>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="text-align:left;">Deskripsi Layanan</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Harga Satuan</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
          <tfoot>
            <tr style="background:#f4f4f5;border-top:1px solid #e4e4e7;">
              <td colspan="3" style="padding:12px 14px;text-align:right;font-family:monospace;font-weight:800;font-size:11px;text-transform:uppercase;color:#3f3f46;">TOTAL TAGIHAN:</td>
              <td style="padding:12px 14px;text-align:right;font-family:monospace;font-weight:900;font-size:15px;color:#09090b;">${formatIDR(invoice.amount)}</td>
            </tr>
          </tfoot>
        </table>

        ${notesHtml}

        <!-- Kotak Rekening Pembayaran Resmi -->
        <div style="margin-top:16px;padding:14px 18px;background:#f8fafc;border:1.5px solid #cbd5e1;border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-family:monospace;font-size:9.5px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;color:#64748b;margin-bottom:3px;">
              PEMBAYARAN DITRANSFER KE REKENING RESMI:
            </div>
            <div style="font-size:15px;font-weight:900;color:#0f172a;letter-spacing:0.5px;">
              BNI &bull; 2048222232
            </div>
            <div style="font-size:12px;color:#334155;font-weight:600;margin-top:2px;">
              A.N. FABIAN RIZKY PRATAMA
            </div>
          </div>
          <div style="text-align:right;font-family:monospace;font-size:10px;color:#64748b;">
            <div style="padding:4px 10px;background:#e2e8f0;border-radius:5px;font-weight:800;color:#1e293b;display:inline-block;">
              BANK NEGARA INDONESIA (BNI)
            </div>
            <div style="margin-top:4px;">Konfirmasi transfer via WhatsApp/Email</div>
          </div>
        </div>

        <div class="terms-box">
          <div class="terms-title">Ketentuan Skema 50% - 50% & Garansi Pemeliharaan:</div>
          <ul style="margin:0;padding-left:18px;">
            <li><strong>Tahap 1 (DP 50% + Domain 100%)</strong>: Wajib diselesaikan sebelum penulisan kode atau pembelian domain dilakukan.</li>
            <li><strong>Tahap 2 (Pelunasan 50%)</strong>: Ditagihkan setelah klien memeriksa dan menyetujui (ACC) hasil di link preview staging.</li>
            <li><strong>Serah Terima (Handover)</strong>: Sambungan DNS domain Cloudflare dan penyerahan akun/kredensial dilakukan segera setelah pelunasan diverifikasi.</li>
            <li><strong>Garansi 3 Bulan</strong>: Masa garansi perbaikan bug aktif selama 90 hari terhitung sejak tanggal serah terima.</li>
          </ul>
        </div>

        <div class="footer">
          <div>Dokumen resmi dibuat otomatis oleh Sistem Portal SukaMCD.</div>
          <div>sukamcd.tech</div>
        </div>
      </body>
      </html>
    `;

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
          document.body.removeChild(printFrame);
        }, 1000);
      }, 400);
    }
  };

  // Helper Handover Serah Terima
  const handleHandoverProject = async (task: ClientTask) => {
    if (
      !confirm(
        `Lakukan serah terima (Handover) untuk proyek "${task.title}"?\n\n• Domain utama akan ditandai aktif di Cloudflare\n• Kredensial akun/email diserahkan\n• Masa garansi 3 bulan (90 hari) otomatis aktif & dihitung!`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/clients/tasks/${task.id}/handover`, { method: "POST" });
      const data = (await res.json()) as any;
      if (data.success) {
        await fetchData();
        alert(`🚀 Serah terima berhasil!\nGaransi 3 bulan aktif hingga: ${data.warranty_ends_at}`);
      } else {
        alert(data.error || "Gagal melakukan handover");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const moveTaskStatus = async (taskId: string, newStatus: ClientTask["status"]) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await fetch(`/api/clients/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Move task failed:", err);
      fetchData();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Hapus proyek / task ini?")) return;
    try {
      await fetch(`/api/clients/tasks/${taskId}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  // ──────────────────────────────────────────────
  // CLIENT ACTIONS
  // ──────────────────────────────────────────────
  const openNewClientModal = () => {
    setEditingClient(null);
    setClientForm({
      name: "",
      company: "",
      email: "",
      phone: "",
      status: "active",
      notes: "",
    });
    setIsClientModalOpen(true);
  };

  const openEditClientModal = (client: ClientContact) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      company: client.company || "",
      email: client.email || "",
      phone: client.phone || "",
      status: client.status,
      notes: client.notes || "",
    });
    setIsClientModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim()) return;

    setIsSubmitting(true);
    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : "/api/clients";
      const method = editingClient ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientForm),
      });

      const data = (await res.json()) as any;
      if (data.success) {
        setIsClientModalOpen(false);
        await fetchData();
      } else {
        alert(data.error || "Gagal menyimpan klien");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Hapus klien ini dari direktori?")) return;
    try {
      await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
      setClients((prev) => prev.filter((c) => c.id !== clientId));
    } catch (err) {
      console.error(err);
    }
  };

  // ──────────────────────────────────────────────
  // INVOICE ACTIONS
  // ──────────────────────────────────────────────
  const openNewInvoiceModal = () => {
    const invNum = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    setInvoiceForm({
      invoice_number: invNum,
      client_id: selectedClientId !== "all" ? selectedClientId : clients[0]?.id || "",
      task_id: "",
      invoice_type: "general",
      project_title: "",
      status: "pending",
      issue_date: new Date().toISOString().split("T")[0],
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      notes: "Pembayaran dapat ditransfer via rekening resmi BNI 2048222232 a.n. Fabian Rizky Pratama.",
      items: [
        { description: "Jasa Pembuatan Website & Sistem", qty: 1, price: 3000000, total: 3000000 },
        { description: "Biaya Registrasi Domain (100%)", qty: 1, price: 150000, total: 150000 },
      ],
    });
    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...invoiceForm.items];
    const current = { ...updated[index], [field]: value };
    if (field === "qty" || field === "price") {
      current.total = (Number(current.qty) || 0) * (Number(current.price) || 0);
    }
    updated[index] = current;
    setInvoiceForm({ ...invoiceForm, items: updated });
  };

  const addInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { description: "", qty: 1, price: 0, total: 0 }],
    });
  };

  const removeInvoiceItem = (index: number) => {
    if (invoiceForm.items.length <= 1) return;
    setInvoiceForm({
      ...invoiceForm,
      items: invoiceForm.items.filter((_, i) => i !== index),
    });
  };

  const calculateInvoiceTotal = () => {
    return invoiceForm.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.project_title.trim()) {
      alert("Judul proyek/tagihan wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const totalAmount = calculateInvoiceTotal();
      const res = await fetch("/api/clients/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_number: invoiceForm.invoice_number,
          client_id: invoiceForm.client_id || null,
          task_id: invoiceForm.task_id || null,
          invoice_type: invoiceForm.invoice_type || "general",
          project_title: invoiceForm.project_title.trim(),
          amount: totalAmount,
          status: invoiceForm.status,
          issue_date: invoiceForm.issue_date,
          due_date: invoiceForm.due_date,
          items_json: JSON.stringify(invoiceForm.items),
          notes: invoiceForm.notes,
        }),
      });

      const data = (await res.json()) as any;
      if (data.success) {
        setIsInvoiceModalOpen(false);
        await fetchData();
      } else {
        alert(data.error || "Gagal membuat invoice");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId: string, status: ClientInvoice["status"]) => {
    try {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? { ...inv, status } : inv))
      );
      await fetch(`/api/clients/invoices/${invoiceId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm("Hapus faktur / invoice ini?")) return;
    try {
      await fetch(`/api/clients/invoices/${invoiceId}`, { method: "DELETE" });
      setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
    } catch (err) {
      console.error(err);
    }
  };

  // ──────────────────────────────────────────────
  // CALCULATED METRICS & FILTERING BY CLIENT
  // ──────────────────────────────────────────────
  const filteredTasksByClient = selectedClientId === "all"
    ? tasks
    : tasks.filter((t) => t.client_id === selectedClientId);

  const filteredInvoicesByClient = selectedClientId === "all"
    ? invoices
    : invoices.filter((i) => i.client_id === selectedClientId);

  const totalTasks = filteredTasksByClient.length;
  const inProgressTasks = filteredTasksByClient.filter((t) => t.status === "in_progress").length;
  const completedTasks = filteredTasksByClient.filter((t) => t.status === "done").length;
  const totalBudget = filteredTasksByClient.reduce((sum, t) => sum + (Number(t.budget) || 0), 0);

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "active").length;

  const totalInvoiced = filteredInvoicesByClient.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const paidInvoices = filteredInvoicesByClient
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const pendingInvoices = totalInvoiced - paidInvoices;

  const kanbanColumns: { id: ClientTask["status"]; title: string }[] = [
    { id: "todo", title: "Backlog / To Do" },
    { id: "in_progress", title: "In Progress" },
    { id: "review", title: "Review / QA" },
    { id: "done", title: "Completed" },
  ];

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300 select-none">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] font-black text-zinc-400 font-mono mb-1">
            Business Management Engine
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5 text-zinc-100">
            <Briefcase className="w-6 h-6 text-zinc-300" />
            Client Projects & Billing
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-[#1c1c22] border border-white/[0.08] text-zinc-400 transition-all hover:border-zinc-500/40 hover:text-white cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {activeTab === "kanban" && (
            <button
              onClick={openNewTaskModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-black uppercase text-[9.5px] tracking-widest bg-zinc-200 text-black border border-zinc-300 hover:bg-white cursor-pointer transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Tambah Task
            </button>
          )}

          {activeTab === "clients" && (
            <button
              onClick={openNewClientModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-black uppercase text-[9.5px] tracking-widest bg-zinc-200 text-black border border-zinc-300 hover:bg-white cursor-pointer transition-all active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5 stroke-[3]" />
              Tambah Klien
            </button>
          )}

          {activeTab === "invoices" && (
            <button
              onClick={openNewInvoiceModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-black uppercase text-[9.5px] tracking-widest bg-zinc-200 text-black border border-zinc-300 hover:bg-white cursor-pointer transition-all active:scale-[0.98]"
            >
              <Receipt className="w-3.5 h-3.5 stroke-[3]" />
              Buat Invoice
            </button>
          )}
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#141418] border border-white/[0.06] w-max shrink-0">
          <button
            onClick={() => setActiveTab("kanban")}
            className={`h-7 px-3 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "kanban"
                ? "bg-[#1c1c22] text-zinc-100 border border-white/[0.1] shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Kanban Tasks <span className="text-[9px] opacity-70">({totalTasks})</span>
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={`h-7 px-3 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "clients"
                ? "bg-[#1c1c22] text-zinc-100 border border-white/[0.1] shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Client Directory <span className="text-[9px] opacity-70">({totalClients})</span>
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`h-7 px-3 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "invoices"
                ? "bg-[#1c1c22] text-zinc-100 border border-white/[0.1] shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Invoices & Billing <span className="text-[9px] opacity-70">({filteredInvoicesByClient.length})</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Client Selector Dropdown */}
          <div className="h-9 flex items-center gap-2 px-3 rounded-xl bg-[#141418] border border-white/[0.08]">
            <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 shrink-0 hidden sm:inline">
              Klien:
            </span>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-zinc-100 focus:outline-none cursor-pointer max-w-[150px] sm:max-w-[200px] truncate"
            >
              <option value="all" style={{ background: "#141418" }}>
                Semua Klien (All)
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} style={{ background: "#141418" }}>
                  {c.name} {c.company ? `(${c.company})` : ""}
                </option>
              ))}
            </select>
            {selectedClientId !== "all" && (
              <button
                onClick={() => setSelectedClientId("all")}
                className="p-0.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer ml-0.5"
                title="Reset ke Semua Klien"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {activeTab === "kanban" && (
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="h-9 bg-[#141418] border border-white/[0.08] rounded-xl px-3 text-xs font-mono text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Prioritas</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          )}

          {activeTab === "invoices" && (
            <select
              value={filterInvoiceStatus}
              onChange={(e) => setFilterInvoiceStatus(e.target.value)}
              className="h-9 bg-[#141418] border border-white/[0.08] rounded-xl px-3 text-xs font-mono text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid (Lunas)</option>
              <option value="overdue">Overdue</option>
              <option value="draft">Draft</option>
            </select>
          )}

          <div className="relative flex-1 sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full bg-[#141418] border border-white/[0.08] rounded-xl pl-8.5 pr-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Active Client Filter Banner ── */}
      {selectedClientId !== "all" && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#141418] border border-white/[0.08] text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
            <span className="text-zinc-400 text-[10px] uppercase tracking-wider">Filter Klien Aktif:</span>
            <span className="text-zinc-100 font-bold">
              {clients.find((c) => c.id === selectedClientId)?.name}
              {clients.find((c) => c.id === selectedClientId)?.company
                ? ` (${clients.find((c) => c.id === selectedClientId)?.company})`
                : ""}
            </span>
            <span className="text-zinc-500 text-[10px] hidden md:inline">
              — Menampilkan khusus kanban tasks & invoices klien ini
            </span>
          </div>
          <button
            onClick={() => setSelectedClientId("all")}
            className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <X className="w-3 h-3" /> Tampilkan Semua Klien
          </button>
        </div>
      )}

      {/* ── Dynamic Content per Tab ── */}

      {/* ── TAB 1: KANBAN TASKS ── */}
      {activeTab === "kanban" && (
        <div className="space-y-4">
          {/* ── Skema 50% - 50% Freelance Safe Protocol Banner ── */}
          <div className="rounded-xl bg-[#141418] border border-white/[0.08] overflow-hidden transition-all">
            <div className="px-4 py-3 bg-black/25 flex items-center justify-between border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-300" />
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-200">
                  Protokol Skema 50% - 50% (Freelance Safe Execution)
                </span>
                <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                  SOP Standar
                </span>
              </div>
              <button
                onClick={() => setShowFreelanceGuide(!showFreelanceGuide)}
                className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                {showFreelanceGuide ? (
                  <>
                    <ChevronUp className="w-3 h-3" /> Sembunyikan SOP
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" /> Tampilkan SOP 50%-50%
                  </>
                )}
              </button>
            </div>

            {showFreelanceGuide && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
                {/* Step 1 */}
                <div className="p-3 rounded-lg bg-[#1c1c22]/80 border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-zinc-200 font-bold text-[11px]">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>1. Invoice 1 (Di Awal)</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    DP 50% jasa + 100% biaya domain. <strong className="text-zinc-200">Jangan mulai coding / beli domain</strong> sebelum invoice ini lunas.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-3 rounded-lg bg-[#1c1c22]/80 border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-zinc-200 font-bold text-[11px]">
                    <Globe className="w-3.5 h-3.5 text-zinc-400" />
                    <span>2. Pengerjaan Staging</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Kerjakan web di link preview staging (misal <code className="text-zinc-300">*.pages.dev</code>). Klien cek dan revisi di sini.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-3 rounded-lg bg-[#1c1c22]/80 border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-zinc-200 font-bold text-[11px]">
                    <Receipt className="w-3.5 h-3.5 text-zinc-400" />
                    <span>3. Invoice 2 (Pelunasan 50%)</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Kirim setelah web dites & klien ACC. <strong className="text-zinc-200">Sebelum</strong> arahkan domain utama & serahkan kredensial.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-3 rounded-lg bg-[#1c1c22]/80 border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-zinc-200 font-bold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                    <span>4. Handover & Garansi 3 Bulan</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Pelunasan masuk: langsung sambung domain Cloudflare, serahkan akun/email, dan aktifkan timer garansi 90 hari.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Summary Strip (Pipih Height) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Tasks", value: totalTasks, icon: Briefcase },
              { label: "In Progress", value: inProgressTasks, icon: Clock },
              { label: "Completed", value: completedTasks, icon: CheckCircle2 },
              { label: "Total Pipeline", value: formatIDR(totalBudget), icon: TrendingUp },
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#141418] border border-white/[0.06] flex items-center justify-between"
                >
                  <div>
                    <p className="text-[8.5px] uppercase font-mono font-black tracking-widest text-zinc-400">
                      {st.label}
                    </p>
                    <p className="text-base sm:text-lg font-black font-mono text-zinc-100 mt-0.5">
                      {st.value}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#1c1c22] border border-white/[0.06] text-zinc-400">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            {kanbanColumns.map((col) => {
              const colTasks = filteredTasksByClient.filter((t) => {
                const matchStatus = t.status === col.id;
                const matchSearch =
                  !searchQuery ||
                  t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (t.client_name && t.client_name.toLowerCase().includes(searchQuery.toLowerCase()));
                const matchPriority = filterPriority === "all" || t.priority === filterPriority;
                return matchStatus && matchSearch && matchPriority;
              });

              return (
                <div
                  key={col.id}
                  className="flex flex-col rounded-xl bg-[#141418] border border-white/[0.06] overflow-hidden"
                >
                  {/* Column Header */}
                  <div className="px-4 py-3 border-b border-white/[0.06] bg-black/20 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-300">
                      {col.title}
                    </span>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#1c1c22] border border-white/[0.08] text-zinc-400">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Task Cards Container */}
                  <div className="p-3 space-y-2.5 min-h-[350px] max-h-[600px] overflow-y-auto custom-scrollbar">
                    {colTasks.length === 0 ? (
                      <div className="h-32 flex items-center justify-center text-center text-[9px] font-mono uppercase tracking-widest text-zinc-600">
                        Tidak ada task
                      </div>
                    ) : (
                      colTasks.map((task) => {
                        const step = task.stage_step || 1;
                        // Calculate warranty days remaining if active
                        let warrantyDaysLeft: number | null = null;
                        if (task.warranty_ends_at) {
                          const diff = new Date(task.warranty_ends_at).getTime() - Date.now();
                          warrantyDaysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                        }

                        return (
                          <div
                            key={task.id}
                            className="p-3.5 rounded-lg bg-[#1c1c22] border border-white/[0.06] hover:border-white/[0.14] transition-all space-y-2.5"
                          >
                            {/* Title & Priority */}
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-black font-mono text-zinc-100 leading-snug">
                                {task.title}
                              </span>
                              <span className="text-[8px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/40 border border-white/[0.08] text-zinc-300 shrink-0">
                                {task.priority}
                              </span>
                            </div>

                            {/* Milestone 50-50 Pill */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {step === 1 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 border border-white/[0.08] text-[8.5px] font-mono text-zinc-300 font-bold">
                                  <Lock className="w-2.5 h-2.5 text-zinc-400" />
                                  <span>Step 1: Menunggu DP 50% & Domain</span>
                                </div>
                              )}
                              {step === 2 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.08] border border-white/[0.16] text-[8.5px] font-mono text-zinc-100 font-bold">
                                  <Clock className="w-2.5 h-2.5 text-zinc-300" />
                                  <span>Step 2: Pengerjaan Staging</span>
                                </div>
                              )}
                              {step === 3 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.12] border border-white/[0.22] text-[8.5px] font-mono text-white font-bold">
                                  <Receipt className="w-2.5 h-2.5 text-zinc-300" />
                                  <span>Step 3: Web ACC (Menunggu Pelunasan)</span>
                                </div>
                              )}
                              {step === 4 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-200 text-black border border-white text-[8.5px] font-mono font-black">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  <span>Step 4: Handover Selesai</span>
                                </div>
                              )}
                            </div>

                            {/* Staging Preview Link */}
                            {task.staging_url && (
                              <a
                                href={task.staging_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-2 rounded bg-black/30 border border-white/[0.06] hover:border-white/[0.16] text-[9.5px] font-mono text-zinc-300 hover:text-white transition-all group"
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <Globe className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                                  <span className="truncate">{task.staging_url}</span>
                                </span>
                                <ExternalLink className="w-3 h-3 text-zinc-500 shrink-0 ml-1" />
                              </a>
                            )}

                            {/* Domain & Cloudflare status */}
                            {task.domain_name && (
                              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 px-2 py-1 rounded bg-black/20 border border-white/[0.04]">
                                <span className="flex items-center gap-1 truncate text-zinc-300">
                                  <Globe className="w-2.5 h-2.5 text-zinc-500" />
                                  {task.domain_name}
                                </span>
                                <span className="text-[8px] uppercase tracking-wider text-zinc-400">
                                  {task.cloudflare_connected ? "✓ Cloudflare Aktif" : "Menunggu Handover"}
                                </span>
                              </div>
                            )}

                            {/* Warranty Badge (Garansi 3 Bulan) */}
                            {task.warranty_ends_at && (
                              <div className="flex items-center justify-between p-1.5 rounded bg-white/[0.04] border border-white/[0.06] text-[8.5px] font-mono text-zinc-300">
                                <span className="flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-zinc-400" />
                                  <span>Garansi 3 Bulan:</span>
                                </span>
                                <span className="font-bold text-zinc-100">
                                  {warrantyDaysLeft !== null && warrantyDaysLeft > 0
                                    ? `${warrantyDaysLeft} Hari Tersisa`
                                    : "Masa Garansi Selesai"}
                                </span>
                              </div>
                            )}

                            {task.description && (
                              <p className="text-[10px] text-zinc-400 font-mono line-clamp-2 leading-relaxed">
                                {task.description}
                              </p>
                            )}

                            {/* Client & Budget */}
                            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-1 border-t border-white/[0.04]">
                              <div className="flex items-center gap-1.5 truncate">
                                <Building2 className="w-3 h-3 text-zinc-500" />
                                <span className="truncate">{task.client_name || "Tanpa Klien"}</span>
                              </div>
                              <span className="text-zinc-200 font-bold">
                                {task.budget > 0 ? formatIDR(task.budget) : "-"}
                              </span>
                            </div>

                            {/* 50-50 Quick Actions: Generate Invoices or Handover */}
                            <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-white/[0.04]">
                              {step === 1 && (
                                <button
                                  onClick={() => createDPInvoiceForTask(task)}
                                  className="flex-1 py-1 px-2 rounded bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-[8.5px] font-mono uppercase tracking-wider text-zinc-200 hover:text-white flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                  title="Buat Faktur DP 50% + 100% Biaya Domain"
                                >
                                  <Receipt className="w-2.5 h-2.5" />
                                  + Inv DP 50%
                                </button>
                              )}
                              {(step === 2 || step === 3) && (
                                <button
                                  onClick={() => createFinalInvoiceForTask(task)}
                                  className="flex-1 py-1 px-2 rounded bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-[8.5px] font-mono uppercase tracking-wider text-zinc-200 hover:text-white flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                  title="Buat Faktur Pelunasan 50% (Web ACC)"
                                >
                                  <Receipt className="w-2.5 h-2.5" />
                                  + Inv Pelunasan
                                </button>
                              )}
                              {(step === 3 || (step === 2 && task.paid)) && (
                                <button
                                  onClick={() => handleHandoverProject(task)}
                                  className="flex-1 py-1 px-2 rounded bg-zinc-200 hover:bg-white text-black font-black border border-white text-[8.5px] font-mono uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
                                  title="Sambungkan Domain Cloudflare, Serahkan Kredensial, dan Aktifkan Garansi 3 Bulan"
                                >
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  Handover & Garansi
                                </button>
                              )}
                            </div>

                            {/* Quick Move Status / Actions */}
                            <div className="flex items-center justify-between pt-1 gap-1">
                              <div className="flex items-center gap-1">
                                {col.id !== "todo" && (
                                  <button
                                    onClick={() =>
                                      moveTaskStatus(
                                        task.id,
                                        col.id === "done"
                                          ? "review"
                                          : col.id === "review"
                                          ? "in_progress"
                                          : "todo"
                                      )
                                    }
                                    className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/30 border border-white/[0.06] text-zinc-400 hover:text-white cursor-pointer"
                                    title="Pindahkan ke status sebelumnya"
                                  >
                                    ←
                                  </button>
                                )}
                                {col.id !== "done" && (
                                  <button
                                    onClick={() =>
                                      moveTaskStatus(
                                        task.id,
                                        col.id === "todo"
                                          ? "in_progress"
                                          : col.id === "in_progress"
                                          ? "review"
                                          : "done"
                                      )
                                    }
                                    className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/30 border border-white/[0.06] text-zinc-400 hover:text-white cursor-pointer"
                                    title="Pindahkan ke status berikutnya"
                                  >
                                    →
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEditTaskModal(task)}
                                  className="p-1 rounded bg-black/30 border border-white/[0.06] text-zinc-400 hover:text-white cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1 rounded bg-black/30 border border-white/[0.06] text-zinc-400 hover:text-zinc-200 cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: CLIENT DIRECTORY ── */}
      {activeTab === "clients" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Total Klien", value: totalClients, icon: Building2 },
              { label: "Klien Aktif", value: activeClients, icon: CheckCircle2 },
              { label: "Akumulasi Revenue", value: formatIDR(paidInvoices), icon: TrendingUp },
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#141418] border border-white/[0.06] flex items-center justify-between"
                >
                  <div>
                    <p className="text-[8.5px] uppercase font-mono font-black tracking-widest text-zinc-400">
                      {st.label}
                    </p>
                    <p className="text-base sm:text-lg font-black font-mono text-zinc-100 mt-0.5">
                      {st.value}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#1c1c22] border border-white/[0.06] text-zinc-400">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Directory Cards List */}
          <div className="rounded-xl bg-[#141418] border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-black/20 text-[9px] uppercase tracking-widest text-zinc-400">
                    <th className="py-3 px-4">Nama & Perusahaan</th>
                    <th className="py-3 px-4">Kontak (Email / Phone)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Total Tugas</th>
                    <th className="py-3 px-4 text-right">Revenue Lunas</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {clients
                    .filter((c) => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        c.name.toLowerCase().includes(q) ||
                        (c.company && c.company.toLowerCase().includes(q)) ||
                        (c.email && c.email.toLowerCase().includes(q))
                      );
                    })
                    .map((client) => {
                      const isSelected = selectedClientId === client.id;
                      return (
                        <tr
                          key={client.id}
                          className={`transition-colors ${
                            isSelected
                              ? "bg-white/[0.05] border-l-2 border-l-white"
                              : "hover:bg-white/[0.02]"
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="font-bold text-zinc-100">{client.name}</p>
                                <p className="text-[10px] text-zinc-400">{client.company || "-"}</p>
                              </div>
                              {isSelected && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase bg-zinc-200 text-black">
                                  Aktif
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              {client.email && (
                                <a
                                  href={`mailto:${client.email}`}
                                  className="flex items-center gap-1.5 text-zinc-300 hover:text-white"
                                >
                                  <Mail className="w-3 h-3 text-zinc-500" />
                                  {client.email}
                                </a>
                              )}
                              {client.phone && (
                                <a
                                  href={`https://wa.me/${client.phone.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 text-zinc-400 hover:text-white"
                                >
                                  <Phone className="w-3 h-3 text-zinc-500" />
                                  {client.phone}
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                client.status === "active"
                                  ? "bg-white/[0.08] text-zinc-100 border-white/[0.18]"
                                  : "bg-black/30 text-zinc-400 border-white/[0.06]"
                              }`}
                            >
                              {client.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-300 font-bold">
                            {client.total_tasks || 0} Proyek
                          </td>
                          <td className="py-3 px-4 text-right text-zinc-100 font-bold">
                            {formatIDR(client.total_revenue || 0)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedClientId("all");
                                  } else {
                                    setSelectedClientId(client.id);
                                    setActiveTab("kanban");
                                  }
                                }}
                                className={`px-2 py-1 rounded text-[9px] font-mono uppercase tracking-wider flex items-center gap-1 border cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-zinc-200 text-black font-black border-zinc-200"
                                    : "bg-[#1c1c22] border-white/[0.06] text-zinc-300 hover:text-white hover:border-white/[0.14]"
                                }`}
                                title={isSelected ? "Batalkan Filter Klien" : "Filter Kanban & Invoices untuk klien ini"}
                              >
                                <Briefcase className="w-3 h-3" />
                                {isSelected ? "Terpilih" : "Pilih Klien"}
                              </button>
                              <button
                                onClick={() => openEditClientModal(client)}
                                className="p-1.5 rounded bg-[#1c1c22] border border-white/[0.06] text-zinc-400 hover:text-white cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClient(client.id)}
                                className="p-1.5 rounded bg-[#1c1c22] border border-white/[0.06] text-zinc-400 hover:text-zinc-200 cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {clients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500 uppercase tracking-widest text-[9.5px]">
                        Belum ada klien terdaftar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: INVOICES & BILLING ── */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Total Penagihan", value: formatIDR(totalInvoiced), icon: Receipt },
              { label: "Lunas (Paid)", value: formatIDR(paidInvoices), icon: CheckCircle2 },
              { label: "Tertunggak (Pending)", value: formatIDR(pendingInvoices), icon: Clock },
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#141418] border border-white/[0.06] flex items-center justify-between"
                >
                  <div>
                    <p className="text-[8.5px] uppercase font-mono font-black tracking-widest text-zinc-400">
                      {st.label}
                    </p>
                    <p className="text-base sm:text-lg font-black font-mono text-zinc-100 mt-0.5">
                      {st.value}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#1c1c22] border border-white/[0.06] text-zinc-400">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Invoices List Table */}
          <div className="rounded-xl bg-[#141418] border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-black/20 text-[9px] uppercase tracking-widest text-zinc-400">
                    <th className="py-3 px-4">No. Invoice</th>
                    <th className="py-3 px-4">Klien & Proyek</th>
                    <th className="py-3 px-4">Tanggal / Jatuh Tempo</th>
                    <th className="py-3 px-4 text-right">Nominal</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredInvoicesByClient
                    .filter((inv) => {
                      if (filterInvoiceStatus !== "all" && inv.status !== filterInvoiceStatus) return false;
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        inv.invoice_number.toLowerCase().includes(q) ||
                        inv.project_title.toLowerCase().includes(q) ||
                        (inv.client_name && inv.client_name.toLowerCase().includes(q))
                      );
                    })
                    .map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-bold text-zinc-100">
                          {inv.invoice_number}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-zinc-200">{inv.project_title}</p>
                          <p className="text-[10px] text-zinc-400">{inv.client_name || "Tanpa Klien"}</p>
                        </td>
                        <td className="py-3 px-4 text-zinc-400 text-[10px]">
                          <p>{inv.issue_date}</p>
                          <p className="text-zinc-500">Due: {inv.due_date}</p>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-zinc-100 text-sm">
                          {formatIDR(inv.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <select
                            value={inv.status}
                            onChange={(e) =>
                              handleUpdateInvoiceStatus(inv.id, e.target.value as ClientInvoice["status"])
                            }
                            className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border cursor-pointer bg-[#1c1c22] focus:outline-none ${
                              inv.status === "paid"
                                ? "text-zinc-100 border-white/[0.2] bg-white/[0.08]"
                                : inv.status === "overdue"
                                ? "text-zinc-300 border-white/[0.1] bg-black/40"
                                : "text-zinc-400 border-white/[0.06] bg-black/20"
                            }`}
                          >
                            <option value="pending" style={{ background: "#141418" }}>
                              PENDING
                            </option>
                            <option value="paid" style={{ background: "#141418" }}>
                              PAID (LUNAS)
                            </option>
                            <option value="draft" style={{ background: "#141418" }}>
                              DRAFT
                            </option>
                            <option value="overdue" style={{ background: "#141418" }}>
                              OVERDUE
                            </option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handlePrintInvoice(inv)}
                              className="px-2.5 py-1 rounded bg-[#1c1c22] border border-white/[0.08] text-[9px] font-mono uppercase tracking-wider text-zinc-300 hover:text-white cursor-pointer flex items-center gap-1"
                              title="Langsung Cetak / Simpan PDF"
                            >
                              <Printer className="w-3 h-3" />
                              Cetak PDF
                            </button>
                            <button
                              onClick={() => setViewingInvoice(inv)}
                              className="p-1.5 rounded bg-[#1c1c22] border border-white/[0.06] text-zinc-400 hover:text-zinc-200 cursor-pointer"
                              title="Lihat Pratinjau Slip"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(inv.id)}
                              className="p-1.5 rounded bg-[#1c1c22] border border-white/[0.06] text-zinc-400 hover:text-zinc-200 cursor-pointer"
                              title="Hapus Invoice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {filteredInvoicesByClient.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500 uppercase tracking-widest text-[9.5px]">
                        {selectedClientId !== "all" ? "Belum ada invoice untuk klien ini" : "Belum ada invoice dibuat"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────── */}
      {/* MODAL 1: ADD / EDIT TASK */}
      {/* ────────────────────────────────────────────── */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-[#141418] border border-white/[0.1] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-sm font-black font-mono uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-zinc-300" />
                {editingTask ? "Edit Client Task" : "Tambah Task Baru"}
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                  Judul Pekerjaan / Fitur *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Implementasi Payment Gateway API"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Klien Terkait
                  </label>
                  <select
                    value={taskForm.client_id}
                    onChange={(e) => setTaskForm({ ...taskForm, client_id: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
                  >
                    <option value="">-- Pilih Klien --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Kolom Status
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, status: e.target.value as ClientTask["status"] })
                    }
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
                  >
                    <option value="todo">To Do / Backlog</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review / QA</option>
                    <option value="done">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Prioritas
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, priority: e.target.value as ClientTask["priority"] })
                    }
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Total Nilai Jasa (Rp) <span className="text-zinc-500 font-normal lowercase">(di luar domain)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 3000000"
                    value={taskForm.budget}
                    onChange={(e) => setTaskForm({ ...taskForm, budget: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Tahap Skema 50%-50%
                  </label>
                  <select
                    value={taskForm.stage_step}
                    onChange={(e) => setTaskForm({ ...taskForm, stage_step: Number(e.target.value) })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
                  >
                    <option value={1}>1: Menunggu DP 50% & Domain</option>
                    <option value={2}>2: Pengerjaan Staging (Preview)</option>
                    <option value={3}>3: Web ACC (Menunggu Pelunasan 50%)</option>
                    <option value={4}>4: Handover Selesai & Garansi Aktif</option>
                  </select>
                </div>
              </div>

              {/* 50-50 Pipeline: Domain & Staging Preview */}
              <div className="p-3 rounded-lg bg-black/30 border border-white/[0.06] space-y-3">
                <p className="text-[9.5px] font-mono uppercase font-black tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                  Konfigurasi Domain & Staging Preview
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                      Domain Klien
                    </label>
                    <input
                      type="text"
                      placeholder="misal: storeklien.com"
                      value={taskForm.domain_name}
                      onChange={(e) => setTaskForm({ ...taskForm, domain_name: e.target.value })}
                      className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                      Biaya Beli Domain (Rp)
                    </label>
                    <input
                      type="number"
                      placeholder="150000"
                      value={taskForm.domain_price}
                      onChange={(e) => setTaskForm({ ...taskForm, domain_price: e.target.value })}
                      className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Link Preview Staging (*.pages.dev)
                  </label>
                  <input
                    type="url"
                    placeholder="https://preview-proyek.pages.dev"
                    value={taskForm.staging_url}
                    onChange={(e) => setTaskForm({ ...taskForm, staging_url: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                  />
                  <p className="text-[8.5px] text-zinc-500 mt-1">
                    Klien memeriksa hasil web & revisi melalui link preview ini sebelum pelunasan.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-[10px] text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={taskForm.cloudflare_connected}
                      onChange={(e) => setTaskForm({ ...taskForm, cloudflare_connected: e.target.checked })}
                      className="rounded bg-[#1c1c22] border-white/20 accent-zinc-200"
                    />
                    Domain Tersambung Cloudflare
                  </label>
                  <label className="flex items-center gap-2 text-[10px] text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={taskForm.credentials_handed_over}
                      onChange={(e) => setTaskForm({ ...taskForm, credentials_handed_over: e.target.checked })}
                      className="rounded bg-[#1c1c22] border-white/20 accent-zinc-200"
                    />
                    Akun & Kredensial Diserahkan
                  </label>
                </div>

                {taskForm.stage_step === 4 && (
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                      Masa Garansi Berakhir (Garansi 3 Bulan)
                    </label>
                    <input
                      type="date"
                      value={taskForm.warranty_ends_at}
                      onChange={(e) => setTaskForm({ ...taskForm, warranty_ends_at: e.target.value })}
                      className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                  Deskripsi / Catatan Lingkup
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail deliverable atau requirements dari klien..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#1c1c22] text-zinc-400 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-zinc-200 text-black font-bold uppercase tracking-wider hover:bg-white cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Simpan Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────── */}
      {/* MODAL 2: ADD / EDIT CLIENT */}
      {/* ────────────────────────────────────────────── */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-[#141418] border border-white/[0.1] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-sm font-black font-mono uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-zinc-300" />
                {editingClient ? "Edit Data Klien" : "Tambah Klien Baru"}
              </h3>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                  Nama Klien / Kontak *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                  Perusahaan / Instansi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: PT Digital Karya"
                  value={clientForm.company}
                  onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                  className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="klien@gmail.com"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    WhatsApp / Telepon
                  </label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                  Status Kemitraan
                </label>
                <select
                  value={clientForm.status}
                  onChange={(e) =>
                    setClientForm({ ...clientForm, status: e.target.value as ClientContact["status"] })
                  }
                  className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
                >
                  <option value="active">Active Client</option>
                  <option value="lead">Lead / Calon Klien</option>
                  <option value="completed">Completed / Alumni</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                  Catatan Klien
                </label>
                <textarea
                  rows={2}
                  placeholder="Preferensi komunikasi, scope awal, dll."
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#1c1c22] text-zinc-400 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-zinc-200 text-black font-bold uppercase tracking-wider hover:bg-white cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Simpan Klien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────── */}
      {/* MODAL 3: GENERATE NEW INVOICE */}
      {/* ────────────────────────────────────────────── */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-xl bg-[#141418] border border-white/[0.1] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-zinc-300" />
                <h3 className="text-sm font-black font-mono uppercase tracking-wider text-zinc-100">
                  Buat Faktur / Invoice Baru
                </h3>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets 50%-50% */}
            <div className="p-3 rounded-lg bg-black/30 border border-white/[0.06] space-y-2">
              <span className="text-[8.5px] uppercase font-mono font-black tracking-widest text-zinc-400 block">
                Pilih Preset Skema 50% - 50%:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const task = tasks.find((t) => t.id === invoiceForm.task_id) || tasks[0];
                    if (task) {
                      createDPInvoiceForTask(task);
                    } else {
                      setInvoiceForm({
                        ...invoiceForm,
                        invoice_type: "dp_50",
                        project_title: "Invoice 1 (DP 50% + Domain)",
                        notes: "SKEMA TAHAP 1: Pembayaran DP 50% jasa dan 100% biaya registrasi domain. Pengerjaan website dan setup domain akan dimulai setelah pembayaran invoice ini terkonfirmasi.",
                        items: [
                          { description: "Down Payment (DP) 50% Jasa Pengembangan", qty: 1, price: 1500000, total: 1500000 },
                          { description: "Biaya Beli Domain 100%", qty: 1, price: 150000, total: 150000 },
                        ],
                      });
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded text-[9px] font-mono uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-1 ${
                    invoiceForm.invoice_type === "dp_50"
                      ? "bg-zinc-200 text-black font-black border-zinc-200"
                      : "bg-[#1c1c22] border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/[0.16]"
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  Preset DP 50% + Domain
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const task = tasks.find((t) => t.id === invoiceForm.task_id) || tasks[0];
                    if (task) {
                      createFinalInvoiceForTask(task);
                    } else {
                      setInvoiceForm({
                        ...invoiceForm,
                        invoice_type: "final_50",
                        project_title: "Invoice 2 (Pelunasan 50% - Web ACC)",
                        notes: "SKEMA TAHAP 2: Pelunasan 50% jasa setelah website disetujui (ACC). Setelah pembayaran terverifikasi, domain utama akan disambungkan ke Cloudflare, kredensial diserahkan, dan garansi pemeliharaan 3 bulan mulai aktif.",
                        items: [
                          { description: "Pelunasan 50% Jasa Pengembangan (Final)", qty: 1, price: 1500000, total: 1500000 },
                        ],
                      });
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded text-[9px] font-mono uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-1 ${
                    invoiceForm.invoice_type === "final_50"
                      ? "bg-zinc-200 text-black font-black border-zinc-200"
                      : "bg-[#1c1c22] border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/[0.16]"
                  }`}
                >
                  <Receipt className="w-3 h-3" />
                  Preset Pelunasan 50%
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const task = tasks.find((t) => t.id === invoiceForm.task_id) || tasks[0];
                    if (task) {
                      const fullBudget = Number(task.budget) || 0;
                      const domainPrice = Number(task.domain_price) || (task.domain_name ? 150000 : 0);
                      const items: InvoiceItem[] = [
                        {
                          description: `Pembayaran Penuh 100% Jasa: ${task.title}`,
                          qty: 1,
                          price: fullBudget,
                          total: fullBudget,
                        },
                      ];
                      if (domainPrice > 0 || task.domain_name) {
                        items.push({
                          description: `Biaya Registrasi Domain (100%): ${task.domain_name || "Domain Klien"}`,
                          qty: 1,
                          price: domainPrice,
                          total: domainPrice,
                        });
                      }
                      setInvoiceForm({
                        ...invoiceForm,
                        invoice_type: "general",
                        project_title: `Invoice Penuh 100% (Jasa + Domain): ${task.title}`,
                        notes: `PEMBAYARAN PENUH 100%: Total nilai proyek ${formatIDR(fullBudget + domainPrice)} (Jasa ${formatIDR(fullBudget)} + Domain ${formatIDR(domainPrice)}). Pembayaran ditransfer via rekening resmi BNI.`,
                        items,
                      });
                    } else {
                      setInvoiceForm({
                        ...invoiceForm,
                        invoice_type: "general",
                        project_title: "Invoice Penuh 100% (Jasa + Domain)",
                        notes: "PEMBAYARAN PENUH 100%: Pembayaran ditransfer via rekening resmi BNI.",
                        items: [
                          { description: "Pembayaran Penuh 100% Jasa Pembuatan Website", qty: 1, price: 3000000, total: 3000000 },
                          { description: "Biaya Registrasi Domain 100%", qty: 1, price: 150000, total: 150000 },
                        ],
                      });
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded text-[9px] font-mono uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-1 ${
                    invoiceForm.invoice_type === "general" && invoiceForm.items.length > 1
                      ? "bg-zinc-200 text-black font-black border-zinc-200"
                      : "bg-[#1c1c22] border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/[0.16]"
                  }`}
                >
                  <Receipt className="w-3 h-3" />
                  Full 100% (Jasa + Domain)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const task = tasks.find((t) => t.id === invoiceForm.task_id) || tasks[0];
                    const fullBudget = task ? Number(task.budget) || 0 : 3000000;
                    setInvoiceForm({
                      ...invoiceForm,
                      invoice_type: "general",
                      project_title: task ? `Invoice Jasa 100%: ${task.title}` : "Invoice Jasa 100%",
                      notes: `PEMBAYARAN KHUSUS JASA 100%: Total nilai jasa ${formatIDR(fullBudget)}. Pembayaran ditransfer via rekening resmi BNI.`,
                      items: [
                        {
                          description: task ? `Pembayaran Penuh 100% Jasa: ${task.title}` : "Pembayaran Penuh 100% Jasa Pembuatan Website",
                          qty: 1,
                          price: fullBudget,
                          total: fullBudget,
                        },
                      ],
                    });
                  }}
                  className="px-2.5 py-1.5 rounded text-[9px] font-mono uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-1 bg-[#1c1c22] border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/[0.16]"
                >
                  <Briefcase className="w-3 h-3" />
                  Jasa 100% Doang
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const task = tasks.find((t) => t.id === invoiceForm.task_id) || tasks[0];
                    const domainPrice = task ? Number(task.domain_price) || 150000 : 150000;
                    const domainName = task?.domain_name || "Domain Klien";
                    setInvoiceForm({
                      ...invoiceForm,
                      invoice_type: "general",
                      project_title: `Tagihan Registrasi Domain: ${domainName}`,
                      notes: `PEMBAYARAN KHUSUS DOMAIN 100%: Biaya registrasi domain ${domainName} sebesar ${formatIDR(domainPrice)}. Pembayaran ditransfer via rekening resmi BNI.`,
                      items: [
                        {
                          description: `Biaya Registrasi Domain 100%: ${domainName}`,
                          qty: 1,
                          price: domainPrice,
                          total: domainPrice,
                        },
                      ],
                    });
                  }}
                  className="px-2.5 py-1.5 rounded text-[9px] font-mono uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-1 bg-[#1c1c22] border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/[0.16]"
                >
                  <Globe className="w-3 h-3" />
                  Domain 100% Doang
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-3 font-mono text-xs">
              {/* Linked Task & Client */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Hubungkan ke Proyek / Task (Untuk Hitung Full Otomatis)
                  </label>
                  <select
                    value={invoiceForm.task_id}
                    onChange={(e) => {
                      const taskId = e.target.value;
                      const selectedTask = tasks.find((t) => t.id === taskId);
                      if (selectedTask) {
                        const halfBudget = Math.round((Number(selectedTask.budget) || 0) * 0.5);
                        const domainPrice = Number(selectedTask.domain_price) || (selectedTask.domain_name ? 150000 : 0);

                        let newItems = invoiceForm.items;
                        let newNotes = invoiceForm.notes;
                        let newTitle = selectedTask.title;

                        if (invoiceForm.invoice_type === "dp_50") {
                          newTitle = `Invoice 1 (DP 50% + Domain): ${selectedTask.title}`;
                          newItems = [
                            {
                              description: `Down Payment (DP) 50% Jasa: ${selectedTask.title} (Total Kontrak: ${formatIDR(selectedTask.budget || 0)})`,
                              qty: 1,
                              price: halfBudget,
                              total: halfBudget,
                            },
                          ];
                          if (domainPrice > 0 || selectedTask.domain_name) {
                            newItems.push({
                              description: `Biaya Beli Domain (100%): ${selectedTask.domain_name || "Domain Klien"}`,
                              qty: 1,
                              price: domainPrice,
                              total: domainPrice,
                            });
                          }
                          newNotes = `SKEMA TAHAP 1: Pembayaran DP 50% jasa (${formatIDR(halfBudget)}) dan biaya registrasi domain 100% (${formatIDR(domainPrice)}). Pengerjaan website dan setup domain akan dimulai setelah pembayaran invoice ini terkonfirmasi. Sisa pelunasan 50% (${formatIDR(halfBudget)}) dibayarkan setelah web selesai dan disetujui (ACC) di link staging preview.`;
                        } else if (invoiceForm.invoice_type === "final_50") {
                          newTitle = `Invoice 2 (Pelunasan 50%): ${selectedTask.title}`;
                          newItems = [
                            {
                              description: `Pelunasan 50% Jasa (Web ACC): ${selectedTask.title} (Total Kontrak: ${formatIDR(selectedTask.budget || 0)})`,
                              qty: 1,
                              price: halfBudget,
                              total: halfBudget,
                            },
                          ];
                          newNotes = `SKEMA TAHAP 2: Pelunasan 50% jasa (${formatIDR(halfBudget)}) setelah website disetujui (ACC). Setelah pembayaran terverifikasi, domain utama akan disambungkan ke Cloudflare, kredensial diserahkan, dan garansi pemeliharaan 3 bulan mulai aktif.`;
                        }

                        setInvoiceForm({
                          ...invoiceForm,
                          task_id: taskId,
                          client_id: selectedTask.client_id || invoiceForm.client_id,
                          project_title: newTitle,
                          items: newItems,
                          notes: newNotes,
                        });
                      } else {
                        setInvoiceForm({ ...invoiceForm, task_id: "" });
                      }
                    }}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
                  >
                    <option value="">-- Tanpa Kaitan Proyek --</option>
                    {filteredTasksByClient.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} [Budget: {formatIDR(t.budget || 0)}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Pilih Klien
                  </label>
                  <select
                    value={invoiceForm.client_id}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, client_id: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
                  >
                    <option value="">-- Tanpa Klien / Mandiri --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Box Transparansi Nilai Kontrak Proyek (Full vs DP vs Pelunasan) */}
              {(() => {
                const linkedTask = tasks.find((t) => t.id === invoiceForm.task_id);
                if (!linkedTask) return null;
                const fullBudget = Number(linkedTask.budget) || 0;
                const halfBudget = Math.round(fullBudget * 0.5);

                return (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-zinc-400">
                      <span className="flex items-center gap-1.5 font-bold text-zinc-300">
                        <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                        Rincian Kontrak Proyek: {linkedTask.title}
                      </span>
                      <span className="text-zinc-500">Skema 50% - 50%</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-[#1c1c22] border border-white/[0.04]">
                        <p className="text-[8px] uppercase tracking-wider text-zinc-400">Total Kontrak (Full)</p>
                        <p className="text-xs font-black text-zinc-100 mt-0.5">{formatIDR(fullBudget)}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[#1c1c22] border border-white/[0.04]">
                        <p className="text-[8px] uppercase tracking-wider text-zinc-400">
                          {invoiceForm.invoice_type === "dp_50" ? "DP 50% (Saat Ini)" : "Pelunasan 50%"}
                        </p>
                        <p className="text-xs font-black text-zinc-100 mt-0.5">
                          {formatIDR(halfBudget)}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-[#1c1c22] border border-white/[0.04]">
                        <p className="text-[8px] uppercase tracking-wider text-zinc-400">
                          {invoiceForm.invoice_type === "dp_50" ? "Sisa Pelunasan (Nanti)" : "Status DP Awal"}
                        </p>
                        <p className="text-xs font-black text-zinc-300 mt-0.5">
                          {invoiceForm.invoice_type === "dp_50"
                            ? formatIDR(halfBudget)
                            : "Lunas (Terbayar)"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Nomor Invoice
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceForm.invoice_number}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Tipe Tagihan
                  </label>
                  <select
                    value={invoiceForm.invoice_type}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        invoice_type: e.target.value as "dp_50" | "final_50" | "general",
                      })
                    }
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
                  >
                    <option value="dp_50">Invoice 1: DP 50% + Domain</option>
                    <option value="final_50">Invoice 2: Pelunasan 50% (ACC)</option>
                    <option value="general">Pembayaran Penuh 100% (Full)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                  Perihal / Judul Proyek *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembuatan Website E-Commerce Toko"
                  value={invoiceForm.project_title}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, project_title: e.target.value })}
                  className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Tanggal Terbit
                  </label>
                  <input
                    type="date"
                    value={invoiceForm.issue_date}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, issue_date: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                    Jatuh Tempo (Due Date)
                  </label>
                  <input
                    type="date"
                    value={invoiceForm.due_date}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                    className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Invoice Item Breakdown */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] uppercase font-black text-zinc-300">
                    Rincian Item Tagihan
                  </label>
                  <button
                    type="button"
                    onClick={addInvoiceItem}
                    className="text-[9px] font-bold uppercase text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Tambah Baris
                  </button>
                </div>

                <div className="space-y-2">
                  {invoiceForm.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Deskripsi pekerjaan"
                        value={item.description}
                        onChange={(e) => handleInvoiceItemChange(idx, "description", e.target.value)}
                        className="flex-1 bg-[#1c1c22] border border-white/[0.08] rounded px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) => handleInvoiceItemChange(idx, "qty", Number(e.target.value))}
                        className="w-14 bg-[#1c1c22] border border-white/[0.08] rounded px-2 py-1.5 text-xs text-center text-zinc-100 focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Harga"
                        value={item.price}
                        onChange={(e) => handleInvoiceItemChange(idx, "price", Number(e.target.value))}
                        className="w-28 bg-[#1c1c22] border border-white/[0.08] rounded px-2.5 py-1.5 text-xs text-right text-zinc-100 focus:outline-none"
                      />
                      <span className="w-24 text-right font-bold text-zinc-200 text-xs">
                        {formatIDR(item.total)}
                      </span>
                      {invoiceForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInvoiceItem(idx)}
                          className="p-1 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/[0.06] text-sm font-black">
                  <span className="text-zinc-400">Total Nominal:</span>
                  <span className="text-zinc-100">{formatIDR(calculateInvoiceTotal())}</span>
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">
                  Catatan Pembayaran
                </label>
                <textarea
                  rows={2}
                  placeholder="Info rekening transfer, syarat DP, dll."
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  className="w-full bg-[#1c1c22] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#1c1c22] text-zinc-400 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-zinc-200 text-black font-bold uppercase tracking-wider hover:bg-white cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Simpan Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────── */}
      {/* MODAL 4: PRINTABLE INVOICE RECEIPT SLIP */}
      {/* ────────────────────────────────────────────── */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md print:bg-white print:p-0 print:static print:inset-auto print:block">
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #print-invoice-area, #print-invoice-area * {
                visibility: visible !important;
              }
              #print-invoice-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 24px 32px !important;
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
              }
              @page {
                size: A4 portrait;
                margin: 8mm;
              }
            }
          `}</style>
          <div
            id="print-invoice-area"
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-xl bg-white text-zinc-900 p-8 shadow-2xl space-y-6 print:max-h-none print:overflow-visible print:p-0"
          >
            {/* Header Slip */}
            <div className="flex justify-between items-start border-b border-zinc-200 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black tracking-tight text-zinc-900">SUKAMCD</h2>
                  <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                    INVOICE
                  </span>
                  {viewingInvoice.invoice_type === "dp_50" && (
                    <span className="text-[8.5px] font-mono font-black uppercase px-2 py-0.5 rounded bg-zinc-900 text-white">
                      TAHAP 1: DP 50% & DOMAIN
                    </span>
                  )}
                  {viewingInvoice.invoice_type === "final_50" && (
                    <span className="text-[8.5px] font-mono font-black uppercase px-2 py-0.5 rounded bg-zinc-900 text-white">
                      TAHAP 2: PELUNASAN 50% (WEB ACC)
                    </span>
                  )}
                  {viewingInvoice.invoice_type === "general" && (
                    <span className="text-[8.5px] font-mono font-black uppercase px-2 py-0.5 rounded bg-zinc-900 text-white">
                      PEMBAYARAN PENUH 100%
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-1">Official Software & Technology Services</p>
                <p className="text-[11px] text-zinc-400 font-mono">sukamcd.tech • admin@sukamcd.tech</p>
              </div>

              <div className="text-right font-mono text-xs">
                <p className="font-bold text-zinc-900 text-sm">{viewingInvoice.invoice_number}</p>
                <p className="text-zinc-500 mt-1">Terbit: {viewingInvoice.issue_date}</p>
                <p className="text-zinc-500">Jatuh Tempo: {viewingInvoice.due_date}</p>
                <div className="mt-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                      viewingInvoice.status === "paid"
                        ? "bg-zinc-100 text-zinc-900 border-zinc-300"
                        : "bg-zinc-50 text-zinc-700 border-zinc-200"
                    }`}
                  >
                    {viewingInvoice.status === "paid" ? "LUNAS (PAID)" : "BELUM LUNAS"}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Klien */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div>
                <p className="text-[9px] font-mono uppercase font-black tracking-widest text-zinc-400 mb-1">
                  DITAGIHKAN KEPADA:
                </p>
                <p className="font-bold text-zinc-900 text-sm">{viewingInvoice.client_name || "Klien Umum"}</p>
                {viewingInvoice.client_company && <p className="text-zinc-600">{viewingInvoice.client_company}</p>}
                {viewingInvoice.client_email && <p className="text-zinc-500">{viewingInvoice.client_email}</p>}
                {viewingInvoice.client_phone && <p className="text-zinc-500">{viewingInvoice.client_phone}</p>}
              </div>

              <div>
                <p className="text-[9px] font-mono uppercase font-black tracking-widest text-zinc-400 mb-1">
                  DESKRIPSI PROYEK:
                </p>
                <p className="font-bold text-zinc-900">{viewingInvoice.project_title}</p>
              </div>
            </div>

            {/* Tabel Item Rincian */}
            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 font-mono text-[9.5px] uppercase tracking-wider text-zinc-500">
                    <th className="py-2.5 px-4">Deskripsi Layanan</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Harga Satuan</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {(() => {
                    let items: InvoiceItem[] = [];
                    try {
                      items = viewingInvoice.items_json ? JSON.parse(viewingInvoice.items_json) : [];
                    } catch {
                      items = [];
                    }
                    if (items.length === 0) {
                      items = [
                        {
                          description: viewingInvoice.project_title,
                          qty: 1,
                          price: viewingInvoice.amount,
                          total: viewingInvoice.amount,
                        },
                      ];
                    }
                    return items.map((it, idx) => (
                      <tr key={idx} className="font-mono">
                        <td className="py-2.5 px-4 font-medium text-zinc-800">{it.description}</td>
                        <td className="py-2.5 px-4 text-center text-zinc-600">{it.qty}</td>
                        <td className="py-2.5 px-4 text-right text-zinc-600">{formatIDR(it.price)}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-zinc-900">{formatIDR(it.total)}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
                <tfoot>
                  <tr className="bg-zinc-50 border-t border-zinc-200 font-mono">
                    <td colSpan={3} className="py-3 px-4 text-right font-black uppercase text-zinc-700">
                      Total Tagihan:
                    </td>
                    <td className="py-3 px-4 text-right font-black text-sm text-zinc-900">
                      {formatIDR(viewingInvoice.amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Catatan Transfer */}
            {viewingInvoice.notes && (
              <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-600">
                <p className="font-bold uppercase text-[9px] text-zinc-400 mb-1">Catatan Tambahan:</p>
                <p>{viewingInvoice.notes}</p>
              </div>
            )}

            {/* Kotak Rekening Pembayaran Resmi */}
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 flex justify-between items-center text-xs font-mono">
              <div>
                <p className="text-[9px] font-black uppercase text-zinc-400 tracking-wider mb-1">
                  Pembayaran Ditransfer ke Rekening Resmi:
                </p>
                <p className="text-base font-black text-zinc-900 tracking-wide">
                  BNI • 2048222232
                </p>
                <p className="text-zinc-600 font-bold text-xs mt-0.5">
                  A.N. FABIAN RIZKY PRATAMA
                </p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded bg-zinc-200/80 text-zinc-800 font-bold text-[10px] uppercase tracking-wider">
                  Bank BNI
                </span>
                <p className="text-[10px] text-zinc-400 mt-1">Konfirmasi via WA/Email</p>
              </div>
            </div>

            {/* Syarat & Ketentuan Freelance Safe Protocol */}
            <div className="p-3.5 rounded-lg bg-zinc-100/70 border border-zinc-200 text-[10px] font-mono text-zinc-600 space-y-1">
              <p className="font-bold uppercase text-[9px] text-zinc-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                Ketentuan Skema 50% - 50% & Garansi Pemeliharaan:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-zinc-600">
                <li>
                  <strong>Tahap 1 (DP 50% + Domain 100%)</strong>: Wajib diselesaikan sebelum penulisan kode atau pembelian domain dilakukan.
                </li>
                <li>
                  <strong>Tahap 2 (Pelunasan 50%)</strong>: Ditagihkan setelah klien memeriksa dan menyetujui (ACC) hasil di link preview staging.
                </li>
                <li>
                  <strong>Serah Terima (Handover)</strong>: Sambungan DNS domain Cloudflare dan penyerahan akun/kredensial dilakukan segera setelah pelunasan diverifikasi.
                </li>
                <li>
                  <strong>Garansi 3 Bulan</strong>: Masa garansi perbaikan bug aktif selama 90 hari terhitung sejak tanggal serah terima.
                </li>
              </ul>
            </div>

            {/* Footer Slip & Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 print:hidden">
              <p className="text-[10px] text-zinc-400 font-mono">
                Dokumen resmi dibuat otomatis oleh Sistem Portal SukaMCD.
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-xs font-mono font-bold hover:bg-zinc-50 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => handlePrintInvoice(viewingInvoice)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-zinc-800 cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Unduh PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProjectsPage;
