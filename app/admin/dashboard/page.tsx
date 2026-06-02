import { createServerSupabaseClient } from "@/lib/supabase-server";
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
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getProjects } from "@/lib/actions/project-actions";
import { getDashboardStats } from "@/lib/actions/dashboard-actions";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/gateway");
  }

  const [projects, dashResult] = await Promise.all([
    getProjects(),
    getDashboardStats(),
  ]);

  const dashStats = {
    totalBackups: dashResult.data?.totalBackups ?? 0,
    securityAlerts: dashResult.data?.securityAlerts ?? 0,
    systemStatus: dashResult.data?.systemStatus ?? "Unknown",
    bugCount: dashResult.data?.bugCount ?? 0,
    saranCount: dashResult.data?.saranCount ?? 0,
    recentFeedbacks: dashResult.data?.recentFeedbacks ?? [],
  };
  const onlineProjects = projects.filter((p) => p.status === "ONLINE").length;

  const stats = [
    {
      label: "Active Projects",
      value: projects.length.toString(),
      icon: Rocket,
      trend: `${onlineProjects} nodes online`,
      href: "/admin/projects",
      accentColor: "var(--silver-300)",
    },
    {
      label: "Total Backups",
      value: dashStats.totalBackups.toString(),
      icon: HardDrive,
      trend: "Encrypted cloud secured",
      href: "/admin/backup",
      accentColor: "var(--silver-400)",
    },
    {
      label: "Security Events",
      value: dashStats.securityAlerts.toString(),
      icon: ShieldAlert,
      trend: "Last 24h activity",
      href: "/admin/security",
      accentColor:
        dashStats.securityAlerts > 0 ? "var(--crimson)" : "var(--silver-400)",
    },
    {
      label: "System Integrity",
      value: dashStats.systemStatus,
      icon: ShieldCheck,
      trend: "Hyper core protection",
      href: "/admin/security",
      accentColor:
        dashStats.systemStatus === "Stable"
          ? "var(--emerald)"
          : "var(--silver-400)",
    },
  ];

  return (
    <div
      className="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      {/* ── Page Title ── */}
      <div className="flex flex-col gap-1 select-none">
        <p
          className="text-[9px] uppercase tracking-[0.3em] font-black font-mono"
          style={{ color: "var(--silver-600)" }}
        >
          Administrative Gateway
        </p>
        <h1
          className="text-4xl font-black tracking-tight leading-none"
          style={{ color: "var(--silver-100)" }}
        >
          Control Center
          <span
            className="text-[10px] font-black font-mono uppercase tracking-wider px-2.5 py-0.5 rounded ml-3 align-middle"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-soft)",
              color: "var(--silver-500)",
            }}
          >
            v2.1.0
          </span>
        </h1>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              href={stat.href}
              className="card group relative overflow-hidden rounded-2xl p-6 flex flex-col gap-4 cursor-pointer"
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${stat.accentColor}55, transparent)`,
                }}
              />

              {/* Header */}
              <div className="flex items-center justify-between">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: stat.accentColor }} />
                </div>
                <ArrowUpRight
                  className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ color: "var(--silver-500)" }}
                />
              </div>

              {/* Value */}
              <div>
                <p
                  className="text-[9px] uppercase tracking-[0.2em] font-black font-mono mb-2"
                  style={{ color: "var(--silver-600)" }}
                >
                  {stat.label}
                </p>
                <p
                  className="text-4xl font-black tracking-tight leading-none font-mono"
                  style={{ color: stat.accentColor }}
                >
                  {stat.value}
                </p>
              </div>

              {/* Trend */}
              <div
                className="pt-3 border-t flex items-center"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <span
                  className="text-[9px] uppercase tracking-wider font-bold font-mono"
                  style={{ color: "var(--silver-600)" }}
                >
                  {stat.trend}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Lower Operations Hub ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* ── Left Column: Active Ecosystem Nodes (7-cols) ── */}
        <div
          className="lg:col-span-7 flex flex-col rounded-2xl overflow-hidden animate-in fade-in duration-300"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* Section Header */}
          <div
            className="px-7 py-5 flex justify-between items-center select-none bg-[rgba(10,10,14,0.15)]"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4" style={{ color: "var(--silver-500)" }} />
              <div>
                <h2
                  className="text-xs font-black uppercase tracking-widest font-mono"
                  style={{ color: "var(--silver-200)" }}
                >
                  Active Ecosystem Nodes
                </h2>
                <p
                  className="text-[9px] uppercase tracking-wider font-bold mt-0.5"
                  style={{ color: "var(--silver-600)" }}
                >
                  Operational status of web applications
                </p>
              </div>
            </div>

            <Link
              href="/admin/projects"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest font-mono transition-all bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--silver-500)] hover:border-[var(--border-silver)] hover:text-[var(--silver-200)]"
            >
              Manage Nodes <MoveRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Projects */}
          <div
            className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2"
            style={{ background: "rgba(10,10,14,0.4)" }}
          >
            {projects.length === 0 ? (
              <div
                className="text-center py-16 text-[10px] uppercase font-black tracking-[0.25em] font-mono"
                style={{ color: "var(--silver-700)" }}
              >
                Ecosystem empty. Initialize nodes via Project Central.
              </div>
            ) : (
              projects.map((project, i) => (
                <div
                  key={i}
                  className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl transition-all duration-200 cursor-default bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] hover:border-[var(--border-soft)]"
                >
                  {/* Left column */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Status indicator */}
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        project.status === "ONLINE"
                          ? "bg-emerald-500 animate-emerald-pulse"
                          : project.status === "MAINTENANCE"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          className="font-extrabold text-sm uppercase tracking-tight font-mono"
                          style={{ color: "var(--silver-100)" }}
                        >
                          {project.title}
                        </span>
                        <span
                          className="text-[8px] font-black uppercase tracking-wider font-mono px-2 py-0.5 rounded"
                          style={{
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--silver-500)",
                          }}
                        >
                          {project.category}
                        </span>
                      </div>
                      <p
                        className="text-[11px] font-medium truncate max-w-[260px] mt-0.5 leading-relaxed"
                        style={{ color: "var(--silver-600)" }}
                      >
                        {project.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="flex items-center justify-end gap-4 shrink-0">
                    <span
                      className={`text-[9px] px-2.5 py-1 rounded-lg font-black font-mono border ${
                        project.status === "ONLINE"
                          ? "bg-emerald-900/10 text-emerald-400 border-emerald-800/25"
                          : project.status === "MAINTENANCE"
                          ? "bg-amber-900/10 text-amber-400 border-amber-800/25"
                          : "bg-red-900/10 text-red-400 border-red-800/25"
                      }`}
                    >
                      {project.status}
                    </span>

                    <Link
                      href="/admin/projects"
                      className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl font-mono flex items-center gap-1.5 transition-all bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--silver-500)] hover:border-[var(--border-silver)] hover:text-[var(--silver-200)]"
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
        <div
          className="lg:col-span-5 flex flex-col rounded-2xl overflow-hidden animate-in fade-in duration-300"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* Section Header */}
          <div
            className="px-7 py-5 flex justify-between items-center select-none bg-[rgba(10,10,14,0.15)]"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4" style={{ color: "var(--silver-500)" }} />
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2
                    className="text-xs font-black uppercase tracking-widest font-mono text-[var(--silver-200)]"
                  >
                    Feedback Feed
                  </h2>
                  <div className="flex items-center gap-1 font-mono text-[7px] font-black uppercase select-none">
                    <span
                      className="px-1.5 py-0.5 rounded border bg-red-950/20 border-red-800/20 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.05)]"
                    >
                      Bugs: {dashStats.bugCount}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded border bg-amber-950/20 border-amber-800/25 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.05)]"
                    >
                      Saran: {dashStats.saranCount}
                    </span>
                  </div>
                </div>
                <p
                  className="text-[9px] uppercase tracking-wider font-bold mt-0.5 text-[var(--silver-600)]"
                >
                  Recent bug reports & suggestions
                </p>
              </div>
            </div>

            <Link
              href="/admin/feedback"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest font-mono transition-all bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--silver-500)] hover:border-[var(--border-silver)] hover:text-[var(--silver-200)] shrink-0"
            >
              Open Inbox <MoveRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Feedbacks */}
          <div
            className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3.5"
            style={{ background: "rgba(10,10,14,0.4)" }}
          >
            {dashStats.recentFeedbacks.length === 0 ? (
              <div
                className="text-center py-16 text-[10px] uppercase font-black tracking-[0.25em] font-mono"
                style={{ color: "var(--silver-700)" }}
              >
                No feedback buffered. Ecosystem inbox clean.
              </div>
            ) : (
              dashStats.recentFeedbacks.map((item, i) => {
                const isBug = item.type === "bug";
                const Icon = isBug ? Bug : Lightbulb;
                return (
                  <div
                    key={i}
                    className="group flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] hover:border-[var(--border-soft)] transition-all duration-200 relative overflow-hidden"
                  >
                    {/* Left Accent indicator line */}
                    <div className={`absolute top-0 bottom-0 left-0 w-0.5 rounded-l-xl ${
                      isBug ? "bg-red-500/80 animate-pulse" : "bg-amber-500/80"
                    }`} />

                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 pl-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md border text-[7.5px] font-black uppercase tracking-widest font-mono flex items-center gap-1 ${
                            isBug
                              ? "bg-red-950/20 border-red-800/25 text-red-400"
                              : "bg-amber-950/20 border-amber-800/25 text-amber-400"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {isBug ? "Bug" : "Saran"}
                        </span>
                        
                        <span
                          className="text-[9px] font-mono text-[var(--silver-500)] truncate max-w-[120px]"
                        >
                          {item.user_email ? item.user_email.split("@")[0] : "Anon Operator"}
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-1.5 font-mono text-[7px] font-black uppercase">
                        <span
                          className={`px-1.5 py-0.5 rounded border ${
                            item.priority === "tinggi"
                              ? "bg-red-950/20 border-red-800/20 text-red-400 font-extrabold"
                              : item.priority === "normal"
                              ? "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--silver-400)]"
                              : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--silver-600)]"
                          }`}
                        >
                          {item.priority}
                        </span>
                        
                        <span
                          className={`px-1.5 py-0.5 rounded border ${
                            item.status === "resolved"
                              ? "bg-emerald-950/25 border-emerald-800/25 text-emerald-400"
                              : "bg-[var(--bg-elevated)] border-[var(--border-soft)] text-[var(--silver-300)]"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <p
                      className="text-[10.5px] font-medium leading-relaxed pl-1.5 line-clamp-2"
                      style={{ color: "var(--silver-400)" }}
                    >
                      {item.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5 pl-1.5 text-[8px] font-mono text-[var(--silver-600)]">
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
      </div>

      {/* ── Pricing Plans Overview Card ── */}
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-soft)] transition-all select-none"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className="p-2.5 rounded-lg shrink-0 bg-[var(--bg-elevated)] border border-[var(--border-soft)]"
          >
            <Sparkles className="w-5 h-5 text-[var(--silver-400)]" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest font-mono text-[var(--silver-200)]">
              Pricing Plans Configurator
            </h2>
            <p className="text-[11px] font-medium text-[var(--silver-600)] mt-0.5 leading-relaxed">
              Daftar penawaran harga aktif untuk pengembangan proyek digital (Static Web, CMS, Android, ERP).
            </p>
          </div>
        </div>

        <Link
          href="/pricing"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest font-mono transition-all bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--silver-500)] hover:border-[var(--border-silver)] hover:text-[var(--silver-200)] shrink-0"
        >
          View Pricing Page <MoveRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
