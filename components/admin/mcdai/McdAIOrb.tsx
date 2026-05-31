"use client";

import { motion, AnimatePresence } from "framer-motion";

interface McdAIOrbProps {
  status: "idle" | "thinking" | "speaking" | "listening";
}

export default function McdAIOrb({ status }: McdAIOrbProps) {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center select-none">
      {/* Outer Dashed Compass Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute w-44 h-44 border border-zinc-800 border-dashed rounded-full opacity-60"
      />

      {/* Inner Concentric Structural Ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-36 h-36 border border-white/5 rounded-full"
      />

      {/* Decorative Outer Ticks */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="absolute w-full h-[1px] bg-zinc-700 max-w-[200px]" />
        <div className="absolute h-full w-[1px] bg-zinc-700 max-h-[200px]" />
      </div>

      {/* Central Solid Cockpit Instrument Pod */}
      <div className="relative z-10 w-24 h-24 rounded-full bg-[#1a1a1e] border border-white/[0.08] flex items-center justify-center shadow-2xl">
        {/* Breathing Inner Ring for Speaking */}
        <AnimatePresence>
          {status === "speaking" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border border-emerald-500/40"
            />
          )}
        </AnimatePresence>

        {/* Status Dot */}
        <motion.div
          animate={{
            scale: status === "thinking" ? [1, 1.25, 1] : 1,
          }}
          transition={{
            duration: 1.2,
            repeat: status === "thinking" ? Infinity : 0,
            ease: "easeInOut",
          }}
          className={`w-4 h-4 rounded-full transition-colors duration-500 ${
            status === "idle" ? "bg-zinc-600" :
            status === "thinking" ? "bg-amber-500" :
            status === "speaking" ? "bg-emerald-500" :
            "bg-emerald-500" // listening
          }`}
        />

        {/* Tactile Core Details */}
        <div className="absolute inset-2 border border-white/[0.02] rounded-full pointer-events-none" />
      </div>

      {/* Listening Indicator - Flat Visualizer Bars */}
      {status === "listening" && (
        <div className="absolute -bottom-6 flex items-center gap-1.5 h-6">
          {[0, 1, 2, 3, 4].map((d) => (
            <motion.div
              key={d}
              animate={{ height: [4, 18, 4] }}
              transition={{ 
                duration: 0.6, 
                repeat: Infinity, 
                delay: d * 0.1,
                ease: "easeInOut"
              }}
              className="w-1 bg-emerald-500 rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
