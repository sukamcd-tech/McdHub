import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  MessageSquarePlus,
  Rocket,
  UploadCloud,
  FileText,
  ShieldCheck,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Ticket,
  Smartphone,
  Briefcase,
} from "lucide-react";

const navigationGroups = [
  {
    title: "Core",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
      { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { name: "Projects", href: "/admin/projects", icon: Rocket },
      { name: "Promos", href: "/admin/promos", icon: Ticket },
      { name: "Apps", href: "/admin/apps", icon: Smartphone },
    ],
  },
  {
    title: "Business",
    items: [
      { name: "Client Projects", href: "/admin/client-projects", icon: Briefcase },
    ],
  },
  {
    title: "Services",
    items: [
      { name: "Feedback", href: "/admin/feedback", icon: MessageSquarePlus },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Backup", href: "/admin/backup", icon: UploadCloud },
      { name: "Logs", href: "/admin/logs", icon: FileText },
      { name: "Security", href: "/admin/security", icon: ShieldCheck },
      { name: "Profile", href: "/admin/profile", icon: User },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    navigate("/gateway");
  };

  return (
    <aside
      className={`
        relative flex flex-col shrink-0 z-20
        border-r border-white/[0.04]
        sidebar-transition
        ${collapsed ? "sidebar-collapsed" : "sidebar-expanded"}
      `}
      style={{
        background: "linear-gradient(180deg, #131318 0%, #111116 100%)",
        boxShadow: "6px 0 32px rgba(0,0,0,0.4)",
      }}
    >
      {/* ── Brand Header ── */}
      <div
        className={`flex items-center h-20 shrink-0 border-b border-white/[0.04] px-4 overflow-hidden select-none`}
        style={{ minHeight: "80px" }}
      >
        {!collapsed ? (
          <div className="flex flex-col gap-1 pl-2 flex-1 min-w-0">
            <div className="flex items-baseline gap-1">
              <span
                className="text-xl font-black tracking-tighter"
                style={{ color: "var(--silver-100)" }}
              >
                SUKA
              </span>
              <span
                className="text-xl font-black tracking-tighter"
                style={{ color: "var(--silver-500)" }}
              >
                MCD
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold font-mono truncate text-zinc-400">
                Secure Online
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-soft)",
              }}
            >
              <span
                className="text-xs font-black"
                style={{ color: "var(--silver-300)" }}
              >
                S
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Toggle Button ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full flex items-center justify-center z-30 cursor-pointer transition-all hover:scale-110 active:scale-95 bg-zinc-800 border border-zinc-600/60 shadow-lg text-zinc-300 hover:text-white"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* ── Navigation Groups ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-4 space-y-1">
        {navigationGroups.map((group) => (
          <div key={group.title} className="mb-2">
            {!collapsed && (
              <span className="text-[9px] font-black uppercase tracking-[0.22em] block px-5 pt-3 pb-1.5 font-mono select-none text-zinc-400">
                {group.title}
              </span>
            )}
            {collapsed && (
              <div
                className="h-px mx-3 mb-2 mt-3"
                style={{ background: "var(--border-subtle)" }}
              />
            )}

            <nav className="space-y-0.5 px-2">
              {group.items.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  location.pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    title={collapsed ? item.name : undefined}
                    className={`
                      relative flex items-center gap-3 rounded-xl transition-all duration-200 group select-none active:scale-[0.98]
                      ${collapsed ? "justify-center px-0 py-3" : "px-3.5 py-2.5"}
                      ${isActive ? "text-white font-bold bg-white/[0.08] border border-white/20 shadow-md" : "text-zinc-300 hover:text-white hover:bg-white/[0.04] border border-transparent"}
                    `}
                  >
                    {isActive && !collapsed && (
                      <div className="nav-active-bar" />
                    )}

                    <Icon
                      className={`shrink-0 transition-all duration-200 ${
                        collapsed ? "w-5 h-5" : "w-4 h-4"
                      } ${
                        isActive
                          ? "text-white"
                          : "text-zinc-400 group-hover:text-zinc-200"
                      }`}
                    />

                    {!collapsed && (
                      <span
                        className={`text-xs tracking-tight truncate ${
                          isActive
                            ? "font-bold text-white"
                            : "font-medium text-zinc-300 group-hover:text-white"
                        }`}
                      >
                        {item.name}
                      </span>
                    )}

                    {collapsed && isActive && (
                      <span
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-zinc-300 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* ── Footer / Sign Out ── */}
      <div
        className="shrink-0 p-2 border-t border-white/[0.06] bg-black/40"
      >
        <button
          onClick={handleLogout}
          title={collapsed ? "Sign Out" : undefined}
          className={`
            w-full flex items-center gap-3 rounded-xl transition-all duration-200 group cursor-pointer active:scale-95 text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10
            ${collapsed ? "justify-center px-0 py-3" : "px-3.5 py-2.5"}
          `}
        >
          <LogOut
            className={`shrink-0 transition-all ${
              collapsed ? "w-5 h-5" : "w-4 h-4"
            }`}
          />
          {!collapsed && (
            <span className="text-[9px] font-black uppercase tracking-[0.18em] font-mono">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
