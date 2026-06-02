"use client";

import type { Metadata } from "next";
import Link from "next/link";import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";import { ArrowLeft, Check, Sparkles, AlertCircle, ShieldCheck, RefreshCw, Globe, HelpCircle, Lock, User } from "lucide-react";
import { motion } from "framer-motion";

export const metadata: Metadata = {
  title: "SukaMCD | Pricing",
  description: "Explore SukaMCD pricing packages for websites, apps, and enterprise systems.",
  openGraph: {
    title: "SukaMCD | Pricing",
    description: "Explore SukaMCD pricing packages for websites, apps, and enterprise systems.",
    type: "website",
    url: "https://sukamcd.dev/pricing",
  },
  twitter: {
    card: "summary_large_image",
    title: "SukaMCD | Pricing",
    description: "Explore SukaMCD pricing packages for websites, apps, and enterprise systems.",
  },
};

const plans = [
  {
    id: "static",
    name: "Landing Page Static",
    price: "Rp 500rb - 750rb",
    description: "Cocok untuk portofolio, profil bisnis sederhana, atau peluncuran produk baru.",
    badge: "Terjangkau",
    features: [
      "1–5 Halaman Teroptimasi (Home, About, Contact)",
      "Desain Responsive & Modern (Mobile-First)",
      "Animasi Halus & Interaktif (Framer Motion)",
      "Integrasi Form Kontak (ke Email/WhatsApp)",
      "SEO Dasar & Kecepatan Akses Super Cepat",
      "Domain .my.id & Hosting Gratis (1 Tahun)",
    ],
    accent: "rgba(212, 212, 216, 0.15)",
  },
  {
    id: "web-biasa",
    name: "Web Dinamis / CMS",
    price: "Rp 2,0jt - 2,5jt",
    description: "Sempurna untuk blog, portal berita sederhana, e-commerce basic, atau web dinamis CRUD.",
    badge: "Populer",
    features: [
      "Multi-page / Konten Dinamis Tanpa Batas",
      "Admin Panel (CMS) untuk Kelola Konten",
      "Fitur CRUD Lengkap sesuai Kebutuhan",
      "Tech Stack: PHP/Laravel/CodeIgniter atau Fullstack JS",
      "Integrasi Database (MySQL / PostgreSQL)",
      "Domain .my.id & Hosting Gratis (1 Tahun)",
    ],
    accent: "rgba(212, 212, 216, 0.25)",
    popular: true,
  },
  {
    id: "android-app",
    name: "Aplikasi Android Native",
    price: "Rp 2,5jt - 5,0jt",
    description: "Aplikasi mobile fungsional (bukan sekadar webview) untuk kebutuhan bisnis mobile-first.",
    badge: "Native App",
    features: [
      "Aplikasi Android Fungsional Penuh",
      "Bukan Sekadar Web-View / Pembungkus Web",
      "Integrasi API & Database Lokal",
      "UI/UX Modern & Responsif untuk Tablet & HP",
      "Notifikasi Push & Fitur Offline (Opsional)",
      "Domain .my.id & Hosting API Gratis (1 Tahun)",
    ],
    accent: "rgba(212, 212, 216, 0.15)",
  },
  {
    id: "web-erp",
    name: "Sistem ERP / Enterprise",
    price: "Rp 5,0jt - 10,0jt",
    description: "Sistem manajemen bisnis terintegrasi berskala besar untuk efisiensi operasional.",
    badge: "Enterprise",
    features: [
      "Modul Manajemen Bisnis (Stok, Keuangan, SDM, Absensi)",
      "Kompleksitas Tinggi dengan Akses Berbasis Peran (Role-based)",
      "Multi-platform Integration (Terhubung ke Mobile/API)",
      "Dasbor Analitik & Laporan Interaktif",
      "Keamanan Tinggi & Enkripsi Data Sensitif",
      "Domain .com / .co.id & Hosting Cloud Server (1 Tahun)",
    ],
    accent: "rgba(212, 212, 216, 0.15)",
  },
  {
    id: "erp-android",
    name: "Sistem ERP + Android Native",
    price: "Rp 7,5jt - 15,0jt",
    description: "Kombinasi sistem ERP berbasis web dengan aplikasi Android native terintegrasi penuh.",
    badge: "Enterprise Plus",
    features: [
      "Semua Fitur Paket Sistem ERP / Enterprise",
      "Aplikasi Android Native (Kotlin/Java)",
      "Sinkronisasi Data Real-time via API",
      "Push Notifications & Scan Barcode Kamera",
      "Rilis Google Play Store (Dibantu Penuh)",
      "Cloud VPS Dedicated & SSL (1 Tahun)",
    ],
    accent: "rgba(212, 212, 216, 0.15)",
    comingSoon: true,
  },
  {
    id: "erp-monthly-basic",
    name: "ERP Bulanan - Basic (UMKM)",
    price: "Rp 150rb / bulan",
    description: "Hak akses sistem ERP cloud khusus UMKM. Efisien, cepat, dan siap pakai.",
    badge: "SaaS Basic",
    features: [
      "Modul Kasir (POS) & Manajemen Stok/Gudang",
      "Maksimal 3 Akun Staff / Pengguna",
      "Laporan Penjualan & Inventaris Otomatis",
      "Hosting, Server, & Maintenance Ditanggung SukaMCD",
      "Pembaruan Sistem & Fitur Berkala",
    ],
    accent: "rgba(212, 212, 216, 0.1)",
    comingSoon: true,
  },
  {
    id: "erp-monthly-prof",
    name: "ERP Bulanan - Profesional",
    price: "Rp 350rb / bulan",
    description: "Akses penuh modul ERP cloud dengan kapasitas pengguna tanpa batas untuk bisnis Anda.",
    badge: "SaaS Pro",
    features: [
      "Semua Fitur Paket ERP Bulanan Basic",
      "Modul Akuntansi, CRM, Pembelian & SDM (HRIS)",
      "Akun Staff / Pengguna Tanpa Batas (Unlimited)",
      "Dashboard Analitik Multi-cabang & Multi-gudang",
      "Backup Data Mingguan Otomatis",
      "Dukungan Teknis Prioritas via WA",
    ],
    accent: "rgba(212, 212, 216, 0.15)",
    comingSoon: true,
  },
];

