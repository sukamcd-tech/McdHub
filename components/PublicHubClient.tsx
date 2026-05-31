"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Plus, Laptop } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  url: string;
}

export default function PublicHubClient({ initialProjects }: { initialProjects: Project[] }) {
  const currentYear = new Date().getFullYear();
  const router = useRouter();

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col justify-between p-8 lg:p-12 relative select-none bg-[var(--bg-root)] text-[var(--silver-100)]">
      
      {/* ── High-Tech Cyber Grid Background ── */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--silver-400) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* ── Header ── */}
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[var(--silver-300)]" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.25em] font-mono text-[var(--silver-200)]">
            SUKAMCD
          </span>
        </div>
        
        <div className="h-px bg-gradient-to-r from-[var(--border-subtle)] via-[var(--border-soft)] to-transparent flex-grow mx-8 hidden sm:block" />
        
        <div className="flex items-center gap-2.5 z-10">
          <Link 
            href="/projects" 
            className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] hover:border-[var(--border-silver)] text-[9px] font-mono tracking-[0.15em] text-[var(--silver-400)] hover:text-[var(--silver-100)] transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            Projects
          </Link>
          <Link 
            href="/contact" 
            className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-soft)] hover:border-[var(--border-silver)] text-[9px] font-mono tracking-[0.15em] text-[var(--silver-400)] hover:text-[var(--silver-100)] transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            Contact
          </Link>
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

                  const commonClasses = `card p-6.5 rounded-2xl flex flex-col justify-between h-[215px] relative overflow-hidden select-none border border-[var(--border-subtle)] ${
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
                    className="p-6.5 rounded-2xl border border-dashed border-[var(--border-soft)] bg-[rgba(10,10,14,0.15)] flex flex-col items-center justify-center gap-2.5 text-center text-[9.5px] font-black uppercase tracking-[0.25em] font-mono text-[var(--silver-700)] select-none h-[215px]"
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

      {/* ── Footer ── */}
      <footer className="w-full max-w-7xl mx-auto border-t border-[var(--border-subtle)] pt-6 flex justify-between items-end z-10 shrink-0 select-none">
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
        
        {/* ── Hidden Gateway Backdoor (100% stealthy, no cursor change, no hover style change, no tooltips) ── */}
        <div
          onClick={() => router.push("/gateway")}
          className="w-2.5 h-2.5 rounded-full cursor-default bg-zinc-900 border border-[var(--border-soft)]"
        />
      </footer>
    </div>
  );
}
