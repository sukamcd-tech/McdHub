import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Rocket,
  ShieldCheck,
  HardDrive,
  ShieldAlert,
  Activity,
  ArrowUpRight,
  MoveRight,
  Bug,
  Lightbulb,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [dashStats, setDashStats] = useState({
    totalBackups: 0,
    securityAlerts: 0,
    systemStatus: "Stable",
    bugCount: 0,
    saranCount: 0,
    recentFeedbacks: [] as any[],
  });

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [dashRes, projRes] = await Promise.all([
          fetch("/api/dashboard/stats").then((r) => r.json() as Promise<any>).catch(() => null),
          fetch("/api/projects").then((r) => r.json() as Promise<any>).catch(() => null),
        ]);

        if (isMounted) {
          if (dashRes?.success && dashRes?.data) {
            setDashStats({
              totalBackups: dashRes.data.totalBackups ?? 0,
              securityAlerts: dashRes.data.securityAlerts ?? 0,
              systemStatus: dashRes.data.systemStatus ?? "Stable",
              bugCount: dashRes.data.bugCount ?? 0,
              saranCount: dashRes.data.saranCount ?? 0,
              recentFeedbacks: dashRes.data.recentFeedbacks ?? [],
            });
          }
          if (projRes?.projects && Array.isArray(projRes.projects)) {
            setProjects(projRes.projects);
          }
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const onlineProjects = projects.filter((p) => p.status === "ONLINE").length;

  const stats = [
    {
      label: "Active Projects",
      value: projects.length.toString(),
      icon: Rocket,
      trend: `${onlineProjects} nodes online`,
      href: "/admin/projects",
    },
    {
      label: "Total Backups",
      value: dashStats.totalBackups.toString(),
      icon: HardDrive,
      trend: "Encrypted cloud secured",
      href: "/admin/backup",
    },
    {
      label: "Security Events",
      value: dashStats.securityAlerts.toString(),
      icon: ShieldAlert,
      trend: "Last 24h activity",
      href: "/admin/security",
    },
    {
      label: "System Integrity",
      value: dashStats.systemStatus,
      icon: ShieldCheck,
      trend: "Hyper core protection",
      href: "/admin/security",
    },
  ];

  return (
    <div className="h-full flex flex-col gap-5 select-none animate-in fade-in duration-300">
      
      {/* ── Page Title ── */}
      <div className="flex flex-col gap-0.5">
        <p className="text-[9px] uppercase tracking-[0.3em] font-black font-mono text-zinc-400">
          Administrative Gateway
        </p>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-zinc-100">
            Control Center
          </h1>
          <span className="text-[9.5px] font-black font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#1c1c22] border border-white/[0.08] text-zinc-300">
            v2.4.0
          </span>
        </div>
      </div>

      {/* ── Stats Grid (Flatter & Compact Height) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              to={stat.href}
              className="group relative rounded-xl p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 cursor-pointer transition-all duration-200 bg-[#141418] border border-white/[0.06] hover:bg-[#1a1a20] hover:border-white/[0.14] shadow-sm hover:shadow-md active:scale-[0.99]"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="p-1.5 rounded-md bg-[#1c1c22] border border-white/[0.06] text-zinc-300 group-hover:text-white transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <ArrowUpRight className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              {/* Value */}
              <div>
                <p className="text-[8.5px] uppercase tracking-[0.2em] font-black font-mono mb-1 text-zinc-400">
                  {stat.label}
                </p>
                <p className="text-2xl sm:text-3xl font-black tracking-tight leading-none font-mono text-zinc-100 group-hover:text-white transition-colors">
                  {stat.value}
                </p>
              </div>

              {/* Trend */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[8.5px] uppercase tracking-wider font-bold font-mono text-zinc-400">
                  {stat.trend}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Lower Operations Hub (Active Nodes & Feedback) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* ── Left Column: Active Ecosystem Nodes (7-cols) ── */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl overflow-hidden bg-[#141418] border border-white/[0.06]">
          {/* Section Header */}
          <div className="px-6 py-4 flex justify-between items-center border-b border-white/[0.06] bg-black/20">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-zinc-400" />
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest font-mono text-zinc-200">
                  Active Ecosystem Nodes
                </h2>
                <p className="text-[9px] uppercase tracking-wider font-bold mt-0.5 text-zinc-400">
                  Operational status of web applications
                </p>
              </div>
            </div>

            <Link
              to="/admin/projects"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest font-mono transition-all bg-[#1c1c22] border border-white/[0.06] text-zinc-300 hover:border-zinc-500/40 hover:text-white"
            >
              Manage Nodes <MoveRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Projects List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2.5 bg-black/30">
            {projects.length === 0 ? (
              <div className="text-center py-16 text-[10px] uppercase font-black tracking-[0.25em] font-mono text-zinc-500">
                Ecosystem empty. Initialize nodes via Project Central.
              </div>
            ) : (
              projects.map((project, i) => (
                <div
                  key={project.id || i}
                  className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl transition-all duration-200 bg-[#18181f] border border-white/[0.05] hover:bg-[#1f1f28] hover:border-white/[0.12]"
                >
                  {/* Left column */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Status indicator dot */}
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        project.status === "ONLINE"
                          ? "bg-zinc-300 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                          : "bg-zinc-600"
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-extrabold text-sm uppercase tracking-tight font-mono text-zinc-100 group-hover:text-white transition-colors">
                          {project.title}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-[#141418] border border-white/[0.06] text-zinc-400">
                          {project.category || "General"}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium truncate max-w-md mt-0.5 leading-relaxed text-zinc-400">
                        {project.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="flex items-center justify-end gap-3 shrink-0">
                    <span className="text-[9px] px-2.5 py-1 rounded-lg font-black font-mono border bg-[#141418] text-zinc-300 border-white/[0.08]">
                      {project.status}
                    </span>

                    <Link
                      to="/admin/projects"
                      className="text-[9px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-xl font-mono flex items-center gap-1.5 transition-all bg-[#1c1c22] border border-white/[0.06] text-zinc-300 hover:border-zinc-500/40 hover:text-white"
                    >
                      Config <MoveRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Right Column: Recent Bug & Suggestion Feedbacks (5-cols) ── */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl overflow-hidden bg-[#141418] border border-white/[0.06]">
          {/* Section Header */}
          <div className="px-6 py-4 flex justify-between items-center border-b border-white/[0.06] bg-black/20">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-zinc-400" />
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xs font-black uppercase tracking-widest font-mono text-zinc-200">
                    Feedback Feed
                  </h2>
                  <div className="flex items-center gap-1.5 font-mono text-[8px] font-black uppercase">
                    <span className="px-1.5 py-0.5 rounded border bg-[#1c1c22] border-white/[0.08] text-zinc-300">
                      Bugs: {dashStats.bugCount}
                    </span>
                    <span className="px-1.5 py-0.5 rounded border bg-[#1c1c22] border-white/[0.08] text-zinc-300">
                      Saran: {dashStats.saranCount}
                    </span>
                  </div>
                </div>
                <p className="text-[9px] uppercase tracking-wider font-bold mt-0.5 text-zinc-400">
                  Recent bug reports & suggestions
                </p>
              </div>
            </div>

            <Link
              to="/admin/feedback"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest font-mono transition-all bg-[#1c1c22] border border-white/[0.06] text-zinc-300 hover:border-zinc-500/40 hover:text-white shrink-0"
            >
              Open Inbox <MoveRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Feedbacks List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-black/30">
            {dashStats.recentFeedbacks.length === 0 ? (
              <div className="text-center py-16 text-[10px] uppercase font-black tracking-[0.25em] font-mono text-zinc-500">
                No feedback buffered. Ecosystem inbox clean.
              </div>
            ) : (
              dashStats.recentFeedbacks.map((item, i) => {
                const isBug = item.type === "bug";
                const Icon = isBug ? Bug : Lightbulb;
                return (
                  <div
                    key={item.id || i}
                    className="group flex flex-col gap-2.5 p-4 rounded-xl bg-[#18181f] border border-white/[0.05] hover:bg-[#1f1f28] hover:border-white/[0.12] transition-all duration-200 relative overflow-hidden"
                  >
                    {/* Left subtle silver hairline */}
                    <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-zinc-500/50" />

                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 pl-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider font-mono flex items-center gap-1 bg-[#141418] border-white/[0.08] text-zinc-300">
                          <Icon className="w-3 h-3 text-zinc-400" />
                          {isBug ? "Bug" : "Saran"}
                        </span>
                        
                        <span className="text-[9px] font-mono text-zinc-400 truncate max-w-[120px]">
                          {item.user_email ? item.user_email.split("@")[0] : "Anon Operator"}
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-1.5 font-mono text-[7.5px] font-black uppercase">
                        <span className="px-1.5 py-0.5 rounded border bg-[#141418] border-white/[0.08] text-zinc-400">
                          {item.priority}
                        </span>
                        
                        <span className="px-1.5 py-0.5 rounded border bg-[#141418] border-white/[0.08] text-zinc-300">
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-[11px] font-medium leading-relaxed pl-1.5 line-clamp-2 text-zinc-300">
                      {item.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 pl-1.5 text-[8px] font-mono text-zinc-400">
                      <span>{new Date(item.created_at || Date.now()).toLocaleDateString("id-ID")}</span>
                      <span>{new Date(item.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WIB</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Pricing Plans Overview Card (Flatter & Compact) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-xl bg-[#141418] border border-white/[0.06] hover:border-white/[0.12] transition-all select-none">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="p-2 rounded-lg shrink-0 bg-[#1c1c22] border border-white/[0.08] text-zinc-300">
            <Sparkles className="w-4 h-4 text-zinc-300" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest font-mono text-zinc-200">
              Pricing Plans Configurator
            </h2>
            <p className="text-[11px] font-medium text-zinc-400 mt-0.5 leading-relaxed">
              Daftar penawaran harga aktif untuk pengembangan proyek digital (Static Web, CMS, Android, ERP).
            </p>
          </div>
        </div>

        <Link
          to="/pricing"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest font-mono transition-all bg-[#1c1c22] border border-white/[0.06] text-zinc-300 hover:border-zinc-500/40 hover:text-white shrink-0"
        >
          View Pricing Page <MoveRight className="w-3 h-3" />
        </Link>
      </div>

    </div>
  );
};

export default DashboardPage;
