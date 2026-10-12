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
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 select-none">
      {/* ── Profile Header visual card ── */}
      <div className="panel-silver rounded-2xl p-8 relative flex flex-col md:flex-row items-center gap-8 overflow-hidden select-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--silver-300)] to-transparent opacity-45" />

        <div className="relative group cursor-pointer shrink-0">
          <div className="w-32 h-32 rounded-2xl flex items-center justify-center overflow-hidden border border-[var(--border-med)] bg-[var(--bg-elevated)] p-1.5 transition-all duration-300 group-hover:border-[var(--border-silver)] group-hover:shadow-[0_0_25px_var(--silver-glow)]">
            <div className="w-full h-full rounded-xl overflow-hidden relative">
              {profile.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--bg-active)]">
                  <User className="w-14 h-14 text-[var(--silver-500)]" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center md:text-left space-y-2 flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h2 className="text-3xl font-black tracking-tight text-[var(--silver-100)]">
              {profile.name || "System Operator"}
            </h2>
            <span className="text-[9px] font-black font-mono px-3 py-1 rounded bg-[var(--bg-active)] border border-[var(--border-soft)] text-[var(--silver-300)] uppercase tracking-wider">
              {profile.role}
            </span>
          </div>
          <p className="font-mono text-base text-[var(--silver-500)] lowercase">
            @{profile.username || "admin"}
          </p>
          <p className="text-[10px] text-[var(--silver-600)] uppercase font-mono tracking-widest leading-relaxed max-w-lg mt-2">
            Authorized node controller. Credentials secured & encrypted via Cloudflare D1 Auth Daemon.
          </p>
        </div>
      </div>

      {/* ── Alert Notifications ── */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-mono uppercase tracking-wider font-extrabold border animate-in zoom-in-95 duration-300 ${
            message.type === "success"
              ? "bg-emerald-950/20 border-emerald-800/35 text-emerald-400"
              : "bg-red-950/20 border-red-800/35 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ── Main Operations Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left column: Stats ── */}
        <div className="lg:col-span-4 space-y-6">
          <section className="panel rounded-2xl p-6 flex flex-col gap-5">
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--silver-600)] font-mono flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-[var(--silver-500)]" /> Profile Metrics
            </h3>

            <div className="space-y-3">
              {[
                {
                  label: "Authorized Since",
                  value: new Date(profile.created_at).toLocaleDateString(
                    "en-US",
                    { month: "short", year: "numeric" }
                  ),
                  icon: Calendar,
                },
                {
                  label: "Shield Status",
                  value: "Active Integrity",
                  highlight: true,
                  icon: Shield,
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
                  >
                    <span className="text-[9px] uppercase tracking-wider font-black text-[var(--silver-500)] font-mono flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" /> {item.label}
                    </span>
                    {item.highlight ? (
                      <span className="text-emerald-400 flex items-center gap-1.5 text-[9px] font-mono font-black uppercase">
                        <span className="dot-online animate-emerald-pulse" /> Encrypted
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-extrabold text-[var(--silver-200)]">
                        {item.value}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--silver-600)] font-mono flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[var(--silver-500)]" /> Cryptographic Key
            </h3>
            <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-3 font-mono">
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-4 h-4" />
                <span className="text-[8.5px] font-black uppercase tracking-widest">
                  Operator Validated
                </span>
              </div>
              <p className="text-[10px] leading-relaxed text-[var(--silver-600)] uppercase">
                Access tokens are cycled per operation. Session signature securely locked to gateway device.
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
