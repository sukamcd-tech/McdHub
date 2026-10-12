import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  FileText,
  Shield,
  Key,
  Check,
  Loader2,
  Award,
  Calendar,
} from "lucide-react";

interface Profile {
  id: string;
  name: string | null;
  username: string | null;
  phone_number: string | null;
  bio: string | null;
  profile_picture: string | null;
  role: string;
  created_at: string;
}

export const AdminProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [sessionRes, profileRes] = await Promise.all([
          fetch("/api/auth/session").then((r) => r.json() as Promise<any>).catch(() => null),
          fetch("/api/profile").then((r) => r.json() as Promise<any>).catch(() => null),
        ]);

        if (isMounted) {
          if (sessionRes?.user) {
            setUserEmail(sessionRes.user.email || "");
          }
          if (profileRes?.profile) {
            setProfile(profileRes.profile);
          } else if (sessionRes?.user) {
            setProfile({
              id: sessionRes.user.id,
              name: sessionRes.user.name || "Administrator",
              username: sessionRes.user.username || "admin",
              phone_number: null,
              bio: null,
              profile_picture: null,
              role: "admin",
              created_at: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (message?.type === "success") {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function handleProfileUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      username: formData.get("username") as string,
      phone_number: formData.get("phone_number") as string,
      bio: formData.get("bio") as string,
    };

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setProfile((prev) => (prev ? { ...prev, ...payload } : null));
        setIsEditingInfo(false);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePasswordUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmation = formData.get("password_confirmation") as string;

    if (password !== confirmation) {
      setMessage({ type: "error", text: "Passwords do not match." });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Password updated successfully!" });
        setIsEditingPassword(false);
        (e.target as HTMLFormElement).reset();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update password" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update password" });
    } finally {
      setIsLoading(false);
    }
  }

  if (!profile) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--silver-400)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5 animate-in fade-in duration-300 select-none">
      {/* ── Profile Header visual card ── */}
      <div className="rounded-xl p-5 relative flex flex-col md:flex-row items-center gap-5 overflow-hidden select-none bg-[#141418] border border-white/[0.06]">
        <div className="relative group cursor-pointer shrink-0">
          <div className="w-24 h-24 rounded-xl flex items-center justify-center overflow-hidden border border-white/[0.08] bg-[#1c1c22] p-1 transition-all duration-300 hover:border-zinc-500/40">
            <div className="w-full h-full rounded-lg overflow-hidden relative">
              {profile.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/40">
                  <User className="w-10 h-10 text-zinc-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center md:text-left space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <h2 className="text-2xl font-black tracking-tight text-zinc-100">
              {profile.name || "System Operator"}
            </h2>
            <span className="text-[8.5px] font-black font-mono px-2.5 py-0.5 rounded bg-[#1c1c22] border border-white/[0.08] text-zinc-300 uppercase tracking-wider">
              {profile.role}
            </span>
          </div>
          <p className="font-mono text-sm text-zinc-400 lowercase">
            @{profile.username || "admin"}
          </p>
          <p className="text-[9.5px] text-zinc-400 uppercase font-mono tracking-wider leading-relaxed max-w-lg mt-1">
            Authorized node controller. Credentials secured & encrypted via Cloudflare D1 Auth Daemon.
          </p>
        </div>
      </div>

      {/* ── Alert Notifications ── */}
      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-mono uppercase tracking-wider font-extrabold border animate-in zoom-in-95 duration-300 ${
            message.type === "success"
              ? "bg-white/[0.08] border-white/[0.18] text-zinc-100"
              : "bg-white/[0.04] border-white/[0.1] text-zinc-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ── Main Operations Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ── Left column: Stats ── */}
        <div className="lg:col-span-4 space-y-4">
          <section className="panel rounded-xl p-4.5 flex flex-col gap-4 bg-[#141418] border border-white/[0.06]">
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 font-mono flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-zinc-300" /> Profile Metrics
            </h3>

            <div className="space-y-2.5">
              {[
                {
                  label: "Registered Since",
                  value: profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString("id-ID", {
                        month: "short",
                        year: "numeric",
                      })
                    : "Belum Ada",
                  icon: Calendar,
                },
                {
                  label: "Account Role",
                  value: profile.role ? profile.role.toUpperCase() : "ADMIN",
                  icon: Shield,
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 rounded-lg bg-[#1c1c22] border border-white/[0.06]"
                  >
                    <span className="text-[9px] uppercase tracking-wider font-black text-zinc-400 font-mono flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" /> {item.label}
                    </span>
                    <span className="text-[10px] font-mono font-extrabold text-zinc-100">
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel rounded-xl p-4.5 flex flex-col gap-3 bg-[#141418] border border-white/[0.06]">
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 font-mono flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-zinc-300" /> Account Security
            </h3>
            <div className="p-3.5 rounded-lg bg-[#1c1c22] border border-white/[0.06] space-y-2 font-mono">
              <div className="flex items-center gap-2 text-zinc-200">
                <Check className="w-3.5 h-3.5" />
                <span className="text-[8.5px] font-black uppercase tracking-widest">
                  Authenticated Session
                </span>
              </div>
              <p className="text-[9.5px] leading-relaxed text-zinc-400 uppercase">
                Email terverifikasi di Cloudflare D1. Kredensial diamankan dengan hashing server.
              </p>
            </div>
          </section>
        </div>

        {/* ── Right column: Forms ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Identity Information */}
          <div className="panel rounded-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[rgba(10,10,14,0.2)] shrink-0 select-none">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--silver-200)] font-mono flex items-center gap-3">
                <User className="w-4.5 h-4.5 text-[var(--silver-400)]" /> Identity Metadata
              </h3>
              {!isEditingInfo && (
                <button
                  onClick={() => setIsEditingInfo(true)}
                  className="text-[9px] font-mono font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--silver-500)] transition-all hover:border-[var(--border-silver)] hover:text-[var(--silver-200)] cursor-pointer"
                >
                  Edit Metadata
                </button>
              )}
            </div>

            <div className="p-6 select-text">
              {!isEditingInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      label: "Full Operator Name",
                      value: profile.name || "Administrator",
                      icon: User,
                    },
                    {
                      label: "Matrix Username",
                      value: `@${profile.username || "admin"}`,
                      mono: true,
                      icon: FileText,
                    },
                    {
                      label: "Registered Email",
                      value: userEmail,
                      icon: Mail,
                    },
                    {
                      label: "Secured Phone",
                      value: profile.phone_number || "Not set",
                      icon: Phone,
                    },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-2"
                      >
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--silver-600)] font-mono flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-[var(--silver-500)]" />{" "}
                          {item.label}
                        </span>
                        <p
                          className={`text-sm font-bold text-[var(--silver-200)] ${
                            item.mono ? "font-mono" : ""
                          }`}
                        >
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                  <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-2 md:col-span-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--silver-600)] font-mono flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[var(--silver-500)]" />{" "}
                      Administrative Bio
                    </span>
                    <p className="text-[11px] leading-relaxed text-[var(--silver-400)] font-mono uppercase whitespace-pre-line">
                      {profile.bio || "No biography details configured in the vault."}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono select-none">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest ml-1 text-[var(--silver-600)]">
                        Full Operator Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={profile.name || ""}
                        className="premium-input w-full p-3.5 text-xs rounded-xl bg-black/40 border border-[var(--border-soft)] text-[var(--silver-200)] focus:border-[var(--border-silver)] focus:outline-none"
                        placeholder="Operator Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest ml-1 text-[var(--silver-600)]">
                        Matrix Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        defaultValue={profile.username || ""}
                        className="premium-input w-full p-3.5 text-xs rounded-xl bg-black/40 border border-[var(--border-soft)] text-[var(--silver-200)] focus:border-[var(--border-silver)] focus:outline-none"
                        placeholder="admin_handle"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest ml-1 text-[var(--silver-600)]">
                        Secured Phone
                      </label>
                      <input
                        type="text"
                        name="phone_number"
                        defaultValue={profile.phone_number || ""}
                        className="premium-input w-full p-3.5 text-xs rounded-xl bg-black/40 border border-[var(--border-soft)] text-[var(--silver-200)] focus:border-[var(--border-silver)] focus:outline-none"
                        placeholder="+62..."
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] font-black uppercase tracking-widest ml-1 text-[var(--silver-600)]">
                        Administrative Bio
                      </label>
                      <textarea
                        name="bio"
                        rows={3}
                        defaultValue={profile.bio || ""}
                        className="premium-input w-full p-3.5 text-xs rounded-xl bg-black/40 border border-[var(--border-soft)] text-[var(--silver-200)] focus:border-[var(--border-silver)] focus:outline-none resize-none"
                        placeholder="Write bio variables..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3.5 pt-5 border-t border-[var(--border-subtle)] font-mono">
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(false)}
                      className="px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer border border-[var(--border-soft)] text-[var(--silver-500)] hover:text-[var(--silver-300)] hover:bg-[var(--bg-elevated)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer bg-[var(--silver-200)] text-[#0f0f13] border border-[var(--silver-300)] hover:bg-[var(--silver-100)] hover:shadow-[0_0_20px_var(--silver-glow)] disabled:opacity-50"
                    >
                      {isLoading && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      )}{" "}
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Cryptographic Key Update Form */}
          <div className="panel rounded-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[rgba(10,10,14,0.2)] shrink-0 select-none">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--silver-200)] font-mono flex items-center gap-3">
                <Key className="w-4.5 h-4.5 text-[var(--silver-400)]" /> Cryptographic Access
              </h3>
              {!isEditingPassword && (
                <button
                  onClick={() => setIsEditingPassword(true)}
                  className="text-[9px] font-mono font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--silver-500)] transition-all hover:border-[var(--border-silver)] hover:text-[var(--silver-200)] cursor-pointer"
                >
                  Update Vault Key
                </button>
              )}
            </div>

            <div className="p-6">
              {!isEditingPassword ? (
                <div className="flex items-center gap-5 p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] select-none">
                  <div className="p-3 rounded-xl bg-[var(--bg-active)] border border-[var(--border-soft)] text-[var(--silver-400)]">
                    <Shield className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase font-mono tracking-wider text-[var(--silver-200)]">
                      Vault Key Confirmed
                    </p>
                    <p className="text-[9px] font-mono uppercase text-[var(--silver-600)] mt-0.5 leading-relaxed">
                      Session keys are cycled. Keep passwords complex, secure, and completely confidential.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono select-none">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest ml-1 text-[var(--silver-600)]">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        required
                        className="premium-input w-full p-3.5 text-xs rounded-xl bg-black/40 border border-[var(--border-soft)] text-[var(--silver-200)] focus:border-[var(--border-silver)] focus:outline-none"
                        placeholder="••••••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest ml-1 text-[var(--silver-600)]">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="password_confirmation"
                        required
                        className="premium-input w-full p-3.5 text-xs rounded-xl bg-black/40 border border-[var(--border-soft)] text-[var(--silver-200)] focus:border-[var(--border-silver)] focus:outline-none"
                        placeholder="••••••••••••"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3.5 pt-5 border-t border-[var(--border-subtle)] font-mono">
                    <button
                      type="button"
                      onClick={() => setIsEditingPassword(false)}
                      className="px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer border border-[var(--border-soft)] text-[var(--silver-500)] hover:text-[var(--silver-300)] hover:bg-[var(--bg-elevated)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer bg-[var(--silver-200)] text-[#0f0f13] border border-[var(--silver-300)] hover:bg-[var(--silver-100)] hover:shadow-[0_0_20px_var(--silver-glow)]"
                    >
                      {isLoading && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      )}{" "}
                      Update Key
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
