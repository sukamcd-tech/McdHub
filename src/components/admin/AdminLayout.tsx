import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { AdminHeader } from "./AdminHeader";
import { Loader2 } from "lucide-react";

export const AdminLayout: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/session");
        const data = (await res.json()) as any;

        if (!res.ok || !data?.user) {
          if (isMounted) {
            navigate(`/gateway?redirect=${encodeURIComponent(location.pathname)}`);
          }
          return;
        }

        if (data.user.role !== "admin") {
          if (isMounted) {
            navigate("/profile");
          }
          return;
        }

        if (isMounted) {
          setUser(data.user);
          // Also fetch profile if available
          fetch("/api/profile")
            .then((r) => r.json())
            .then((pData: any) => {
              if (pData?.profile && isMounted) {
                setProfile(pData.profile);
              }
            })
            .catch(() => null);

          setLoading(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        if (isMounted) {
          navigate("/gateway");
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center select-none"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[var(--silver-400)] animate-spin" />
          <p className="text-[10px] uppercase font-mono tracking-widest text-[var(--silver-500)]">
            Authenticating Administrative Access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden text-zinc-100"
      style={{ background: "var(--bg-root)" }}
    >
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          user={user}
          profile={{ profile_picture: profile?.profile_picture || null }}
        />
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
