"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ArrowUpRight, Plus, Laptop, Check, Sparkles, Globe, RefreshCw, ShieldCheck, AlertCircle, ChevronDown, User, Menu, X } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  url: string;
}

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
  },
  {
    id: "web-erp",
    name: "Sistem ERP / Enterprise",
    price: "Rp 7,5jt - 10,0jt",
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
  },
];

const policies = [
  {
    icon: Globe,
    title: "Hosting & Domain .my.id",
    desc: "Semua paket sudah termasuk sewa hosting & domain .my.id selama 1 tahun secara gratis. Untuk custom domain (.com, .co.id, dll) ada biaya tambahan.",
  },
  {
    icon: RefreshCw,
    title: "Free 2x Revisi Tampilan",
    desc: "2x kesempatan revisi visual/tampilan gratis. Tidak berlaku untuk perubahan alur logika inti sistem atau pergantian tech stack.",
  },
  {
    icon: ShieldCheck,
    title: "Garansi Bug 3 Bulan",
    desc: "Jaminan bebas dari error fungsional dan bug selama 3 bulan setelah rilis. Kami perbaiki secara cepat tanpa biaya tambahan.",
  },
  {
    icon: AlertCircle,
    title: "Rilis Google Play Store",
    desc: "Khusus paket Aplikasi Android, publikasi ke Google Play Store dapat dibantu sepenuhnya dengan biaya tambahan.",
  },
];

