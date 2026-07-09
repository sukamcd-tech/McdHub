"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Send, Loader2, CheckCircle, Globe, Smartphone, ShieldCheck, RefreshCw, AlertCircle, Check } from "lucide-react";
import { createClient, createMobileClient } from "@/lib/supabase";

// SILAKAN UBAH NOMOR WHATSAPP DI SINI (Gunakan kode negara, tanpa '+' atau '0' di depan. Contoh: 6281234567890)
const WHATSAPP_NUMBER = "6288905588200";

const plans = {
  static: {
    id: "static",
    name: "Landing Page Static",
    price: "Rp 500rb - 750rb",
    description: "1–5 Halaman (Home, About, Contact). Responsive, animasi halus, integrasi form ke email/WhatsApp.",
    addons: [
      { id: "custom_domain", label: "Custom Domain (.com, .co.id, dll.)", desc: "Menggunakan domain pilihan Anda alih-alih .my.id" },
    ]
  },
  "web-biasa": {
    id: "web-biasa",
    name: "Web Dinamis / CMS",
    price: "Rp 2,0jt - 2,5jt",
    description: "Web CMS, blog, atau portal berita sederhana dengan Admin Panel. Menggunakan PHP/Laravel/CI atau Fullstack modern.",
    addons: [
      { id: "custom_domain", label: "Custom Domain (.com, .co.id, dll.)", desc: "Menggunakan domain pilihan Anda alih-alih .my.id" },
    ]
  },
  "android-app": {
    id: "android-app",
    name: "Aplikasi Android Native",
    price: "Rp 2,5jt - 5,0jt",
    description: "Aplikasi fungsional (bukan sekadar web-view). Integrasi API, lokal database, UI/UX modern.",
    addons: [
      { id: "custom_domain", label: "Custom Domain untuk API/Admin Panel", desc: "Menggunakan domain pilihan Anda alih-alih .my.id untuk backend" },
      { id: "playstore", label: "Rilis ke Google Play Store", desc: "Bantuan pendaftaran dan rilis penuh di toko aplikasi Google Play" },
    ]
  },
  "web-erp": {
    id: "web-erp",
    name: "Sistem ERP / Enterprise",
    price: "Rp 7,5jt - 10,0jt",
    description: "Sistem manajemen bisnis terintegrasi (stok, keuangan, SDM, atau absensi). Kompleksitas tinggi, role-based access.",
    addons: [
      { id: "playstore", label: "Aplikasi Pendamping Android (Rilis Play Store)", desc: "Menambahkan dan merilis aplikasi pendamping Android untuk staff/klien ke Play Store" },
    ]
  },
  "erp-android": {
    id: "erp-android",
    name: "Sistem ERP + Android Native",
    price: "Rp 7,5jt - 15,0jt",
    description: "Kombinasi sistem ERP berbasis web dengan aplikasi Android native terintegrasi penuh.",
    addons: [
      { id: "playstore", label: "Rilis ke Google Play Store", desc: "Bantuan pendaftaran dan rilis penuh di toko aplikasi Google Play" },
    ]
  },
  "erp-monthly-basic": {
    id: "erp-monthly-basic",
    name: "ERP Bulanan - Basic (UMKM)",
    price: "Rp 150rb / bulan",
    description: "Hak akses sistem ERP cloud khusus UMKM. Efisien, cepat, dan siap pakai.",
    addons: []
  },
  "erp-monthly-prof": {
    id: "erp-monthly-prof",
    name: "ERP Bulanan - Profesional",
    price: "Rp 350rb / bulan",
    description: "Akses penuh modul ERP cloud dengan kapasitas pengguna tanpa batas untuk bisnis Anda.",
    addons: []
  },
  student: {
    id: "student",
    name: "Paket Khusus Pelajar / Mahasiswa",
    price: "Diskon s.d 30%",
    description: "Tugas akhir, skripsi, portfolio kelulusan, atau website organisasi sekolah/kampus. Tunjukkan Kartu Pelajar / KTM aktif.",
    addons: [
      { id: "custom_domain", label: "Custom Domain (.com, .co.id, dll.)", desc: "Menggunakan domain pilihan Anda alih-alih .my.id" },
    ]
  }
};

const parsePrice = (priceStr: string): { min: number; max: number; type: "range" | "single" | "text"; suffix: string } => {
  if (priceStr.toLowerCase().includes("diskon")) {
    return { min: 0, max: 0, type: "text", suffix: "" };
  }

  const isMonthly = priceStr.toLowerCase().includes("bulan");
  const cleanStr = priceStr.replace("Rp", "").replace("/ bulan", "").replace("/bulan", "").trim();

  const parseVal = (valStr: string): number => {
    const s = valStr.trim().toLowerCase().replace(",", ".");
    if (s.includes("rb")) {
      return parseFloat(s.replace("rb", "")) * 1000;
    }
    if (s.includes("jt")) {
      return parseFloat(s.replace("jt", "")) * 1000000;
    }
    return parseFloat(s) || 0;
  };

  const suffix = isMonthly ? " / bulan" : "";

  if (cleanStr.includes("-")) {
    const parts = cleanStr.split("-");
    const min = parseVal(parts[0]);
    const max = parseVal(parts[1]);
    return { min, max, type: "range", suffix };
  } else {
    const val = parseVal(cleanStr);
    return { min: val, max: val, type: "single", suffix };
  }
};

