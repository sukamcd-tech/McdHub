"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Folder,
  MessageSquare,
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
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    title: "Services",
    items: [
      { name: "McdCrypt", href: "/admin/mcdcrypt", icon: Folder },
      { name: "McdAI", href: "/admin/mcdai", icon: MessageSquare },
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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
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
              <span className="dot-online animate-emerald-pulse" />
              <p
                className="text-[8px] uppercase tracking-[0.22em] font-black font-mono truncate"
                style={{ color: "var(--silver-600)" }}
              >
                Secure Online
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-soft)" }}>
              <span className="text-xs font-black" style={{ color: "var(--silver-300)" }}>S</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Toggle Button ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full flex items-center justify-center z-30 cursor-pointer transition-all hover:scale-110"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-silver)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
          color: "var(--silver-400)",
        }}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* ── Navigation Groups ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-4 space-y-1">
        {navigationGroups.map((group) => (
          <div key={group.title} className="mb-2">
            {/* Group Label */}
            {!collapsed && (
              <span
                className="text-[8px] font-black uppercase tracking-[0.22em] block px-5 pt-3 pb-1.5 font-mono select-none"
                style={{ color: "var(--silver-700)" }}
              >
                {group.title}
              </span>
            )}
            {collapsed && <div className="h-px mx-3 mb-2 mt-3" style={{ background: "var(--border-subtle)" }} />}

            <nav className="space-y-0.5 px-2">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={`
                      relative flex items-center gap-3 rounded-xl transition-all duration-200 group select-none
                      ${collapsed ? "justify-center px-0 py-3" : "px-3.5 py-2.5"}
                      ${isActive
                        ? "text-white"
                        : "text-zinc-500 hover:text-zinc-200"
                      }
                    `}
                    style={
                      isActive
                        ? {
                            background: "var(--bg-active)",
                            border: "1px solid var(--border-silver)",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
                          }
                        : {
                            border: "1px solid transparent",
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                      }
                    }}
                  >
                    {/* Active left indicator bar */}
                    {isActive && !collapsed && (
                      <div className="nav-active-bar" />
                    )}

                    <Icon
                      className={`shrink-0 transition-all duration-200 ${
                        collapsed ? "w-5 h-5" : "w-4 h-4"
                      } ${
                        isActive
                          ? "text-white"
                          : "text-zinc-600 group-hover:text-zinc-300"
                      }`}
                    />

                    {!collapsed && (
                      <span
                        className={`text-xs font-semibold tracking-tight truncate ${
                          isActive ? "font-bold text-white" : "opacity-80 group-hover:opacity-100"
                        }`}
                      >
                        {item.name}
                      </span>
                    )}

                    {/* Collapsed tooltip dot for active */}
                    {collapsed && isActive && (
                      <span
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
                        style={{ background: "var(--silver-300)" }}
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
        className="shrink-0 p-2 border-t"
        style={{ borderColor: "var(--border-subtle)", background: "rgba(10,10,14,0.5)" }}
      >
        <button
          onClick={handleLogout}
          title={collapsed ? "Sign Out" : undefined}
          className={`
            w-full flex items-center gap-3 rounded-xl transition-all duration-200 group cursor-pointer
            ${collapsed ? "justify-center px-0 py-3" : "px-3.5 py-2.5"}
          `}
          style={{
            color: "var(--silver-600)",
            border: "1px solid transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.15)";
            (e.currentTarget as HTMLElement).style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.borderColor = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--silver-600)";
          }}
        >
          <LogOut className={`shrink-0 transition-all ${collapsed ? "w-5 h-5" : "w-4 h-4"}`} />
          {!collapsed && (
            <span className="text-[9px] font-black uppercase tracking-[0.18em] font-mono">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
