"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, RefreshCw, ShieldAlert, Lock, AlertTriangle, ScreenShare } from "lucide-react";

interface McdAIBrowserProps {
  url: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function McdAIBrowser({ url, isOpen, onClose }: McdAIBrowserProps) {
  const [size, setSize] = useState({ width: 900, height: 700 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Expanded list of domains that block iframe display
  const BLOCKED_DOMAINS = [
    "vercel.com", "google.com", "gemini.google.com", "gemini.ai", 
    "openai.com", "chatgpt.com", "anthropic.com", "claude.ai",
    "github.com", "facebook.com", "twitter.com", "x.com", 
    "linkedin.com", "instagram.com", "supabase.com", "microsoft.com",
    "apple.com"
  ];

  // Robust URL Transformation
  const displayUrl = useMemo(() => {
    if (!url) return null;
    let target = url;

    // 1. YouTube Robust Transformation
    const ytMatch = target.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&modestbranding=1&rel=0`;
    }

    // 2. Add https if missing
    if (!target.startsWith("http") && !target.includes("://")) {
      target = `https://${target}`;
    }

    return target;
  }, [url]);

  const isKnownBlocked = useMemo(() => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return BLOCKED_DOMAINS.some(domain => lowerUrl.includes(domain));
  }, [url]);

  const handleResize = (e: any, info: any) => {
    setSize(prev => ({
      width: Math.max(400, prev.width + info.delta.x),
      height: Math.max(300, prev.height + info.delta.y)
    }));
  };

  const handleRefresh = () => setIframeKey(prev => prev + 1);
  const handleOpenExternal = () => {
    if (url) window.open(url, "_blank");
  };

  if (!url) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 100, rotateX: 15 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            rotateX: 0,
            width: isMaximized ? "96%" : size.width,
            height: isMaximized ? "94%" : size.height,
          }}
          exit={{ opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2 } }}
          drag={!isMaximized}
          dragMomentum={false}
          className="fixed bottom-6 right-6 z-[100] glass-panel bg-zinc-950/98 border border-white/5 rounded-[3rem] shadow-[0_0_200px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
          style={{ 
            backdropFilter: "blur(50px)",
            perspective: "1200px"
          }}
        >
          {/* Header - Advanced Control Bar */}
          <div className="h-20 bg-zinc-900/60 border-b border-white/5 flex items-center justify-between px-12 shrink-0 cursor-move">
            <div className="flex items-center gap-8">
              <div className="flex gap-3">
                <div onClick={onClose} className="w-4 h-4 rounded-full bg-red-500/10 hover:bg-red-500 cursor-pointer transition-all border border-red-500/20" />
                <div onClick={() => setIsMaximized(!isMaximized)} className="w-4 h-4 rounded-full bg-yellow-500/10 hover:bg-yellow-500 cursor-pointer transition-all border border-yellow-500/20" />
                <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20" />
              </div>
              <div className="h-8 w-px bg-zinc-800/40" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-2.5 h-2.5 text-emerald-500" />
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600">Secure Environment</span>
                </div>
                <div className="bg-zinc-900/50 px-4 py-1.5 rounded-full border border-zinc-800 flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-medium text-zinc-400 truncate max-w-lg">{url}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleRefresh}
                className="p-3.5 hover:bg-white/5 rounded-2xl transition-all text-zinc-500 hover:text-white border border-transparent hover:border-zinc-800"
                title="Refresh Environment"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              {/* Permanent External Trigger */}
              <button 
                onClick={handleOpenExternal}
                className="group flex items-center gap-3 px-6 py-3.5 bg-white text-black rounded-2xl transition-all hover:bg-zinc-200 shadow-2xl"
              >
                <ScreenShare className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">External Link</span>
              </button>

              <div className="w-px h-8 bg-zinc-800 mx-2" />
              
              <button 
                onClick={onClose}
                className="p-3.5 hover:bg-red-500/10 rounded-2xl transition-all text-zinc-600 hover:text-red-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Core Content Layer */}
          <div className="flex-1 bg-white relative">
            {isKnownBlocked && (
              <div className="absolute inset-0 z-20 bg-zinc-950 flex flex-col items-center justify-center p-16 text-center">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="w-32 h-32 bg-red-500/5 rounded-full flex items-center justify-center mb-10 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]"
                >
                  <ShieldAlert className="w-16 h-16 text-red-500 animate-pulse" />
                </motion.div>
                <h2 className="text-3xl font-black text-white tracking-[0.2em] uppercase mb-6 leading-tight">Security Access Blocked</h2>
                <p className="text-zinc-500 text-[11px] font-bold max-w-lg leading-loose mb-12 tracking-widest uppercase opacity-80">
                  Domain ini ({url}) mengaktifkan perlindungan Cross-Origin (X-Frame). JARVIS secara otomatis menghentikan injeksi internal demi keamanan browser Anda.
                </p>
                <button 
                  onClick={handleOpenExternal}
                  className="px-12 py-6 bg-red-500 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] hover:bg-red-600 transition-all shadow-[0_15px_40px_rgba(239,68,68,0.3)] flex items-center gap-4"
                >
                  <ExternalLink className="w-5 h-5" />
                  Request External Access
                </button>
              </div>
            )}
            
            <iframe
              key={iframeKey}
              src={displayUrl || ""}
              className="w-full h-full border-none shadow-inner"
              title="McdAI Intelligence Observer"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Interactive UI Layers */}
          {!isMaximized && (
            <motion.div 
               drag 
               dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
               onDrag={handleResize}
               className="absolute bottom-0 right-0 w-16 h-16 cursor-nwse-resize flex items-center justify-center z-30 group"
            >
               <div className="w-5 h-5 border-r-4 border-b-4 border-zinc-800 rounded-br-2xl group-hover:border-white group-hover:scale-125 transition-all" />
            </motion.div>
          )}

          {/* Dynamic Status Bar */}
          <div className="h-12 bg-zinc-950 border-t border-white/5 px-12 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-6">
               <div className="flex gap-1.5 items-end h-4">
                 <div className="w-1 bg-emerald-500/20 h-2" />
                 <div className="w-1 bg-emerald-500/40 h-3" />
                 <div className="w-1 bg-emerald-500/60 h-4" />
                 <div className="w-1 bg-emerald-500 h-2" />
               </div>
               <span className="text-[10px] font-black tracking-[0.4em] text-zinc-700 uppercase">JARVIS Intelligence Surveillance • V3.0 Stable</span>
             </div>
             <div className="flex items-center gap-4 text-zinc-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Cryptography: Active</span>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
