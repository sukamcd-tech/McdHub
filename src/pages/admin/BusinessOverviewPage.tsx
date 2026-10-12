import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ChevronRight,
  Target,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface OverviewData {
  total_cash_in: number;
  pending_receivable: number;
  active_clients: number;
  total_clients: number;
  monthly_target: number;
  pipeline: { stage_step: number; count: number }[];
  monthly_revenue: { month: string; total: number }[];
  upcoming_invoices: {
    id: string;
    invoice_number: string;
    client_name?: string;
    client_company?: string;
    project_title: string;
    amount: number;
    due_date: string;
    invoice_type: string;
  }[];
  ongoing_tasks: {
    id: string;
    title: string;
    client_name?: string;
    budget: number;
    status: string;
    stage_step: number;
    deadline?: string;
  }[];
}

const formatIDR = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export const BusinessOverviewPage: React.FC = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/clients/overview");
      const json = await res.json() as any;
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load business overview:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const totalCashIn = data?.total_cash_in || 0;
  const pendingReceivable = data?.pending_receivable || 0;
  const monthlyTarget = data?.monthly_target || 10000000;
  const targetPercent = Math.min(100, Math.round((totalCashIn / monthlyTarget) * 100));

  const pipelineMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  data?.pipeline?.forEach((p) => {
    pipelineMap[p.stage_step] = p.count;
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300 select-none pb-12 font-mono">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] font-black text-zinc-400 mb-1">
            Executive Financial Suite
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5 text-zinc-100 font-sans">
            <TrendingUp className="w-6 h-6 text-zinc-300" />
            Business & Financial Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl bg-[#1c1c22] border border-white/[0.08] text-xs text-zinc-300 hover:text-white hover:border-zinc-500/40 cursor-pointer flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
          <Link
            to="/admin/client-projects"
            className="px-3.5 py-2 rounded-xl bg-zinc-100 text-zinc-900 hover:bg-white text-xs font-bold font-sans uppercase tracking-wider flex items-center gap-1.5 shadow transition-all cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Buka Client Projects
          </Link>
        </div>
      </div>

      {/* ── 4 Main Financial Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Cash In (Total Pendapatan Bersih Lunas) */}
        <div className="p-4 rounded-xl bg-[#141418] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-black">
              Total Cash In (Lunas)
            </span>
            <div className="p-2 rounded-lg bg-zinc-800/80 border border-white/[0.08] text-zinc-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
              {formatIDR(totalCashIn)}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-zinc-300" />
              Dana terverifikasi masuk rekening
            </p>
          </div>
        </div>

        {/* Metric 2: Pending Receivables (Piutang Menunggu Bayar) */}
        <div className="p-4 rounded-xl bg-[#141418] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-black">
              Piutang Tertunda (Pending)
            </span>
            <div className="p-2 rounded-lg bg-zinc-800/80 border border-white/[0.08] text-zinc-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
              {formatIDR(pendingReceivable)}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-zinc-300" />
              Invoice terbit belum dibayar klien
            </p>
          </div>
        </div>

        {/* Metric 3: Active Clients */}
        <div className="p-4 rounded-xl bg-[#141418] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-black">
              Klien Aktif
            </span>
            <div className="p-2 rounded-lg bg-zinc-800/80 border border-white/[0.08] text-zinc-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
              {data?.active_clients || 0} <span className="text-xs text-zinc-500 font-normal">/ {data?.total_clients || 0} Total</span>
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-zinc-300" />
              Entitas bisnis terdaftar
            </p>
          </div>
        </div>

        {/* Metric 4: Monthly Target Progress */}
        <div className="p-4 rounded-xl bg-[#141418] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-black">
              Target Revenue Bulanan
            </span>
            <div className="p-2 rounded-lg bg-zinc-800/80 border border-white/[0.08] text-zinc-300">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-lg font-black text-zinc-100">{targetPercent}%</span>
              <span className="text-[10px] text-zinc-400">Target: {formatIDR(monthlyTarget)}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full bg-zinc-200 transition-all duration-500 rounded-full"
                style={{ width: `${targetPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 50%-50% Safe Freelance Pipeline Status ── */}
      <div className="p-4 rounded-xl bg-[#141418] border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-300" />
            Distribusi Proyek Skema 50% - 50%
          </p>
          <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
            Realtime Pipeline Monitor
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-[#1c1c22] border border-white/[0.06]">
            <p className="text-[9px] uppercase font-bold text-zinc-400">Tahap 1: Menunggu DP</p>
            <p className="text-lg font-black text-zinc-100 mt-1">
              {pipelineMap[1]} <span className="text-xs font-normal text-zinc-400">Proyek</span>
            </p>
            <p className="text-[9.5px] text-zinc-400 mt-0.5">Jangan mulai coding</p>
          </div>
          <div className="p-3 rounded-lg bg-[#1c1c22] border border-white/[0.06]">
            <p className="text-[9px] uppercase font-bold text-zinc-400">Tahap 2: Staging Preview</p>
            <p className="text-lg font-black text-zinc-100 mt-1">
              {pipelineMap[2]} <span className="text-xs font-normal text-zinc-400">Proyek</span>
            </p>
            <p className="text-[9.5px] text-zinc-400 mt-0.5">Development di *.pages.dev</p>
          </div>
          <div className="p-3 rounded-lg bg-[#1c1c22] border border-white/[0.06]">
            <p className="text-[9px] uppercase font-bold text-zinc-400">Tahap 3: Web ACC (Pelunasan)</p>
            <p className="text-lg font-black text-zinc-100 mt-1">
              {pipelineMap[3]} <span className="text-xs font-normal text-zinc-400">Proyek</span>
            </p>
            <p className="text-[9.5px] text-zinc-400 mt-0.5">Tahan domain & kredensial</p>
          </div>
          <div className="p-3 rounded-lg bg-[#1c1c22] border border-white/[0.06]">
            <p className="text-[9px] uppercase font-bold text-zinc-400">Tahap 4: Handover & Garansi</p>
            <p className="text-lg font-black text-zinc-100 mt-1">
              {pipelineMap[4]} <span className="text-xs font-normal text-zinc-400">Proyek</span>
            </p>
            <p className="text-[9.5px] text-zinc-400 mt-0.5">Garansi 3 bulan aktif</p>
          </div>
        </div>
      </div>

      {/* ── 2 Columns: Ongoing Tasks & Upcoming Due Invoices ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ongoing Tasks Table */}
        <div className="p-4 rounded-xl bg-[#141418] border border-white/[0.08] space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                Proyek Berjalan
              </p>
              <Link
                to="/admin/client-projects"
                className="text-[9px] text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1"
              >
                Ke Kanban <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-white/[0.06] mt-2">
              {data?.ongoing_tasks && data.ongoing_tasks.length > 0 ? (
                data.ongoing_tasks.map((task) => (
                  <div key={task.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-zinc-100 truncate max-w-[220px] sm:max-w-xs">{task.title}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {task.client_name || "Klien Umum"} • Tahap {task.stage_step}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-zinc-200">{formatIDR(task.budget)}</p>
                      <span className="text-[8.5px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 inline-block mt-0.5">
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  Tidak ada proyek berjalan saat ini
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Due Invoices */}
        <div className="p-4 rounded-xl bg-[#141418] border border-white/[0.08] space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                Invoice Menunggu Pelunasan (Due Soon)
              </p>
              <Link
                to="/admin/client-projects"
                className="text-[9px] text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1"
              >
                Semua Invoice <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-white/[0.06] mt-2">
              {data?.upcoming_invoices && data.upcoming_invoices.length > 0 ? (
                data.upcoming_invoices.map((inv) => (
                  <div key={inv.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-100">{inv.invoice_number}</span>
                        <span className="text-[8px] uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                          {inv.invoice_type}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-[200px]">
                        {inv.client_name || "Klien Umum"} • Due: {inv.due_date}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-zinc-200">{formatIDR(inv.amount)}</p>
                      <span className="text-[8.5px] uppercase tracking-wider text-zinc-400 font-bold">
                        PENDING
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  Semua invoice saat ini telah terlunasi
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessOverviewPage;