const formatVal = (val: number): string => {
  if (val >= 1000000) {
    const jt = val / 1000000;
    const formatted = parseFloat(jt.toFixed(2)).toString().replace(".", ",");
    return `${formatted}jt`;
  }
  if (val >= 1000) {
    const rb = val / 1000;
    const formatted = parseFloat(rb.toFixed(2)).toString().replace(".", ",");
    return `${formatted}rb`;
  }
  return val.toString();
};

const formatPrice = (min: number, max: number, type: "range" | "single" | "text", suffix: string): string => {
  if (type === "text") return "";
  if (type === "single") {
    return `Rp ${formatVal(min)}${suffix}`;
  }
  return `Rp ${formatVal(min)} - ${formatVal(max)}${suffix}`;
};

const applyDiscount = (priceStr: string, discountType: string, discountValue: number): string => {
  const parsed = parsePrice(priceStr);
  if (parsed.type === "text") return priceStr;

  let newMin = parsed.min;
  let newMax = parsed.max;

  if (discountType === "percentage") {
    const factor = (100 - discountValue) / 100;
    newMin = Math.round(parsed.min * factor);
    newMax = Math.round(parsed.max * factor);
  } else if (discountType === "nominal") {
    newMin = Math.max(0, parsed.min - discountValue);
    newMax = Math.max(0, parsed.max - discountValue);
  } else {
    return priceStr;
  }

  return formatPrice(newMin, newMax, parsed.type, parsed.suffix);
};

function OrderFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageParam = searchParams.get("package") || "static";

  const [selectedPlanId, setSelectedPlanId] = useState(packageParam);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Spesifikasi Detail per Paket
  const [staticPageCount, setStaticPageCount] = useState("1 Halaman");
  const [staticPurpose, setStaticPurpose] = useState("Company Profile / Profil Bisnis");

  const [dynamicFeatures, setDynamicFeatures] = useState<string[]>([]);
  const [dynamicIntegrations, setDynamicIntegrations] = useState<string[]>([]);

  const [androidFocus, setAndroidFocus] = useState("E-Commerce / Belanja Mobile");
  const [androidFeatures, setAndroidFeatures] = useState<string[]>([]);

  const [erpModules, setErpModules] = useState<string[]>([]);
  const [erpAccess, setErpAccess] = useState("Internal Perusahaan Saja");

  const [studentType, setStudentType] = useState("Tugas Akhir / Skripsi / Thesis");
  const [studentTech, setStudentTech] = useState("");
  const [erpIndustry, setErpIndustry] = useState("Retail / Toko Kelontong");
  const [erpDomainExtension, setErpDomainExtension] = useState(".com");

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    benefit: string;
    discount_type: "percentage" | "nominal" | "none";
    discount_value: number;
  } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoValidating, setPromoValidating] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoValidating(true);
    setPromoError("");

    try {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", promoInput.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const now = new Date();
        if (data.start_date && new Date(data.start_date) > now) {
          setPromoError("Kode diskon belum dimulai.");
          return;
        }
        if (data.end_date && new Date(data.end_date) < now) {
          setPromoError("Kode diskon sudah kedaluwarsa.");
          return;
        }

        setAppliedPromo({
          code: data.code,
          benefit: data.benefit,
          discount_type: data.discount_type as any || "none",
          discount_value: data.discount_value || 0
        });
        setPromoError("");
      } else {
        setPromoError("Kode diskon tidak valid atau sudah tidak aktif.");
      }
    } catch (err) {
      console.error("Error validating promo code:", err);
      setPromoError("Terjadi kesalahan sistem saat memvalidasi kode.");
    } finally {
      setPromoValidating(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError("");
  };

  useEffect(() => {
    if (packageParam && plans[packageParam as keyof typeof plans]) {
      setSelectedPlanId(packageParam);
    }
  }, [packageParam]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          // Redirect immediately tanpa delay
          router.replace(`/gateway?redirect=${encodeURIComponent(`/pricing/order?package=${packageParam}`)}`);
          return;
        }

        setIsLoggedIn(true);
        if (!email && data.session.user.email) {
          setEmail(data.session.user.email);
        }

        // Clean up OAuth query parameters from URL once session is resolved
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          if (url.searchParams.has("code") || url.searchParams.has("state")) {
            url.searchParams.delete("code");
            url.searchParams.delete("state");
            window.history.replaceState({}, document.title, url.pathname + url.search);
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
        router.replace(`/gateway?redirect=${encodeURIComponent(`/pricing/order?package=${packageParam}`)}`);
        return;
      } finally {
        setAuthChecked(true);
      }
    }

    checkAuth();
  }, [packageParam, router, supabase, email]);

  const currentPlan = plans[selectedPlanId as keyof typeof plans] || plans.static;

  const discountedPrice = useMemo(() => {
    if (!appliedPromo || appliedPromo.discount_type === "none") return currentPlan.price;
    return applyDiscount(currentPlan.price, appliedPromo.discount_type, appliedPromo.discount_value);
  }, [appliedPromo, currentPlan.price]);

  // Double-check: jika sudah dicek tapi tidak login, jangan tampilkan apa-apa (redirect sudah dijalan)
  if (authChecked && !isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center text-sm text-[var(--silver-500)]">
        <div>
          <p>Mengalihkan ke halaman login...</p>
          <p className="text-xs mt-2">Silakan tunggu atau <a href="/gateway" className="text-[var(--silver-300)] hover:text-white underline">klik di sini</a>.</p>
        </div>
      </div>
    );
  }

  if (!authChecked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-[var(--silver-500)]">
        Memeriksa status login...
      </div>
    );
  }

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const handleCheckboxToggle = (value: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const getSpecSummary = (isWA = false) => {
    const newline = isWA ? "%0A" : "\n";
    const bold = isWA ? "*" : "";
    if (selectedPlanId === "static") {
      return `${bold}Jumlah Halaman:${bold} ${staticPageCount}${newline}${bold}Tujuan Website:${bold} ${staticPurpose}`;
    }
    if (selectedPlanId === "web-biasa") {
      const featuresStr = dynamicFeatures.length > 0 ? dynamicFeatures.join(", ") : "-";
      const integrationsStr = dynamicIntegrations.length > 0 ? dynamicIntegrations.join(", ") : "-";
      return `${bold}Fitur Utama:${bold} ${featuresStr}${newline}${bold}Integrasi Pihak Ketiga:${bold} ${integrationsStr}`;
    }
    if (selectedPlanId === "android-app") {
      const featuresStr = androidFeatures.length > 0 ? androidFeatures.join(", ") : "-";
      return `${bold}Fokus Aplikasi:${bold} ${androidFocus}${newline}${bold}Fitur Dibutuhkan:${bold} ${featuresStr}`;
    }
    if (selectedPlanId === "web-erp") {
      const modulesStr = erpModules.length > 0 ? erpModules.join(", ") : "-";
      return `${bold}Modul ERP:${bold} ${modulesStr}${newline}${bold}Akses Sistem:${bold} ${erpAccess}${newline}${bold}Pilihan Domain:${bold} ${erpDomainExtension}`;
    }
    if (selectedPlanId === "erp-android") {
      const modulesStr = erpModules.length > 0 ? erpModules.join(", ") : "-";
      const featuresStr = androidFeatures.length > 0 ? androidFeatures.join(", ") : "-";
      return `${bold}Modul ERP:${bold} ${modulesStr}${newline}${bold}Fitur Android:${bold} ${featuresStr}${newline}${bold}Pilihan Domain:${bold} ${erpDomainExtension}`;
    }
    if (selectedPlanId === "erp-monthly-basic" || selectedPlanId === "erp-monthly-prof") {
      return `${bold}Sektor Industri:${bold} ${erpIndustry}`;
    }
    if (selectedPlanId === "student") {
      return `${bold}Jenis Tugas:${bold} ${studentType}${newline}${bold}Ketentuan Tech Stack:${bold} ${studentTech || "Bebas"}`;
    }
    return "-";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      let os = "Unknown";
      if (typeof window !== "undefined" && window.navigator) {
        const ua = window.navigator.userAgent;
        if (ua.indexOf("Windows") !== -1) os = "Windows";
        else if (ua.indexOf("Mac") !== -1) os = "macOS";
        else if (ua.indexOf("Linux") !== -1) os = "Linux";
        else if (ua.indexOf("Android") !== -1) os = "Android";
        else if (ua.indexOf("iPhone") !== -1 || ua.indexOf("iPad") !== -1) os = "iOS";
      }

      const addOnsText = selectedAddons.length > 0 
        ? selectedAddons.map(id => {
            const addon = currentPlan.addons.find(a => a.id === id);
            return `- ${addon?.label || id}`;
          }).join("\n")
        : "- Tidak ada add-on dipilih";

      const promoText = appliedPromo 
        ? `${appliedPromo.code} (${appliedPromo.benefit})` 
        : "- Tidak ada kode diskon digunakan";

      const priceDetailsText = appliedPromo && appliedPromo.discount_type !== "none"
        ? `${currentPlan.price} (Potongan: ${appliedPromo.discount_type === "percentage" ? `${appliedPromo.discount_value}%` : `Rp ${appliedPromo.discount_value.toLocaleString("id-ID")}`}) -> ${discountedPrice}`
        : currentPlan.price;

      const formattedDescription = `[Pemesanan Paket Website/App]
Paket Pilihan: ${currentPlan.name}
Harga Paket: ${priceDetailsText}
Nama Pelanggan: ${name}
Email: ${email}
No. WhatsApp: ${whatsapp}

Spesifikasi Detail Paket:
${getSpecSummary(false)}

Add-ons Terpilih:
${addOnsText}

Kode Diskon:
${promoText}

Deskripsi Kebutuhan Proyek:
${description}

---
Ketentuan Umum:
- Free hosting & domain .my.id (1 Tahun)
- Free revisi tampilan 2x
- Garansi Bug/Error 3 Bulan`;

      // Insert into orders history for the authenticated client user
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) {
        throw new Error("User tidak terautentikasi.");
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: userId,
            user_email: email,
            package_id: currentPlan.id,
            package_name: currentPlan.name,
            price: discountedPrice,
            whatsapp: whatsapp,
            specs: getSpecSummary(false),
            addons: selectedAddons,
            description: description,
            promo_code: appliedPromo ? appliedPromo.code : null,
            status: "pending",
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (orderError) throw orderError;

      setSubmitted(true);
      setOrderId(orderData?.[0]?.id || "SUCCESS");
    } catch (err) {
      console.error("Error submitting order:", err);
      alert("Gagal mengirim pesanan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const addOnsText = selectedAddons.length > 0
      ? selectedAddons.map(id => {
          const addon = currentPlan.addons.find(a => a.id === id);
          return `- ${addon?.label || id}`;
        }).join("%0A")
      : "- Tidak ada add-on dipilih";

    const priceText = appliedPromo && appliedPromo.discount_type !== "none"
      ? `~${currentPlan.price}~ *${discountedPrice}*`
      : currentPlan.price;

    const promoText = appliedPromo 
      ? `*${appliedPromo.code}* (${appliedPromo.benefit})` 
      : "- Tidak ada";

    const text = `Halo SukaMCD,%0A%0ASaya ingin memesan paket pengembangan website/aplikasi dengan detail berikut:%0A%0A*Paket:* ${currentPlan.name}%0A*Harga:* ${priceText}%0A*Nama:* ${name}%0A*Email:* ${email}%0A*No. WhatsApp:* ${whatsapp}%0A%0A*Spesifikasi Detail Paket:*%0A${getSpecSummary(true)}%0A%0A*Add-ons Terpilih:*%0A${addOnsText}%0A%0A*Kode Diskon:* ${promoText}%0A%0A*Deskripsi Kebutuhan:*%0A${encodeURIComponent(description)}%0A%0AMohon info kelanjutan proyek ini. Terima kasih!`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-6 animate-in fade-in duration-500 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center shadow-lg animate-bounce">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[var(--silver-100)]">Pesanan Berhasil Dikirim!</h2>
          <p className="text-xs text-[var(--silver-500)] leading-relaxed">
            Terima kasih, <span className="text-[var(--silver-200)] font-semibold">{name}</span>. Detail pesanan Anda telah tersimpan di sistem kami.
          </p>
        </div>
        <div className="w-full space-y-3.5 pt-4">
          <button
            onClick={handleWhatsAppRedirect}
            className="w-full h-11 rounded-xl text-xs font-mono tracking-[0.15em] font-black uppercase bg-[#25D366] text-black hover:bg-[#20ba5a] active:scale-[0.99] cursor-pointer shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            Hubungi Lewat WhatsApp
          </button>
          
          <button
            onClick={() => {
              setSubmitted(false);
              setName("");
              setEmail("");
              setWhatsapp("");
              setDescription("");
              setSelectedAddons([]);
            }}
            className="text-[10px] font-mono uppercase tracking-widest text-[var(--silver-600)] hover:text-[var(--silver-300)] transition-colors border-b border-[var(--border-subtle)] pb-0.5"
          >
            Buat Pesanan Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
      
      {/* Kiri: Ringkasan Paket & Ketentuan */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-silver)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.02] to-transparent pointer-events-none" />
          
          <span className="text-[8px] font-mono font-black uppercase tracking-[0.15em] text-[var(--silver-500)]">
            Selected Plan
          </span>
          
          {/* Dropdown pemilih paket jika ingin ganti */}
          <div className="mt-2.5 mb-4">
            <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)] mb-1.5">Ganti Paket</label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-root)] border border-[var(--border-soft)] text-[var(--silver-200)] focus:outline-none focus:border-[var(--border-silver)] transition-all cursor-pointer font-sans"
            >
              {Object.values(plans).map((plan) => (
                <option key={plan.id} value={plan.id} className="bg-[var(--bg-surface)] text-[var(--silver-200)]">
                  {plan.name} ({plan.price})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-bold text-[var(--silver-100)] tracking-tight">
                {currentPlan.name}
              </h3>
              {appliedPromo && appliedPromo.discount_type !== "none" ? (
                <div className="flex flex-col mt-0.5">
                  <span className="text-xs line-through text-zinc-500 font-medium">
                    {currentPlan.price}
                  </span>
                  <span className="text-lg font-black text-emerald-400 tracking-tight">
                    {discountedPrice}
                  </span>
                </div>
              ) : (
                <p className="text-lg font-black text-gradient bg-gradient-to-b from-[var(--silver-100)] via-[var(--silver-200)] to-[var(--silver-400)] bg-clip-text text-transparent tracking-tight mt-0.5">
                  {currentPlan.price}
                </p>
              )}
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--silver-500)] font-medium">
              {currentPlan.description}
            </p>
          </div>
        </div>

        {/* Layanan Tambahan (Ketentuan Ringkas) */}
        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
          <h4 className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--silver-400)] border-b border-[var(--border-subtle)] pb-2">
            Termasuk di setiap paket:
          </h4>
          <ul className="space-y-3 text-[11px] text-[var(--silver-500)] font-light leading-relaxed">
            <li className="flex gap-2.5 items-start">
              <Globe className="w-3.5 h-3.5 text-[var(--silver-400)] shrink-0 mt-0.5" />
              <span>Free Hosting & domain <strong className="text-[var(--silver-300)]">.my.id</strong> untuk 1 tahun pertama.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <RefreshCw className="w-3.5 h-3.5 text-[var(--silver-400)] shrink-0 mt-0.5" />
              <span>Batas revisi tampilan sebanyak <strong className="text-[var(--silver-300)]">2x</strong> (tidak termasuk perubahan alur logika inti / tech stack).</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--silver-400)] shrink-0 mt-0.5" />
              <span>Garansi bug-free dan perbaikan error fungsional selama <strong className="text-[var(--silver-300)]">3 bulan</strong> setelah serah terima.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Kanan: Formulir Pemesanan */}
      <div className="lg:col-span-3">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">
                Nama Lengkap / Instansi
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:outline-none focus:bg-[var(--bg-elevated)] transition-all duration-200 placeholder-[var(--silver-700)]"
                placeholder="Fabian Rizky"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">
                Alamat Email
              </label>
              <input
                type="email"
                value={email}
                readOnly
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-500)] focus:outline-none transition-all duration-200 placeholder-[var(--silver-700)] cursor-default caret-transparent opacity-70"
                placeholder="you@sukamcd.tech"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">
              Nomor WhatsApp
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ""))}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:outline-none focus:bg-[var(--bg-elevated)] transition-all duration-200 placeholder-[var(--silver-700)]"
              placeholder="Contoh: 081234567890"
            />
          </div>

          {/* ── SPESIFIKASI DETIL PAKET (Dinamis Berdasarkan Pilihan) ── */}
          <div className="p-5.5 rounded-2xl bg-[rgba(10,10,14,0.3)] border border-[var(--border-soft)] space-y-4">
            <h4 className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--silver-400)] border-b border-[var(--border-subtle)] pb-2 select-none">
              Detail Spesifikasi Proyek ({currentPlan.name})
            </h4>

            {/* 1. Landing Page Static Specs */}
            {selectedPlanId === "static" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Jumlah Halaman</label>
                  <select
                    value={staticPageCount}
                    onChange={(e) => setStaticPageCount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-200)] focus:outline-none focus:border-[var(--border-silver)] cursor-pointer"
                  >
                    <option value="1 Halaman">1 Halaman (Single-page Landing Page)</option>
                    <option value="2 - 3 Halaman">2 - 3 Halaman</option>
                    <option value="4 - 5 Halaman">4 - 5 Halaman</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Tujuan / Tema Website</label>
                  <select
                    value={staticPurpose}
                    onChange={(e) => setStaticPurpose(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-200)] focus:outline-none focus:border-[var(--border-silver)] cursor-pointer"
                  >
                    <option value="Company Profile / Profil Bisnis">Company Profile / Profil Bisnis</option>
                    <option value="Portfolio Pribadi / CV Online">Portfolio Pribadi / CV Online</option>
                    <option value="Landing Page Promosi Produk/Jasa">Landing Page Promosi Produk/Jasa</option>
                    <option value="Website Undangan / Event">Website Undangan / Event</option>
                    <option value="Lainnya (Custom)">Lainnya (Custom)</option>
                  </select>
                </div>
              </div>
            )}

            {/* 2. Web Dinamis / CMS Specs */}
            {selectedPlanId === "web-biasa" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Fitur Utama yang Diinginkan</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--silver-300)]">
                    {[
                      "Sistem Keanggotaan / Registrasi User",
                      "Toko Online / E-Commerce Basic",
                      "Blog / Portal Berita Dinamis",
                      "Sistem Booking / Reservasi",
                      "Admin Panel Kustom (CMS)",
                    ].map((feature) => {
                      const isChecked = dynamicFeatures.includes(feature);
                      return (
                        <div
                          key={feature}
                          onClick={() => handleCheckboxToggle(feature, dynamicFeatures, setDynamicFeatures)}
                          className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--border-soft)] select-none"
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isChecked ? "bg-[var(--silver-200)] border-[var(--silver-200)] text-black" : "border-[var(--border-soft)]"}`}>
                            {isChecked && <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-[11px] font-medium leading-none">{feature}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Integrasi Pihak Ketiga</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--silver-300)]">
                    {[
                      "Payment Gateway (Midtrans, Doku, dll.)",
                      "Kalkulasi Ongkir Otomatis (RajaOngkir)",
                      "Live Chat Widget / WhatsApp Click-to-Chat",
                      "Analitik & Tracking (Google Analytics)",
                    ].map((integration) => {
                      const isChecked = dynamicIntegrations.includes(integration);
                      return (
                        <div
                          key={integration}
                          onClick={() => handleCheckboxToggle(integration, dynamicIntegrations, setDynamicIntegrations)}
                          className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--border-soft)] select-none"
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isChecked ? "bg-[var(--silver-200)] border-[var(--silver-200)] text-black" : "border-[var(--border-soft)]"}`}>
                            {isChecked && <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-[11px] font-medium leading-none">{integration}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Android App Specs */}
            {selectedPlanId === "android-app" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Fokus Utama Aplikasi</label>
                  <select
                    value={androidFocus}
                    onChange={(e) => setAndroidFocus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-200)] focus:outline-none focus:border-[var(--border-silver)] cursor-pointer"
                  >
                    <option value="E-Commerce / Belanja Mobile">E-Commerce / Belanja Mobile</option>
                    <option value="Sistem Kasir / POS Mobile">Sistem Kasir / POS Mobile</option>
                    <option value="Sistem Informasi / Portal Berita">Sistem Informasi / Portal Berita</option>
                    <option value="Sosial Media / Chatting Komunitas">Sosial Media / Chatting Komunitas</option>
                    <option value="Aplikasi Ojek Online / Delivery">Aplikasi Ojek Online / Delivery</option>
                    <option value="Lainnya (Custom)">Lainnya (Custom)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Fitur Mobile yang Dibutuhkan</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--silver-300)]">
                    {[
                      "Push Notifications",
                      "GPS & Google Maps Integration",
                      "Akses Kamera & Barcode Scanner",
                      "Database Lokal (Mode Offline)",
                      "Biometric Auth (Sidik Jari / FaceID)",
                    ].map((feature) => {
                      const isChecked = androidFeatures.includes(feature);
                      return (
                        <div
                          key={feature}
                          onClick={() => handleCheckboxToggle(feature, androidFeatures, setAndroidFeatures)}
                          className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--border-soft)] select-none"
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isChecked ? "bg-[var(--silver-200)] border-[var(--silver-200)] text-black" : "border-[var(--border-soft)]"}`}>
                            {isChecked && <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-[11px] font-medium leading-none">{feature}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Web ERP Specs */}
            {selectedPlanId === "web-erp" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Modul ERP yang Diperlukan</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--silver-300)]">
                    {[
                      "Manajemen Inventaris / Gudang",
                      "Keuangan, Akuntansi & Pembukuan",
                      "SDM, Kepegawaian & Penggajian (HRIS)",
                      "Customer Relationship Management (CRM)",
                      "Modul Pembelian & Penjualan (Purchasing/Sales)",
                    ].map((module) => {
                      const isChecked = erpModules.includes(module);
                      return (
                        <div
                          key={module}
                          onClick={() => handleCheckboxToggle(module, erpModules, setErpModules)}
                          className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--border-soft)] select-none"
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isChecked ? "bg-[var(--silver-200)] border-[var(--silver-200)] text-black" : "border-[var(--border-soft)]"}`}>
                            {isChecked && <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-[11px] font-medium leading-none">{module}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Akses Sistem</label>
                  <select
                    value={erpAccess}
                    onChange={(e) => setErpAccess(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-200)] focus:outline-none focus:border-[var(--border-silver)] cursor-pointer"
                  >
                    <option value="Internal Perusahaan Saja">Internal Perusahaan Saja</option>
                    <option value="Bisa Diakses Publik / Klien Luar">Bisa Diakses Publik / Klien Luar</option>
                    <option value="Multi-Cabang / Multi-Gudang Terintegrasi">Multi-Cabang / Multi-Gudang Terintegrasi</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Pilihan Ekstensi Domain</label>
                  <select
                    value={erpDomainExtension}
                    onChange={(e) => setErpDomainExtension(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-200)] focus:outline-none focus:border-[var(--border-silver)] cursor-pointer"
                  >
                    <option value=".com">.com (Internasional / Bisnis Umum)</option>
                    <option value=".co.id">.co.id (Resmi Perusahaan Indonesia - Perlu SIUP/NIB)</option>
                  </select>
                </div>
              </div>
            )}

            {/* 4b. ERP + Android Specs */}
            {selectedPlanId === "erp-android" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Modul ERP yang Diperlukan</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--silver-300)]">
                    {[
                      "Manajemen Inventaris / Gudang",
                      "Keuangan, Akuntansi & Pembukuan",
                      "SDM, Kepegawaian & Penggajian (HRIS)",
                      "Customer Relationship Management (CRM)",
                      "Modul Pembelian & Penjualan (Purchasing/Sales)",
                    ].map((module) => {
                      const isChecked = erpModules.includes(module);
                      return (
                        <div
                          key={module}
                          onClick={() => handleCheckboxToggle(module, erpModules, setErpModules)}
                          className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--border-soft)] select-none"
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isChecked ? "bg-[var(--silver-200)] border-[var(--silver-200)] text-black" : "border-[var(--border-soft)]"}`}>
                            {isChecked && <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-[11px] font-medium leading-none">{module}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Fitur Mobile Android Native</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--silver-300)]">
                    {[
                      "Push Notifications",
                      "GPS & Google Maps Integration",
                      "Akses Kamera & Barcode Scanner",
                      "Database Lokal (Mode Offline)",
                      "Biometric Auth (Sidik Jari / FaceID)",
                    ].map((feature) => {
                      const isChecked = androidFeatures.includes(feature);
                      return (
                        <div
                          key={feature}
                          onClick={() => handleCheckboxToggle(feature, androidFeatures, setAndroidFeatures)}
                          className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--border-soft)] select-none"
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isChecked ? "bg-[var(--silver-200)] border-[var(--silver-200)] text-black" : "border-[var(--border-soft)]"}`}>
                            {isChecked && <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-[11px] font-medium leading-none">{feature}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Pilihan Ekstensi Domain</label>
                  <select
                    value={erpDomainExtension}
                    onChange={(e) => setErpDomainExtension(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-200)] focus:outline-none focus:border-[var(--border-silver)] cursor-pointer"
                  >
                    <option value=".com">.com (Internasional / Bisnis Umum)</option>
                    <option value=".co.id">.co.id (Resmi Perusahaan Indonesia - Perlu SIUP/NIB)</option>
                  </select>
                </div>
              </div>
            )}

            {/* 4c. ERP Monthly Specs (Basic & Pro) */}
            {(selectedPlanId === "erp-monthly-basic" || selectedPlanId === "erp-monthly-prof") && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Sektor Industri / Jenis Bisnis</label>
                  <select
                    value={erpIndustry}
                    onChange={(e) => setErpIndustry(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-200)] focus:outline-none focus:border-[var(--border-silver)] cursor-pointer"
                  >
                    <option value="Retail / Toko Kelontong">Retail / Toko Kelontong</option>
                    <option value="F&B / Restoran & Kafe">F&B / Restoran & Kafe</option>
                    <option value="Jasa / Pelayanan">Jasa / Pelayanan</option>
                    <option value="Distributor / Grosir">Distributor / Grosir</option>
                    <option value="Manufaktur / Pabrik Kecil">Manufaktur / Pabrik Kecil</option>
                    <option value="Lainnya">Lainnya (Tulis detail di bawah)</option>
                  </select>
                </div>
              </div>
            )}

            {/* 5. Student Specs */}
            {selectedPlanId === "student" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Jenis Tugas / Proyek</label>
                  <select
                    value={studentType}
                    onChange={(e) => setStudentType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-200)] focus:outline-none focus:border-[var(--border-silver)] cursor-pointer"
                  >
                    <option value="Tugas Akhir / Skripsi / Thesis">Tugas Akhir / Skripsi / Thesis</option>
                    <option value="Proyek Ujian Tengah/Akhir Semester (UTS/UAS)">Proyek Ujian Tengah/Akhir Semester (UTS/UAS)</option>
                    <option value="Website Organisasi Sekolah/Kampus (OSIS/BEM)">Website Organisasi Sekolah/Kampus (OSIS/BEM)</option>
                    <option value="Portfolio Pribadi Kelulusan / CV Siswa">Portfolio Pribadi Kelulusan / CV Siswa</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">Ketentuan Tech Stack (Jika Ada)</label>
                  <input
                    type="text"
                    value={studentTech}
                    onChange={(e) => setStudentTech(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:outline-none focus:bg-[var(--bg-elevated)] transition-all duration-200 placeholder-[var(--silver-700)] text-[var(--silver-100)]"
                    placeholder="Contoh: Laravel 11 & Bootstrap, HTML/CSS polos, React & Node.js, dll."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Add-ons Selector */}
          {currentPlan.addons && currentPlan.addons.length > 0 && (
            <div className="space-y-2">
              <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">
                Layanan Tambahan (Add-ons)
              </label>
              <div className="space-y-2.5">
                {currentPlan.addons.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => handleAddonToggle(addon.id)}
                      className={`p-3.5 rounded-xl border transition-all duration-250 cursor-pointer flex items-center justify-between select-none ${
                        isChecked
                          ? "bg-[var(--bg-elevated)] border-[var(--border-silver)] shadow-md"
                          : "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-soft)]"
                      }`}
                    >
                      <div className="space-y-0.5 pr-4">
                        <span className="text-xs font-bold text-[var(--silver-200)] block">
                          {addon.label}
                        </span>
                        <span className="text-[10px] text-[var(--silver-500)] font-light block leading-normal">
                          {addon.desc}
                        </span>
                      </div>
                      <div className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-all ${
                        isChecked
                          ? "bg-[var(--silver-200)] border-[var(--silver-200)] text-[#0f0f13]"
                          : "border-[var(--border-soft)]"
                      }`}>
                        {isChecked && (
                          <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">
              Keterangan Kebutuhan Proyek
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:outline-none focus:bg-[var(--bg-elevated)] transition-all duration-200 placeholder-[var(--silver-700)] resize-none leading-relaxed"
              placeholder="Jelaskan secara singkat fitur utama, jenis bisnis, atau kebutuhan spesifik sistem Anda..."
            />
          </div>

          {/* Kode Diskon Section */}
          <div className="space-y-2">
            <label className="block text-[9px] font-mono uppercase tracking-widest text-[var(--silver-600)]">
              Kode Diskon (Opsional)
            </label>
            <div className="flex gap-2.5">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase());
                    setPromoError("");
                  }}
                  disabled={!!appliedPromo || promoValidating}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-100)] focus:border-[var(--border-silver)] focus:outline-none focus:bg-[var(--bg-elevated)] transition-all duration-200 placeholder-[var(--silver-700)] font-mono uppercase tracking-wider disabled:opacity-50"
                  placeholder="CONTOH: DISKON50"
                />
                {appliedPromo && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
              </div>

              {appliedPromo ? (
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="px-4 py-2.5 rounded-xl border border-rose-500/30 hover:border-rose-500 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-[10px] font-mono tracking-widest uppercase transition-all duration-200 cursor-pointer"
                >
                  Hapus
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={!promoInput.trim() || promoValidating}
                  className="px-5 py-2.5 rounded-xl bg-[var(--silver-200)] text-[#0f0f13] hover:bg-[var(--silver-100)] disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-mono tracking-widest uppercase transition-all duration-200 cursor-pointer"
                >
                  {promoValidating ? "..." : "Terapkan"}
                </button>
              )}
            </div>

            {/* Error or Success Feedback */}
            {promoError && (
              <p className="text-[10px] text-rose-400 flex items-center gap-1.5 mt-1 font-mono">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {promoError}
              </p>
            )}
            {appliedPromo && (
              <p className="text-[10px] text-emerald-400 flex items-center gap-1.5 mt-1 font-mono">
                <Check className="w-3.5 h-3.5 shrink-0" />
                Benefit Terpasang: <strong className="text-white">{appliedPromo.benefit}</strong>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-11 rounded-xl text-xs font-mono tracking-[0.15em] font-black uppercase flex items-center justify-center gap-2 transition-all duration-200 ${
              loading
                ? "bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--silver-600)] cursor-not-allowed"
                : "bg-[var(--silver-200)] text-[#0f0f13] hover:bg-[var(--silver-100)] active:scale-[0.99] cursor-pointer shadow-lg hover:shadow-[0_0_24px_rgba(212,212,216,0.12)]"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Mengirim...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Kirim Pesanan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function OrderFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <Loader2 className="w-6 h-6 animate-spin text-[var(--silver-400)]" />
      <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--silver-500)]">
        Memuat Detail Formulir...
      </span>
    </div>
  );
}

export default function OrderPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg-root)] text-[var(--silver-100)]">
      <Loader2 className="w-6 h-6 animate-spin text-[var(--silver-400)]" />
    </div>
  );
}

function OriginalOrderPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-8 lg:p-12 relative bg-[var(--bg-root)] text-[var(--silver-100)] selection:bg-white selection:text-black">
      
      {/* Cyber Grid Background */}
      <div 
        className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--silver-500) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center z-10 shrink-0 mb-10">
        <Link href="/pricing" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center shadow-lg group-hover:border-[var(--border-silver)] transition-all">
            <ArrowLeft className="w-3 h-3 text-[var(--silver-500)] group-hover:text-[var(--silver-200)] transition-colors" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.25em] font-mono text-[var(--silver-200)] group-hover:text-white transition-colors">
            Pricing
          </span>
        </Link>
        <div className="h-px bg-gradient-to-r from-[var(--border-subtle)] via-[var(--border-soft)] to-transparent flex-grow mx-8 hidden sm:block" />
      </header>

      {/* Main Section */}
      <main className="w-full max-w-6xl mx-auto flex-grow z-10 flex flex-col justify-center gap-8 py-4">
        
        {/* Title */}
        <div className="space-y-2.5 mb-2">
          <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[var(--silver-600)]">
            — Project Order Form
          </span>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] text-[var(--silver-100)]">
            Konfigurasi <span className="text-[var(--silver-500)]">Pesanan.</span>
          </h1>
          <p className="text-[11.5px] text-[var(--silver-500)] leading-relaxed max-w-md font-light">
            Isi formulir kontak dan spesifikasi tambahan berikut untuk memulai kolaborasi proyek digital Anda.
          </p>
        </div>

        {/* Suspense Wrapper to prevent build-time deoptimization */}
        <Suspense fallback={<OrderFallback />}>
          <OrderFormContent />
        </Suspense>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto border-t border-[var(--border-subtle)] pt-6 flex justify-between items-end z-10 shrink-0 select-none mt-10">
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
          href="/pricing" 
          className="text-[9.5px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-[var(--silver-100)] transition-colors border-b border-[var(--border-subtle)] pb-0.5"
        >
          ← Back
        </Link>
      </footer>
    </div>
  );
}
