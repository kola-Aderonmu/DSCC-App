"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  async function handleLogout() {
    await auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#36c1bf] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="mx-auto max-w-7xl mb-8 flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">DSCC Dashboard</h1>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="text-sm font-medium text-red-600 hover:underline"
        >
          Logout
        </button>
      </header>
      <main className="mx-auto max-w-7xl rounded-2xl bg-white p-8 shadow-sm">
        {children}
      </main>
    </div>
  );
}


