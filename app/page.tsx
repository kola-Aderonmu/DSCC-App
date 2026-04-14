"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      } else {
        setIsReady(true);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="h-8 w-8 rounded-full border-4 border-[#36c1bf] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[3rem] bg-white p-12 text-center shadow-2xl shadow-slate-200/50 border border-slate-100"
        >
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-[#36c1bf] to-[#4f46e5] text-3xl font-black text-white shadow-xl shadow-[#36c1bf]/30"
          >
            DS
          </motion.div>

          <h1 className="mt-10 text-5xl font-black tracking-tighter text-slate-900">
            Welcome to <span className="text-[#36c1bf]">DSCC</span>
          </h1>
          <p className="mt-4 text-lg font-medium text-slate-500">
            Digital Smart Complimentary Card
          </p>
          <p className="mt-2 text-sm text-slate-400 max-w-xs mx-auto">
            The modern way to share your professional identity instantly.
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="group flex items-center justify-center gap-2 rounded-full bg-[#36c1bf] px-10 py-5 font-black text-white shadow-xl shadow-[#36c1bf]/20 transition hover:bg-[#29aeb2] hover:scale-105 active:scale-95"
            >
              Get Started
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center rounded-full border-2 border-slate-100 px-10 py-5 font-black text-slate-600 transition hover:bg-slate-50 hover:border-slate-200 active:scale-95"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2 text-xs font-bold text-amber-600 border border-amber-100 transition hover:bg-amber-100 hover:scale-105 active:scale-95"
              title="Admin Login"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Access
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Trusted by Professionals
          </div>
        </motion.div>
      </div>
    </main>
  );
}

