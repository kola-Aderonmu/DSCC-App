"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function JarLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative h-20 w-16 overflow-hidden rounded-b-2xl rounded-t-lg border-4 border-slate-800 bg-white shadow-inner">
        {/* Liquid inside the jar */}
        <motion.div
          animate={{
            height: ["20%", "80%", "20%"],
            y: [0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 left-0 w-full bg-[#36c1bf] opacity-80"
          style={{ height: "50%" }}
        >
          {/* Bubbles */}
          <motion.div
            animate={{
              y: [-10, -60],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5,
            }}
            className="absolute left-1/4 h-2 w-2 rounded-full bg-white/40"
          />
          <motion.div
            animate={{
              y: [-10, -50],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 1,
            }}
            className="absolute left-2/3 h-1.5 w-1.5 rounded-full bg-white/40"
          />
        </motion.div>
        
        {/* Jar Reflection */}
        <div className="absolute left-2 top-2 h-12 w-1 rounded-full bg-white/20" />
      </div>
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-sm font-bold tracking-widest text-slate-500 uppercase"
      >
        Processing...
      </motion.p>
    </div>
  );
}
