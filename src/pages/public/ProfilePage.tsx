import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Calendar, LogOut, ArrowLeft, ChevronDown, ChevronUp, ShoppingBag, Loader2 } from "lucide-react";

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

interface Order {
  id: string;
  package_id: string;
  package_name: string;
  price: string;
  whatsapp: string;
  specs: string;
  addons: string[];
  description: string;
  promo_code?: string | null;
  status: "pending" | "processing" | "completed" | "cancelled";
  created_at: string;
  updated_at?: string;
}

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [sessionRes, profileRes, ordersRes] = await Promise.all([
          fetch("/api/auth/session").then((r) => r.json()).then((d) => d as any).catch(() => null),
          fetch("/api/profile").then((r) => r.json()).then((d) => d as any).catch(() => null),
          fetch("/api/orders").then((r) => r.json()).then((d) => d as any).catch(() => null),
        ]);

        if (!sessionRes?.user) {
          navigate("/gateway?redirect=/profile");
          return;
        }

        if (isMounted) {
          setUserEmail(sessionRes.user.email || "");
          if (profileRes?.profile) {
            setProfile(profileRes.profile);
          } else {
            setProfile({
              id: sessionRes.user.id,
              name: sessionRes.user.name,
              username: sessionRes.user.name?.toLowerCase().replace(/\s+/g, "") || "client",
              phone_number: null,
              bio: null,
              profile_picture: sessionRes.user.profile_picture || null,
              role: sessionRes.user.role,
              created_at: sessionRes.user.created_at || new Date().toISOString(),
            });
          }

          if (ordersRes?.orders && Array.isArray(ordersRes.orders)) {
            setOrders(ordersRes.orders);
          }
          setPageLoading(false);
        }
      } catch (err) {
        console.error("Error loading profile data:", err);
        if (isMounted) setPageLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

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
    const updatePayload = {
      name: formData.get("name") as string,
      username: formData.get("username") as string,
      phone_number: formData.get("phone_number") as string,
      bio: formData.get("bio") as string,
    };

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });
      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
        setProfile((prev) => (prev ? { ...prev, ...updatePayload } : null));
        setIsEditingInfo(false);
      } else {
        setMessage({ type: "error", text: data.error || "Gagal memperbarui profil" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal memperbarui profil" });
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogout = async () => {
    setIsLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    navigate("/");
  };

  if (pageLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-root)] text-[var(--silver-400)]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="lg:h-screen lg:max-h-screen lg:overflow-hidden min-h-screen overflow-y-auto flex flex-col bg-[var(--bg-root)] text-[var(--silver-100)] select-none">
      {/* Subtle background texture */}
      <div
        className="fixed inset-0 opacity-[0.018] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--silver-500) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Header ── */}
      <header className="w-full max-w-6xl mx-auto px-8 lg:px-12 pt-7 pb-0 flex justify-between items-center z-10 shrink-0">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center shadow-lg group-hover:border-[var(--border-silver)] transition-all">
            <ArrowLeft className="w-3 h-3 text-[var(--silver-500)] group-hover:text-[var(--silver-200)] transition-colors" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.25em] font-mono text-[var(--silver-200)] group-hover:text-white transition-colors">
            SUKAMCD
          </span>
        </Link>
        
        <div className="h-px bg-gradient-to-r from-[var(--border-subtle)] via-[var(--border-soft)] to-transparent flex-grow mx-8 hidden sm:block" />
      </header>

      {/* ── Main ── */}
      <main className="w-full max-w-6xl mx-auto px-8 lg:px-12 flex-1 flex flex-col justify-center z-10 gap-8 py-4">
        {/* Page title */}
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-[var(--silver-600)] mb-2.5">
            — Manage Account
          </p>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] text-[var(--silver-100)] mb-3">
            Your <span className="text-[var(--silver-500)]">profile.</span>
          </h1>
          <p className="text-[12px] text-[var(--silver-500)] leading-relaxed max-w-sm font-light">
            Kelola informasi profil, foto avatar, dan status keanggotaan Anda di SukaMCD.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Left Column — Info & Avatar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Avatar block */}
            <div className="flex items-center gap-5">
              <div className="relative group cursor-pointer shrink-0">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden border border-[var(--border-soft)] bg-[var(--bg-surface)] p-1 transition-all duration-300 group-hover:border-[var(--border-silver)]">
                  <div className="w-full h-full rounded-xl overflow-hidden relative">
                    {profile.profile_picture ? (
                      <img src={profile.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--bg-elevated)]">
                        <User className="w-8 h-8 text-[var(--silver-500)]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[var(--silver-100)] leading-tight">
                  {profile.name || "Client"}
                </h2>
                <p className="text-xs text-[var(--silver-500)] font-mono mt-0.5">
                  @{profile.username || "client"}
                </p>
              </div>
            </div>

            <hr className="border-[var(--border-subtle)]" />

            {/* General Info */}
            <div className="space-y-4">
              {[
                { icon: Mail, label: "Email", value: userEmail },
                { icon: Calendar, label: "Member sejak", value: new Date(profile.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" }) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[var(--silver-500)]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)] mb-0.5">{label}</p>
                    <p className="text-xs font-medium text-[var(--silver-300)]">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-red-900/30 bg-red-950/10 text-red-400 hover:text-red-300 hover:bg-red-950/20 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Keluar Akun
            </button>
          </div>

          {/* Right Column — Edit Form & Order History */}
          <div className="lg:col-span-3 flex flex-col lg:h-[calc(100vh-230px)]">
            {/* Tabs Navigation */}
            <div className="flex gap-6 border-b border-[var(--border-subtle)] pb-2 mb-5 select-none shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`text-[10px] font-mono uppercase tracking-[0.2em] pb-1.5 transition-all duration-200 cursor-pointer ${
                  activeTab === "profile"
                    ? "text-white border-b-2 border-white font-black"
                    : "text-[var(--silver-500)] hover:text-[var(--silver-300)]"
                }`}
              >
                Profil Saya
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`text-[10px] font-mono uppercase tracking-[0.2em] pb-1.5 transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "orders"
                    ? "text-white border-b-2 border-white font-black"
                    : "text-[var(--silver-500)] hover:text-[var(--silver-300)]"
                }`}
              >
                Riwayat Pesanan
                {orders.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[9px] font-sans font-bold bg-[var(--silver-200)] text-[#0f0f13] rounded-full leading-none">
                    {orders.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Contents Panel */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0 pb-6">
              {activeTab === "profile" ? (
                <div className="space-y-4">
                  {/* Status alerts */}
                  {message && (
                    <div
                      className={`p-3.5 mb-4 rounded-xl text-xs font-semibold border animate-in zoom-in-95 duration-250 ${
                        message.type === "success"
                          ? "bg-emerald-950/10 border-emerald-800/30 text-emerald-400"
                          : "bg-red-950/10 border-red-800/30 text-red-400"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  {!isEditingInfo ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Nama Lengkap</p>
                          <div className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] select-text">
                            {profile.name || "Belum diatur"}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Username</p>
                          <div className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] select-text">
                            {profile.username ? `@${profile.username}` : "Belum diatur"}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Nomor Telepon</p>
                        <div className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] select-text">
                          {profile.phone_number || "Belum diatur"}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Bio</p>
                        <div className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] leading-relaxed select-text min-h-[100px]">
                          {profile.bio || "Belum ada bio yang ditulis."}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsEditingInfo(true)}
                        className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-[var(--silver-200)] text-[#0f0f13] hover:bg-[var(--silver-100)] active:scale-[0.99] cursor-pointer shadow-lg hover:shadow-[0_0_24px_rgba(212,212,216,0.12)] transition-all duration-200"
                      >
                        Ubah Profil
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Nama Lengkap</label>
                          <input
                            type="text"
                            name="name"
                            defaultValue={profile.name || ""}
                            required
                            className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:outline-none focus:bg-[var(--bg-elevated)] transition-all duration-200 placeholder-[var(--silver-700)]"
                            placeholder="Nama Lengkap"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Username</label>
                          <input
                            type="text"
                            name="username"
                            defaultValue={profile.username || ""}
                            required
                            className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:outline-none focus:bg-[var(--bg-elevated)] transition-all duration-200 placeholder-[var(--silver-700)]"
                            placeholder="username"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Nomor Telepon</label>
                        <input
                          type="text"
                          name="phone_number"
                          defaultValue={profile.phone_number || ""}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:outline-none focus:bg-[var(--bg-elevated)] transition-all duration-200 placeholder-[var(--silver-700)]"
                          placeholder="Nomor Telepon"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Bio</label>
                        <textarea
                          name="bio"
                          defaultValue={profile.bio || ""}
                          rows={4}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:outline-none focus:bg-[var(--bg-elevated)] transition-all duration-200 placeholder-[var(--silver-700)] resize-none leading-relaxed"
                          placeholder="Tulis bio singkat..."
                        />
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setIsEditingInfo(false)}
                          className="w-1/3 h-11 rounded-xl text-sm font-semibold flex items-center justify-center border border-[var(--border-soft)] bg-[var(--bg-surface)] text-[var(--silver-300)] hover:text-white active:scale-[0.99] transition-all duration-200 cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-2/3 h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-[var(--silver-200)] text-[#0f0f13] hover:bg-[var(--silver-100)] active:scale-[0.99] cursor-pointer disabled:opacity-50 transition-all duration-200 shadow-lg"
                        >
                          {isLoading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                          ) : (
                            <>Simpan</>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center gap-5 border border-dashed border-[var(--border-soft)] rounded-2xl bg-[rgba(10,10,14,0.2)] p-6">
                      <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-[var(--silver-500)]" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[var(--silver-200)]">Belum ada pesanan</p>
                        <p className="text-xs text-[var(--silver-500)] max-w-[240px] leading-relaxed">
                          Anda belum pernah melakukan pemesanan paket website atau aplikasi.
                        </p>
                      </div>
                      <Link
                        to="/pricing"
                        className="px-4 py-2 rounded-xl bg-[var(--silver-200)] text-[#0f0f13] hover:bg-[var(--silver-100)] text-xs font-semibold tracking-wider font-mono uppercase transition-all duration-200 cursor-pointer shadow-lg"
                      >
                        Pesan Sekarang
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3.5 animate-in fade-in duration-300">
                      {orders.map((order) => {
                        const isExpanded = expandedOrderId === order.id;
                        const orderDate = new Date(order.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        });

                        let statusLabel = "Menunggu";
                        let statusColor = "text-amber-400 bg-amber-950/10 border-amber-800/30";
                        if (order.status === "processing") {
                          statusLabel = "Diproses";
                          statusColor = "text-sky-400 bg-sky-950/10 border-sky-800/30";
                        } else if (order.status === "completed") {
                          statusLabel = "Selesai";
                          statusColor = "text-emerald-400 bg-emerald-950/10 border-emerald-800/30";
                        } else if (order.status === "cancelled") {
                          statusLabel = "Dibatalkan";
                          statusColor = "text-red-400 bg-red-950/10 border-red-800/30";
                        }

                        return (
                          <div
                            key={order.id}
                            className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                              isExpanded
                                ? "bg-[var(--bg-elevated)] border-[var(--border-silver)] shadow-lg"
                                : "bg-[var(--bg-surface)] border border-[var(--border-soft)] hover:border-[var(--border-med)]"
                            }`}
                          >
                            <div
                              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                              className="p-4 flex items-center justify-between cursor-pointer select-none"
                            >
                              <div className="space-y-1 pr-4">
                                <span className="text-[9px] font-mono text-[var(--silver-500)] uppercase tracking-wider">
                                  {orderDate}
                                </span>
                                <h4 className="text-sm font-bold text-[var(--silver-100)] tracking-tight">
                                  {order.package_name}
                                </h4>
                                <p className="text-xs font-mono text-[var(--silver-400)] font-black">
                                  {order.price}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-3 shrink-0">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border leading-none ${statusColor}`}>
                                  {statusLabel}
                                </span>
                                <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center">
                                  {isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-[var(--silver-400)]" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-[var(--silver-400)]" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="border-t border-[var(--border-subtle)] p-5 space-y-4 text-xs bg-black/10 select-text leading-relaxed animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div>
                                    <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)] mb-1">WhatsApp</p>
                                    <p className="font-mono text-[var(--silver-300)] font-bold">{order.whatsapp}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)] mb-1">Kode Promo</p>
                                    <p className="font-mono text-[var(--silver-300)] font-bold">
                                      {order.promo_code ? (
                                        <span className="text-emerald-400 font-bold uppercase tracking-wider">{order.promo_code}</span>
                                      ) : (
                                        <span className="text-[var(--silver-600)] font-light">-</span>
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)] mb-1">Order ID</p>
                                    <p className="font-mono text-[var(--silver-500)] select-all truncate text-[10px]">{order.id}</p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)] mb-1.5">Spesifikasi Detail</p>
                                  <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] font-mono text-[10px] text-[var(--silver-400)] whitespace-pre-wrap leading-relaxed">
                                    {order.specs}
                                  </div>
                                </div>

                                {order.addons && order.addons.length > 0 && (
                                  <div>
                                    <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)] mb-1.5">Layanan Tambahan (Add-ons)</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {order.addons.map((addon) => (
                                        <span
                                          key={addon}
                                          className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[10px] text-[var(--silver-300)] font-medium"
                                        >
                                          {addon}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)] mb-1.5">Keterangan Kebutuhan</p>
                                  <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-300)] leading-relaxed whitespace-pre-wrap">
                                    {order.description}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full max-w-6xl mx-auto px-8 lg:px-12 border-t border-[var(--border-subtle)] pt-6 flex justify-between items-end z-10 shrink-0 select-none pb-6">
        <div className="space-y-2.5">
          <div className="text-[9px] font-black uppercase tracking-wider text-[var(--silver-600)] font-mono">
            &copy; {new Date().getFullYear()} SukaMCD. All rights reserved.
          </div>
          <div className="flex gap-5">
            <a href="https://github.com/SukaMCD" className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Github</a>
            <a href="https://www.instagram.com/sukamcd.dev/" className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.linkedin.com/in/fabianrizkypratama/" className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
        
        <Link 
          to="/" 
          className="text-[9.5px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-[var(--silver-100)] transition-colors border-b border-[var(--border-subtle)] pb-0.5"
        >
          ← Back home
        </Link>
      </footer>
    </div>
  );
};
