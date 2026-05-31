"use client";

import { User as UserIcon, Clock } from "lucide-react";
import { type User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface AdminHeaderProps {
  user: User;
  profile: { profile_picture: string | null } | null;
}

const pageTitles: Record<string, { label: string; sub: string }> = {
  "/admin/dashboard": { label: "Dashboard", sub: "Administrative overview" },
  "/admin/projects":  { label: "Projects", sub: "Node management" },
  "/admin/mcdcrypt":  { label: "McdCrypt", sub: "Encrypted vault" },
  "/admin/mcdai":     { label: "McdAI", sub: "Intelligence core" },
  "/admin/feedback":  { label: "Feedback", sub: "Bug & suggestion inbox" },
  "/admin/backup":    { label: "Backup", sub: "Cloud sync & snapshot" },
  "/admin/logs":      { label: "System Logs", sub: "Audit trail" },
  "/admin/security":  { label: "Security", sub: "Access control" },
  "/admin/profile":   { label: "Profile", sub: "Identity management" },
};

export default function AdminHeader({ user, profile }: AdminHeaderProps) {
  const [uptime, setUptime] = useState("0d 0h 0m");
  const [currentTime, setCurrentTime] = useState("");
  const pathname = usePathname();

  const pageInfo = (() => {
    for (const [key, val] of Object.entries(pageTitles)) {
      if (pathname?.startsWith(key)) return val;
    }
    return { label: "Admin", sub: "Control panel" };
  })();

  useEffect(() => {
    if (!user.created_at) return;

    const tick = () => {
      const created = new Date(user.created_at);
      const now = new Date();
      const diff = now.getTime() - created.getTime();
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setUptime(`${days}d ${hours}h ${mins}m`);

      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };

    tick();
    const timer = setInterval(tick, 60000);
    return () => clearInterval(timer);
  }, [user.created_at]);

  const username = user.email?.split("@")[0] || "admin";
  const initial = username.charAt(0).toUpperCase();

  return (
    <header
      className="h-[68px] shrink-0 flex items-center justify-between px-8 sticky top-0 z-10 w-full"
      style={{
        background: "rgba(15, 15, 19, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-subtle)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.02)",
      }}
    >
      {/* ── Left: Page Title ── */}
      <div className="flex items-center gap-4 select-none">
        <div>
          <h1
            className="text-base font-black tracking-tight leading-none mb-0.5"
            style={{ color: "var(--silver-100)" }}
          >
            {pageInfo.label}
          </h1>
          <p
            className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono"
            style={{ color: "var(--silver-600)" }}
          >
            {pageInfo.sub}
          </p>
        </div>
      </div>

      {/* ── Right: Meta + Avatar ── */}
      <div className="flex items-center gap-5">
        {/* Live Clock */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg select-none"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <Clock className="w-3 h-3" style={{ color: "var(--silver-500)" }} />
          <span
            className="text-[10px] font-mono font-bold tracking-tight"
            style={{ color: "var(--silver-400)" }}
          >
            {currentTime}
          </span>
        </div>

        {/* Uptime Pill */}
        <div
          className="hidden lg:flex items-center gap-2 select-none"
        >
          <span className="dot-online" />
          <span
            className="text-[9px] font-mono font-bold uppercase tracking-wider"
            style={{ color: "var(--silver-500)" }}
          >
            {uptime}
          </span>
        </div>

        {/* Divider */}
        <div
          className="w-px h-7"
          style={{ background: "var(--border-subtle)" }}
        />

        {/* User Info + Avatar */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block select-none">
            <p
              className="text-xs font-semibold leading-none mb-1"
              style={{ color: "var(--silver-200)" }}
            >
              {user.email}
            </p>
            <span
              className="text-[8px] font-black uppercase tracking-[0.18em] font-mono px-2 py-0.5 rounded"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-soft)",
                color: "var(--silver-500)",
              }}
            >
              ADMIN
            </span>
          </div>

          {/* Avatar */}
          <div
            className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer group transition-all duration-200"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-soft)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-silver)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 14px var(--silver-glow)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-soft)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            {profile?.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt="Profile"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <span
                className="text-sm font-black uppercase font-mono"
                style={{ color: "var(--silver-300)" }}
              >
                {initial}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
