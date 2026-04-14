"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";
import JarLoader from "@/components/jar-loader";
import { ThemeProvider, useDashboardTheme } from "@/context/theme-context";
import Link from "next/link";
import { Palette, ShieldAlert } from "lucide-react";
import UserMenu from "@/components/dashboard/user-menu";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { theme } = useDashboardTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user role
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          let userRole = "user";
          
          if (userDoc.exists()) {
            userRole = userDoc.data().role;
          }
          
          // Hardcoded admin override
          if (currentUser.email === "admin@gmail.com") {
            userRole = "admin";
          }
          
          setRole(userRole);
        } catch (error) {
          console.error("Error fetching user role:", error);
          if (currentUser.email === "admin@gmail.com") {
            setRole("admin");
          }
        }
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <JarLoader />
      </div>
    );
  }

  const themeClasses = {
    light: "bg-slate-50 text-slate-900",
    dark: "bg-slate-950 text-slate-50",
    glass: "bg-gradient-to-br from-indigo-500 to-purple-600 text-white",
    neo: "bg-[#e0e5ec] text-slate-700",
  }[theme];

  const cardClasses = {
    light: "bg-white shadow-sm border-slate-100",
    dark: "bg-slate-900 shadow-xl border-slate-800",
    glass: "bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl",
    neo: "bg-[#e0e5ec] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] border-transparent",
  }[theme];

  return (
    <div className={`min-h-screen transition-all duration-500 ${themeClasses} p-4 md:p-8`}>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`mx-auto max-w-7xl mb-8 flex items-center justify-between rounded-3xl p-6 border ${cardClasses}`}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#36c1bf] flex items-center justify-center shadow-lg shadow-[#36c1bf]/20">
            <span className="text-white font-black text-xs">D</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black tracking-tight">DSCC</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Smart Cards</p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          {role === "admin" && (
            <Link 
              href="/admin" 
              className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-bold text-amber-600 border border-amber-100 transition hover:bg-amber-100"
            >
              <ShieldAlert className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
          <UserMenu userEmail={user?.email} theme={theme} />
        </div>
      </motion.header>
      <motion.main 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`mx-auto max-w-7xl rounded-[2.5rem] p-6 md:p-10 border ${cardClasses}`}
      >
        {children}
      </motion.main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <DashboardContent>{children}</DashboardContent>
    </ThemeProvider>
  );
}


