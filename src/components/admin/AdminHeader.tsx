import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Clock } from "lucide-react";

interface AdminHeaderProps {
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    created_at?: string;
  };
  profile: {
    profile_picture: string | null;
  } | null;
}

const pageTitles: Record<string, { label: string; sub: string }> = {
  "/admin/dashboard": { label: "Dashboard", sub: "Administrative overview" },
  "/admin/orders": { label: "Orders", sub: "Order management" },
  "/admin/projects": { label: "Projects", sub: "Node management" },
  "/admin/promos": { label: "Promos", sub: "Discount coupons" },
  "/admin/apps": { label: "Apps", sub: "Application releases" },
  "/admin/mcdcrypt": { label: "McdCrypt", sub: "Encrypted vault" },
  "/admin/mcdai": { label: "McdAI", sub: "Intelligence core" },
  "/admin/feedback": { label: "Feedback", sub: "Bug & suggestion inbox" },
  "/admin/backup": { label: "Backup", sub: "Cloud sync & snapshot" },
  "/admin/logs": { label: "System Logs", sub: "Audit trail" },
  "/admin/security": { label: "Security", sub: "Access control" },
  "/admin/profile": { label: "Profile", sub: "Identity management" },
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({ user, profile }) => {
  const [uptime, setUptime] = useState("0d 0h 0m");
  const [currentTime, setCurrentTime] = useState("");
  const location = useLocation();

  const pageInfo = (() => {
    for (const [key, val] of Object.entries(pageTitles)) {
      if (location.pathname.startsWith(key)) return val;
    }
    return { label: "Admin", sub: "Control panel" };
  })();

  useEffect(() => {
    const created = user.created_at ? new Date(user.created_at) : new Date();

    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, now.getTime() - created.getTime());
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

  const username = user.email ? user.email.split("@")[0] : "admin";
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
            className="text-sm font-black uppercase tracking-widest font-mono text-zinc-100"
          >
            {pageInfo.label}
          </h1>
          <p className="text-[10px] uppercase tracking-wider font-semibold mt-0.5 text-zinc-400">
            {pageInfo.sub}
          </p>
        </div>
      </div>

      {/* ── Right: Clock & User Info ── */}
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-300">
              {currentTime}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
            <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-zinc-400">
              UPTIME: {uptime}
            </span>
          </div>
        </div>

        {/* User badge */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/[0.06]">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-xs font-bold text-zinc-100 leading-tight">
              {user.name || username}
            </span>
            <span className="text-[8px] font-mono font-black uppercase tracking-wider text-zinc-400">
              {user.role || "ADMIN"}
            </span>
          </div>

          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-silver)",
            }}
          >
            {profile?.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className="text-xs font-black"
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
};

export default AdminHeader;
