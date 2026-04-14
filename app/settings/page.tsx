"use client";

import { useDashboardTheme } from "@/context/theme-context";
import { motion } from "framer-motion";
import { Palette, ArrowLeft, Check, Sun, Moon, Droplets, Box } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";

function SettingsContent() {
  const { theme, setTheme } = useDashboardTheme();

  const themes = [
    { id: "light", name: "Classic Light", icon: Sun, color: "bg-white" },
    { id: "dark", name: "Midnight Dark", icon: Moon, color: "bg-slate-900" },
    { id: "glass", name: "Glassmorphism", icon: Droplets, color: "bg-gradient-to-br from-indigo-500 to-purple-600" },
    { id: "neo", name: "Neumorphic", icon: Box, color: "bg-[#e0e5ec]" },
  ];

  return (
    <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="rounded-full p-2 hover:bg-black/5 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h2 className="text-2xl font-black tracking-tight">App Settings</h2>
        </div>

        <section className="space-y-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Palette className="h-5 w-5 text-[#36c1bf]" />
              Dashboard Theme
            </h3>
            <p className="text-sm opacity-60 mt-1">Choose the look and feel of your dashboard interface.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {themes.map((t) => (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTheme(t.id as any)}
                className={`relative flex items-center gap-4 rounded-3xl border-2 p-6 transition-all ${
                  theme === t.id 
                    ? "border-[#36c1bf] bg-[#36c1bf]/5" 
                    : "border-transparent bg-black/5 hover:bg-black/10"
                }`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${t.color}`}>
                  <t.icon className={`h-6 w-6 ${t.id === "light" || t.id === "neo" ? "text-slate-600" : "text-white"}`} />
                </div>
                <div className="text-left">
                  <p className="font-bold">{t.name}</p>
                  <p className="text-xs opacity-50">Click to apply</p>
                </div>
                {theme === t.id && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-[#36c1bf] p-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-black/5 p-8 border border-black/5">
          <h3 className="font-bold mb-4">About DSCC</h3>
          <p className="text-sm opacity-70 leading-relaxed">
            DSCC (Digital Smart Contact Card) is designed to revolutionize how you share your professional identity. 
            Our mission is to provide a seamless, modern, and eco-friendly way to connect with others.
          </p>
          <div className="mt-6 flex items-center gap-4 text-xs font-bold opacity-40 uppercase tracking-widest">
            <span>Version 2.0.0</span>
            <span>•</span>
            <span>Made with ❤️ for Professionals</span>
          </div>
        </section>
      </div>
  );
}

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <SettingsContent />
    </DashboardLayout>
  );
}