const policies = [
  {
    icon: Globe,
    title: "Hosting & Domain .my.id",
    desc: "Semua paket sudah termasuk sewa hosting & domain .my.id selama 1 tahun secara gratis. Untuk custom domain (.com, .co.id, dll) akan dikenakan biaya tambahan.",
  },
  {
    icon: RefreshCw,
    title: "Free 2x Revisi Tampilan",
    desc: "Kami memberikan 2 kali kesempatan revisi visual/tampilan secara gratis. Revisi tidak berlaku untuk perubahan alur logika inti sistem atau pergantian tech stack.",
  },
  {
    icon: ShieldCheck,
    title: "Garansi Bug 3 Bulan",
    desc: "Jaminan bebas dari error fungsional dan bug selama 3 bulan setelah rilis. Kami akan memperbaikinya secara cepat tanpa biaya tambahan.",
  },
  {
    icon: AlertCircle,
    title: "Rilis Google Play Store",
    desc: "Khusus untuk paket Aplikasi Android, publikasi ke Google Play Store dapat dibantu sepenuhnya dengan biaya tambahan untuk akun developer & penyiapan.",
  },
];

export default function PricingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      setAuthChecked(true);

      // Clean up OAuth query parameters from URL once session is resolved
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.has("code") || url.searchParams.has("state")) {
          url.searchParams.delete("code");
          url.searchParams.delete("state");
          window.history.replaceState({}, document.title, url.pathname + url.search);
        }
      }
    }

    loadSession();
  }, [supabase]);

  const handleSelectPlan = (planId: string) => {
    const orderPath = `/pricing/order?package=${planId}`;
    if (!authChecked) {
      return;
    }

    const plan = plans.find(p => p.id === planId);
    if (plan?.comingSoon) {
      return;
    }

    if (!isLoggedIn) {
      router.push(`/gateway?redirect=${encodeURIComponent(orderPath)}`);
      return;
    }

    router.push(orderPath);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-8 lg:p-12 relative bg-[var(--bg-root)] text-[var(--silver-100)] selection:bg-white selection:text-black">
      
      {/* ── Cyber Grid Background ── */}
      <div 
        className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--silver-500) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* ── Header ── */}
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center relative z-50 shrink-0 mb-10">
        <Link href="/" className="flex items-center gap-2.5 group relative z-50">
          <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center shadow-lg group-hover:border-[var(--border-silver)] transition-all">
            <ArrowLeft className="w-3 h-3 text-[var(--silver-500)] group-hover:text-[var(--silver-200)] transition-colors" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.25em] font-mono text-[var(--silver-200)] group-hover:text-white transition-colors">
            SUKAMCD
          </span>
        </Link>
        <div className="h-px bg-gradient-to-r from-[var(--border-subtle)] via-[var(--border-soft)] to-transparent flex-grow mx-8 hidden sm:block" />
        {isLoggedIn ? (
          <Link 
            href="/profile" 
            className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] hover:border-[var(--border-silver)] text-[11px] font-mono tracking-[0.15em] text-[var(--silver-300)] hover:text-[var(--silver-100)] transition-all duration-200 flex items-center gap-1.5 cursor-pointer z-10"
          >
            <User className="w-3 h-3 text-[var(--silver-500)]" />
            Profile
          </Link>
        ) : (
          <Link 
            href="/gateway" 
            className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] hover:border-[var(--border-silver)] text-[11px] font-mono tracking-[0.15em] text-[var(--silver-300)] hover:text-[var(--silver-100)] transition-all duration-200 flex items-center gap-1.5 cursor-pointer z-10"
          >
            Sign-in
          </Link>
        )}
      </header>

      {/* ── Main Section ── */}
      <main className="w-full max-w-6xl mx-auto flex-grow z-10 flex flex-col gap-12 pb-16">
        
        {/* Intro */}
        <div className="space-y-3 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-soft)] shadow-md select-none">
            <Sparkles className="w-3.5 h-3.5 text-[var(--silver-400)]" />
            <span className="text-[8.5px] font-black uppercase tracking-[0.2em] text-[var(--silver-400)] font-mono">Service Pricing</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-gradient bg-gradient-to-b from-[var(--silver-100)] via-[var(--silver-200)] to-[var(--silver-500)] bg-clip-text text-transparent pb-1">
            Pricing Plans.
          </h1>
          <p className="text-[12px] text-[var(--silver-500)] max-w-xl font-light leading-relaxed">
            Transparan, kompetitif, dan dirancang khusus untuk mewujudkan ide digital Anda dengan standar performa dan kualitas visual terbaik.
          </p>

        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan, index) => {
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex flex-col justify-between p-6 rounded-2xl border relative overflow-hidden select-none transition-all duration-300 ${
                  plan.popular
                    ? "bg-[var(--bg-elevated)] border-[var(--border-silver)] shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
                    : plan.comingSoon
                    ? "bg-[rgba(15,15,19,0.4)] border-[var(--border-soft)] border-dashed opacity-75 hover:opacity-90 hover:border-[var(--border-subtle)]"
                    : "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-silver)] hover:bg-[var(--bg-elevated)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
                }`}
              >
                {/* Popular Ribbon/Indicator */}
                {plan.popular && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--silver-200)] text-[#0f0f13] text-[7.5px] font-black uppercase tracking-wider font-mono">
                    Popular Choice
                  </div>
                )}
                {plan.comingSoon && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-soft)] text-[var(--silver-400)] text-[7.5px] font-mono font-black uppercase tracking-wider">
                    Coming Soon
                  </div>
                )}

                <div className="space-y-5">
                  {/* Card Header */}
                  <div>
                    <span className="text-[8px] font-mono font-black uppercase tracking-[0.15em] text-[var(--silver-500)]">
                      {plan.badge}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--silver-100)] tracking-tight mt-1.5 mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-xl lg:text-2xl font-black text-[var(--silver-100)] tracking-tight">
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--silver-500)] font-medium leading-relaxed mt-2.5">
                      {plan.description}
                    </p>
                  </div>

                  <hr className="border-[var(--border-subtle)]" />

                  {/* Features List */}
                  <ul className="space-y-2.5 text-[11px] text-[var(--silver-400)] leading-normal font-medium">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-[var(--silver-200)] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Select Button */}
                <div className="mt-8">
                  <button
                    type="button"
                    disabled={plan.comingSoon}
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-2.5 rounded-xl text-[10px] font-mono tracking-[0.15em] font-black uppercase flex items-center justify-center transition-all duration-200 ${
                      plan.comingSoon
                        ? "bg-[var(--bg-root)] text-[var(--silver-600)] border border-[var(--border-soft)] border-dashed cursor-not-allowed"
                        : plan.popular
                        ? "bg-[var(--silver-200)] text-[#0f0f13] hover:bg-[var(--silver-100)] shadow-lg hover:shadow-[0_0_16px_rgba(212,212,216,0.2)]"
                        : "bg-[var(--bg-root)] text-[var(--silver-300)] border border-[var(--border-soft)] hover:border-[var(--border-silver)] hover:text-white"
                    }`}
                  >
                    {plan.comingSoon ? "Coming Soon" : "Pilih Paket"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Student Discount Banner ── */}
        <div className="p-6.5 rounded-2xl bg-gradient-to-r from-[rgba(20,20,24,0.6)] to-[rgba(15,15,19,0.9)] border border-dashed border-[var(--border-silver)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 select-none mt-4 animate-in fade-in duration-1000">
          <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--silver-400) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-soft)] text-[8px] font-mono font-black uppercase tracking-widest text-[var(--silver-300)]">
              Special Offer
            </div>
            <h3 className="text-xl font-bold text-[var(--silver-100)] tracking-tight">
              Harga Khusus Pelajar & Mahasiswa
            </h3>
            <p className="text-[11.5px] leading-relaxed text-[var(--silver-500)] font-light">
              Butuh website untuk Tugas Akhir (TA), Skripsi, Portofolio Kelulusan, atau website Organisasi/Komunitas Sekolah? Kami berikan potongan harga khusus hingga <strong className="text-[var(--silver-300)]">30%</strong> dari harga normal. Cukup tunjukkan KTM / Kartu Pelajar aktif saat pemesanan.
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => handleSelectPlan('student')}
            className="px-6 py-3 rounded-xl bg-[var(--silver-200)] text-[#0f0f13] text-[10px] font-mono tracking-[0.15em] font-black uppercase hover:bg-[var(--silver-100)] shadow-lg hover:shadow-[0_0_16px_rgba(212,212,216,0.18)] transition-all shrink-0 cursor-pointer text-center w-full md:w-auto font-bold"
          >
            Ajukan Paket Pelajar
          </button>
        </div>

        {/* ── Policy & Warranty Section ── */}
        <section className="mt-8 pt-10 border-t border-[var(--border-subtle)] space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-[var(--silver-200)] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[var(--silver-400)]" /> Ketentuan Layanan & Garansi
            </h2>
            <p className="text-[11px] text-[var(--silver-500)] font-mono uppercase tracking-wider">
              — Transparansi penuh demi kenyamanan kolaborasi bersama
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {policies.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className="p-5.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-soft)] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[var(--silver-400)]" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--silver-200)] tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-[11.5px] leading-relaxed text-[var(--silver-500)] font-light">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="w-full max-w-6xl mx-auto border-t border-[var(--border-subtle)] pt-6 flex justify-between items-end z-10 shrink-0 select-none">
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
          href="/" 
          className="text-[9.5px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-[var(--silver-100)] transition-colors border-b border-[var(--border-subtle)] pb-0.5"
        >
          ← Back home
        </Link>
      </footer>
    </div>
  );
}
