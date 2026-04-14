"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  LogOut, 
  Palette, 
  Key, 
  Settings, 
  X,
  ChevronRight,
  UserCircle
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserMenuProps {
  userEmail: string | null | undefined;
  theme: string;
}

export default function UserMenu({ userEmail, theme }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  const menuItems = [
    {
      label: "Profile Details",
      icon: User,
      href: "/account",
      description: "View your account info",
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      label: "Update Details",
      icon: Settings,
      href: "/account",
      description: "Edit your account info",
      color: "text-purple-500",
      bg: "bg-purple-50"
    },
    {
      label: "Theme Settings",
      icon: Palette,
      href: "/settings",
      description: "Customize your dashboard",
      color: "text-[#36c1bf]",
      bg: "bg-[#36c1bf]/10"
    },
    {
      label: "Change Password",
      icon: Key,
      href: "#",
      description: "Update your security",
      color: "text-amber-500",
      bg: "bg-amber-50"
    }
  ];

  const [photoURL, setPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    if (auth.currentUser) {
      const fetchUser = async () => {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser!.uid));
        if (userDoc.exists()) {
          setPhotoURL(userDoc.data().photoURL || null);
        }
      };
      fetchUser();
    }
  }, [isOpen]);

  const cardClasses = {
    light: "bg-white text-slate-900 border-slate-100",
    dark: "bg-slate-900 text-slate-50 border-slate-800",
    glass: "bg-white/10 backdrop-blur-3xl text-white border-white/20",
    neo: "bg-[#e0e5ec] text-slate-700 border-transparent shadow-[10px_10px_30px_#bebebe,-10px_-10px_30px_#ffffff]",
  }[theme as keyof typeof cardClasses] || "bg-white text-slate-900";

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#36c1bf]/10 text-[#36c1bf] transition-all hover:bg-[#36c1bf]/20 hover:ring-4 hover:ring-[#36c1bf]/10 overflow-hidden"
      >
        {photoURL ? (
          <img src={photoURL} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <UserCircle className="h-6 w-6" />
        )}
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl"
            />

            {/* Menu Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20, x: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20, x: 20 }}
              className={`fixed right-4 top-4 z-[101] w-[calc(100%-2rem)] max-w-[360px] overflow-hidden rounded-[2.5rem] shadow-2xl md:right-8 md:top-8 ${cardClasses}`}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#36c1bf] to-[#4f46e5] text-white shadow-lg shadow-[#36c1bf]/20 overflow-hidden">
                        {photoURL ? (
                          <img src={photoURL} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-7 w-7" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-black tracking-tight text-lg">My Account</h3>
                      <p className="text-xs font-bold opacity-50 truncate">{userEmail}</p>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ rotate: 90 }}
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-2 hover:bg-black/5 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>

                <div className="space-y-1">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between group rounded-2xl p-4 transition-all hover:bg-black/5 active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all group-hover:scale-110 ${item.bg} ${item.color}`}>
                            <item.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold tracking-tight">{item.label}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-40">{item.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-black/5">
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="flex w-full items-center justify-between group rounded-2xl p-4 text-rose-500 transition-all hover:bg-rose-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 transition-all group-hover:rotate-12">
                        <LogOut className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-black uppercase tracking-widest">Sign Out</span>
                    </div>
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                  </motion.button>
                </div>
              </div>

              {/* Decorative background element */}
              <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-[#36c1bf]/5 blur-3xl" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
