"use client";

import { motion, AnimatePresence } from "framer-motion";

interface McdAIOrbProps {
  status: "idle" | "thinking" | "speaking" | "listening";
}

export default function McdAIOrb({ status }: McdAIOrbProps) {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Outer Glow Ring */}
      <motion.div
        animate={{
          scale: status === "thinking" ? [1, 1.1, 1] : 1,
          opacity: status === "idle" ? 0.2 : 0.4,
          rotate: status === "thinking" ? 360 : 0,
        }}
        transition={{
          duration: status === "thinking" ? 2 : 4,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 rounded-full border border-emerald-500/30 blur-sm"
      />

      {/* Pulsing Energy Layers */}
      <AnimatePresence>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: status === "speaking" ? [1, 1.2, 1] : [1, 1.1, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 2 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/10 via-blue-500/5 to-transparent blur-md"
          />
        ))}
      </AnimatePresence>

      {/* The Core Orb */}
      <motion.div
        animate={{
          scale: status === "listening" ? [1, 1.05, 1] : 1,
          boxShadow: status === "thinking" 
            ? "0 0 40px rgba(16, 185, 129, 0.4)" 
            : "0 0 20px rgba(16, 185, 129, 0.2)",
        }}
        transition={{
          duration: 0.5,
          repeat: status === "listening" ? Infinity : 0,
        }}
        className="relative z-10 w-24 h-24 rounded-full bg-zinc-950 border border-emerald-500/50 flex items-center justify-center overflow-hidden"
      >
        {/* Internal Core Light */}
        <motion.div
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: status === "thinking" ? 1 : 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-12 h-12 rounded-full bg-emerald-500 blur-xl"
        />

        {/* Simplified Overlay */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/20 to-transparent"></div>
        
        {/* Core Detail */}
        <div className="absolute inset-0 border-[0.5px] border-white/10 rounded-full"></div>
      </motion.div>

      {/* Decorative Orbits */}
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute w-36 h-36 border border-zinc-800 rounded-full border-dashed opacity-30"
      />
      
      {/* Listening Indicator Dots */}
      {status === "listening" && (
        <div className="absolute -bottom-12 flex gap-1">
          {[0, 1, 2].map((d) => (
            <motion.div
              key={d}
              animate={{ height: [4, 12, 4] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: d * 0.1 }}
              className="w-1 bg-emerald-500 rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