export default function PublicHubClient({ initialProjects }: { initialProjects: Project[] }) {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        // First, try to get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setIsLoggedIn(!!session);
          setIsLoading(false);
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
      } catch (error) {
        console.error('Error loading session:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setIsLoggedIn(!!session);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-8 lg:p-12 relative select-none bg-[var(--bg-root)] text-[var(--silver-100)] scroll-smooth">
      
      {/* ── High-Tech Cyber Grid Background ── */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--silver-400) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* ── Header ── */}
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center relative z-50 shrink-0">
        <div className="flex items-center gap-2.5 relative z-50">
          <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center shadow-lg overflow-hidden shrink-0 select-none">
            <img src="/logo.svg" alt="MCD" className="w-4 h-4 object-contain" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.25em] font-mono text-[var(--silver-200)]">
            SUKAMCD
          </span>
        </div>
        
        <div className="h-px bg-gradient-to-r from-[var(--border-subtle)] via-[var(--border-soft)] to-transparent flex-grow mx-8 hidden sm:block" />
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2.5 z-10">
          <a 
            href="/pricing" 
            className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] hover:border-[var(--border-silver)] text-[11px] font-mono tracking-[0.15em] text-[var(--silver-300)] hover:text-[var(--silver-100)] transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            Pricing
          </a>
          <Link 
            href="/projects" 
            className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] hover:border-[var(--border-silver)] text-[11px] font-mono tracking-[0.15em] text-[var(--silver-300)] hover:text-[var(--silver-100)] transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            Projects
          </Link>
          <Link 
            href="/contact" 
            className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] hover:border-[var(--border-silver)] text-[11px] font-mono tracking-[0.15em] text-[var(--silver-300)] hover:text-[var(--silver-100)] transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            Contact
          </Link>
          {isLoggedIn ? (
            <Link 
              href="/profile" 
              className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] hover:border-[var(--border-silver)] text-[11px] font-mono tracking-[0.15em] text-[var(--silver-300)] hover:text-[var(--silver-100)] transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-3 h-3 text-[var(--silver-500)]" />
              Profile
            </Link>
          ) : (
            <Link 
              href="/gateway" 
              className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] hover:border-[var(--border-silver)] text-[11px] font-mono tracking-[0.15em] text-[var(--silver-300)] hover:text-[var(--silver-100)] transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              Sign-in
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--silver-400)] hover:text-[var(--silver-100)] cursor-pointer z-50 relative transition-all active:scale-95 duration-200"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-4 h-4 animate-in fade-in zoom-in-50 duration-200" /> : <Menu className="w-4 h-4 animate-in fade-in zoom-in-50 duration-200" />}
        </button>

        {/* Mobile Drawer Overlay */}
        <div 
          className={`fixed inset-0 z-40 md:hidden bg-black/95 backdrop-blur-xl flex flex-col justify-center items-center gap-6 transition-all duration-300 ease-in-out ${
            mobileMenuOpen 
              ? "opacity-100 translate-y-0 pointer-events-auto" 
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--silver-400)] mb-2 select-none">
            — navigation
          </span>
          <a 
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-mono tracking-[0.15em] text-[var(--silver-300)] hover:text-white transition-colors"
          >
            Pricing
          </a>
          <Link 
            href="/projects"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-mono tracking-[0.15em] text-[var(--silver-300)] hover:text-white transition-colors"
          >
            Projects
          </Link>
          <Link 
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-mono tracking-[0.15em] text-[var(--silver-300)] hover:text-white transition-colors"
          >
            Contact
          </Link>
          {isLoggedIn ? (
            <>
              <Link 
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-mono tracking-[0.15em] text-[var(--silver-300)] hover:text-white transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4 text-[var(--silver-500)]" />
                Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-mono tracking-widest uppercase border border-red-900/30 bg-red-950/10 text-red-400 hover:text-red-300 cursor-pointer transition-all"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link 
              href="/gateway"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-mono tracking-[0.15em] text-[var(--silver-300)] hover:text-white transition-colors flex items-center gap-2"
            >
              Sign-in
            </Link>
          )}
        </div>
      </header>

      {/* ── Main Hero & Cards Container ── */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col justify-center items-center z-10 py-6">
        <div className="text-center mb-12 space-y-3 animate-in fade-in slide-in-from-top-4 duration-1000 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-soft)] shadow-md select-none">
            <Laptop className="w-3.5 h-3.5 text-[var(--silver-400)]" />
            <span className="text-[8.5px] font-black uppercase tracking-[0.2em] text-[var(--silver-400)] font-mono">Central Index Portal</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight pb-2 text-gradient bg-gradient-to-b from-[var(--silver-100)] via-[var(--silver-200)] to-[var(--silver-500)] bg-clip-text text-transparent">
            Central Project Hub
          </h1>
          
          <p className="text-[11.5px] uppercase tracking-wider text-[var(--silver-500)] font-mono max-w-lg mx-auto leading-relaxed mt-2 opacity-80">
            A curated collection of digital experiences and functional experiments by SukaMCD.
          </p>
        </div>

        {/* ── Projects Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-stretch">
          {(() => {
            const projectsToRender = [...initialProjects];
            const placeholdersNeeded = Math.max(0, 3 - projectsToRender.length);
            
            return (
              <>
                {projectsToRender.map((project) => {
                  const IsExternal = project.url?.startsWith("http");
                  const IsActive = project.status === 'ONLINE';

                  const CardContent = (
                    <div className="flex flex-col h-full justify-between gap-5 relative select-none">
                      {/* Accent lines on card */}
                      <div className="absolute -top-5 -left-5 -right-5 h-px bg-gradient-to-r from-transparent via-[var(--border-soft)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[8.5px] font-black font-mono uppercase tracking-[0.2em] text-[var(--silver-500)]">
                            {project.category}
                          </span>
                          {IsActive && (
                            <ArrowUpRight className="w-4 h-4 text-[var(--silver-500)] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          )}
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-[var(--silver-100)] tracking-tight mb-1.5 group-hover:translate-x-1 transition-transform">
                            {project.title}
                          </h3>
                          <p className="text-[11.5px] font-medium leading-relaxed text-[var(--silver-500)] line-clamp-2">
                            {project.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[8px] font-black uppercase tracking-[0.15em] border-t border-[var(--border-subtle)] pt-3.5 select-none">
                        <span className={IsActive ? "text-[var(--silver-300)]" : "text-[var(--silver-600)]"}>
                          {project.status}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          project.status === 'ONLINE' ? 'bg-emerald-500 animate-emerald-pulse' : 
                          project.status === 'MAINTENANCE' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' :
                          'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                        }`}></span>
                      </div>
                    </div>
                  );

                  const commonClasses = `card p-6.5 rounded-2xl flex flex-col justify-between min-h-[215px] h-full relative overflow-hidden select-none border border-[var(--border-subtle)] ${
                    IsActive 
                      ? "group cursor-pointer hover:border-[var(--border-silver)] hover:bg-[var(--bg-elevated)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)]" 
                      : "cursor-not-allowed opacity-50 bg-[var(--bg-surface)]"
                  }`;

                  if (!IsActive) {
                    return (
                      <div key={project.id} className={commonClasses}>
                        {CardContent}
                      </div>
                    );
                  }

                  if (IsExternal) {
                    return (
                      <a
                        key={project.id}
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={commonClasses}
                      >
                        {CardContent}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={project.id}
                      href={project.url || "#"}
                      className={commonClasses}
                    >
                      {CardContent}
                    </Link>
                  );
                })}
                
                {Array.from({ length: placeholdersNeeded }).map((_, i) => (
                  <div 
                    key={`placeholder-${i}`} 
                    className="p-6.5 rounded-2xl border border-dashed border-[var(--border-soft)] bg-[rgba(10,10,14,0.15)] flex flex-col items-center justify-center gap-2.5 text-center text-[9.5px] font-black uppercase tracking-[0.25em] font-mono text-[var(--silver-700)] select-none min-h-[215px] h-full"
                  >
                    <Plus className="w-4 h-4 text-[var(--silver-700)] opacity-60" />
                    <span>Project Incoming</span>
                  </div>
                ))}
              </>
            );
          })()}
        </div>
      </main>

      {/* ── Scroll Down Indicator ── */}
      <div 
        onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
        className="w-full flex flex-col justify-center items-center py-10 text-[var(--silver-500)] hover:text-white transition-colors cursor-pointer shrink-0 z-10"
      >
        <span className="text-[8.5px] font-black uppercase tracking-[0.2em] font-mono mb-2">View Pricing</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </div>

      {/* ── Pricing Section ── */}
      <section id="pricing" className="w-full max-w-7xl mx-auto z-10 py-16 border-t border-[var(--border-subtle)] space-y-12 scroll-mt-6">
        <div className="text-center space-y-3 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-soft)] shadow-md select-none">
            <Sparkles className="w-3.5 h-3.5 text-[var(--silver-400)]" />
            <span className="text-[8.5px] font-black uppercase tracking-[0.2em] text-[var(--silver-400)] font-mono">Service Pricing</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight pb-2 text-gradient bg-gradient-to-b from-[var(--silver-100)] via-[var(--silver-200)] to-[var(--silver-500)] bg-clip-text text-transparent">
            Pricing Plans
          </h2>
          
          <p className="text-[11.5px] uppercase tracking-wider text-[var(--silver-500)] font-mono max-w-lg mx-auto leading-relaxed mt-2 opacity-80">
            Transparan, kompetitif, dan dirancang khusus untuk mewujudkan ide digital Anda.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => {
            return (
              <div
                key={plan.id}
                className={`flex flex-col justify-between p-6 rounded-2xl border relative overflow-hidden select-none transition-all duration-300 ${
                  plan.popular
                    ? "bg-[var(--bg-elevated)] border-[var(--border-silver)] shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
                    : "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-silver)] hover:bg-[var(--bg-elevated)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--silver-200)] text-[#0f0f13] text-[7.5px] font-black uppercase tracking-wider font-mono">
                    Recommendation
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <span className="text-[8px] font-mono font-black uppercase tracking-[0.15em] text-[var(--silver-500)]">
                      {plan.badge}
                    </span>
                    <h3 className="text-base font-bold text-[var(--silver-100)] tracking-tight mt-1.5 mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-lg font-black text-[var(--silver-100)] tracking-tight">
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--silver-500)] font-medium leading-relaxed mt-2.5">
                      {plan.description}
                    </p>
                  </div>

                  <hr className="border-[var(--border-subtle)]" />

                  <ul className="space-y-2.5 text-[11px] text-[var(--silver-400)] leading-normal font-medium">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-[var(--silver-200)] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href={`/pricing/order?package=${plan.id}`}
                    className={`w-full py-2.5 rounded-xl text-[10px] font-mono tracking-[0.15em] font-black uppercase flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      plan.popular
                        ? "bg-[var(--silver-200)] text-[#0f0f13] hover:bg-[var(--silver-100)] shadow-lg hover:shadow-[0_0_16px_rgba(212,212,216,0.2)]"
                        : "bg-[var(--bg-root)] text-[var(--silver-300)] border border-[var(--border-soft)] hover:border-[var(--border-silver)] hover:text-white"
                    }`}
                  >
                    Pilih Paket
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Student Discount Banner ── */}
        <div className="p-6.5 rounded-2xl bg-gradient-to-r from-[rgba(20,20,24,0.6)] to-[rgba(15,15,19,0.9)] border border-dashed border-[var(--border-silver)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 select-none mt-4">
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
          
          <Link
            href="/pricing/order?package=student"
            className="px-6 py-3 rounded-xl bg-[var(--silver-200)] text-[#0f0f13] text-[10px] font-mono tracking-[0.15em] font-black uppercase hover:bg-[var(--silver-100)] shadow-lg hover:shadow-[0_0_16px_rgba(212,212,216,0.18)] transition-all shrink-0 cursor-pointer text-center w-full md:w-auto font-bold"
          >
            Ajukan Paket Pelajar
          </Link>
        </div>

        {/* See All Pricing Button */}
        <div className="w-full flex justify-center pt-4 select-none">
          <Link
            href="/pricing"
            className="px-6 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-soft)] hover:border-[var(--border-silver)] text-[10px] font-mono tracking-[0.15em] font-black uppercase text-[var(--silver-400)] hover:text-white transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md"
          >
            See All Pricing Details <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Service terms and warranty */}
        <div className="pt-8 border-t border-[var(--border-subtle)] space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight text-[var(--silver-200)]">
              Ketentuan Layanan & Garansi
            </h3>
            <p className="text-[10px] text-[var(--silver-500)] font-mono uppercase tracking-wider">
              — Transparansi penuh demi kenyamanan kolaborasi bersama
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {policies.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-soft)] flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[var(--silver-400)]" />
                  </div>
                  <h4 className="text-xs font-bold text-[var(--silver-200)] tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] leading-relaxed text-[var(--silver-500)] font-light">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full max-w-7xl mx-auto border-t border-[var(--border-subtle)] pt-6 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 z-10 shrink-0 select-none text-center sm:text-left">
        <div className="space-y-2.5">
          <div className="text-[9px] font-black uppercase tracking-wider text-[var(--silver-600)] font-mono">
            &copy; {currentYear} SukaMCD. All rights reserved.
          </div>
          <div className="flex justify-center sm:justify-start gap-5">
            <a href="https://github.com/SukaMCD" className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Github</a>
            <a href="https://www.instagram.com/sukamcd.dev/" className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.linkedin.com/in/fabianrizkypratama/" className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-500)] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
