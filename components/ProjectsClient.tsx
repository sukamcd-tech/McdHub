"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Search, Plus, Laptop, X } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  url: string;
}

export default function ProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const currentYear = new Date().getFullYear();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Dynamically extract unique categories and uppercase them
  const categories = [
    "ALL",
    ...Array.from(new Set(initialProjects.map((p) => p.category?.toUpperCase() || "OTHER"))),
  ];

  // Filter projects based on search query and active category filter
  const filteredProjects = initialProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" ||
      project.category?.toUpperCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isScrollable = filteredProjects.length >= 4;

  return (
    <div className={isScrollable
      ? "min-h-screen flex flex-col justify-between p-8 lg:p-12 relative overflow-x-hidden bg-[var(--bg-root)] text-[var(--silver-100)] selection:bg-white selection:text-black"
      : "h-screen max-h-screen overflow-hidden flex flex-col justify-between p-8 lg:p-12 relative bg-[var(--bg-root)] text-[var(--silver-100)] selection:bg-white selection:text-black"
    }>
      
      {/* ── High-Tech Cyber Grid Background ── */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--silver-500) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* ── Header ── */}
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center z-10 shrink-0 mb-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center shadow-lg group-hover:border-[var(--border-silver)] transition-all">
            <ArrowLeft className="w-3 h-3 text-[var(--silver-500)] group-hover:text-[var(--silver-200)] transition-colors" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.25em] font-mono text-[var(--silver-200)] group-hover:text-white transition-colors">
            SUKAMCD
          </span>
        </Link>
        
        <div className="h-px bg-gradient-to-r from-[var(--border-subtle)] via-[var(--border-soft)] to-transparent flex-grow mx-8 hidden sm:block" />
      </header>

      {/* ── Main Section ── */}
      <main className={isScrollable
        ? "w-full max-w-6xl mx-auto flex-1 z-10 flex flex-col gap-8 pb-16"
        : "w-full max-w-6xl mx-auto flex-1 z-10 flex flex-col justify-center gap-8 py-4"
      }>
        
        {/* Title and Intro */}
        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-soft)] shadow-md select-none">
            <Laptop className="w-3.5 h-3.5 text-[var(--silver-400)]" />
            <span className="text-[8.5px] font-black uppercase tracking-[0.2em] text-[var(--silver-400)] font-mono">Archive Showcase</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-gradient bg-gradient-to-b from-[var(--silver-100)] via-[var(--silver-200)] to-[var(--silver-500)] bg-clip-text text-transparent pb-1">
            Selected Works.
          </h1>
          <p className="text-[12px] text-[var(--silver-500)] max-w-xl font-light leading-relaxed">
            A comprehensive catalog of digital interfaces, production web platforms, and experimental tools developed by SukaMCD.
          </p>
        </div>

        {/* Filters and Search Bar Container */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5 pt-2 animate-in fade-in duration-1000">
          
          {/* Dynamic Categories Scrollbar Wrapper */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all cursor-pointer font-mono border whitespace-nowrap"
                style={
                  selectedCategory === cat
                    ? { background: "var(--silver-200)", color: "#0f0f13", borderColor: "var(--silver-300)" }
                    : { background: "var(--bg-surface)", color: "var(--silver-500)", borderColor: "var(--border-subtle)" }
                }
                onMouseEnter={(e) => { if (selectedCategory !== cat) { (e.currentTarget as HTMLElement).style.color = "var(--silver-200)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-soft)"; } }}
                onMouseLeave={(e) => { if (selectedCategory !== cat) { (e.currentTarget as HTMLElement).style.color = "var(--silver-500)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; } }}
              >
                {cat === "ALL" ? "All projects" : cat}
              </button>
            ))}
          </div>

          {/* Minimalist Search Input */}
          <div className="relative w-full md:w-64 max-w-md shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--silver-600)]" />
            <input
              type="text"
              placeholder="Search project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl py-2.5 pl-10 pr-9 text-xs placeholder-[var(--silver-700)] focus:bg-[var(--bg-elevated)]"
              style={{ background: "rgba(10,10,14,0.8)", border: "1px solid var(--border-soft)", color: "var(--silver-200)", outline: "none", transition: "all 0.25s ease" }}
              onFocus={(e) => { e.target.style.borderColor = "var(--border-silver)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border-soft)"; }}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-[var(--silver-500)] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* ── Project Cards Showcase Grid ── */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[var(--border-soft)] rounded-2xl bg-[rgba(10,10,14,0.15)] flex flex-col items-center justify-center gap-3 select-none animate-in fade-in duration-500">
            <X className="w-5 h-5 text-[var(--silver-600)]" />
            <p className="text-xs font-mono uppercase tracking-[0.15em] text-[var(--silver-500)]">No projects found matching the query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch animate-in fade-in duration-700">
            {filteredProjects.map((project) => {
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
                      <p className="text-[11.5px] font-medium leading-relaxed text-[var(--silver-500)] line-clamp-3">
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

              const commonClasses = `card p-6.5 rounded-2xl flex flex-col justify-between h-[230px] relative overflow-hidden select-none border border-[var(--border-subtle)] ${
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
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="w-full max-w-6xl mx-auto border-t border-[var(--border-subtle)] pt-6 flex justify-between items-end z-10 shrink-0 select-none">
        <div className="space-y-2.5">
          <div className="text-[9px] font-black uppercase tracking-wider text-[var(--silver-600)] font-mono">
            &copy; {currentYear} SukaMCD. All rights reserved.
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
