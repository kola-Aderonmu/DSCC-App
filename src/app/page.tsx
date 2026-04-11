"use client";

import Link from "next/link";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-12 text-center shadow-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white">
          DS
        </div>

        <h1 className="mt-8 text-4xl font-extrabold text-slate-900">
          Welcome to DSCC
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Digital Smart Complementary Card
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-full bg-indigo-600 px-8 py-4 font-bold text-white transition hover:bg-indigo-700"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="rounded-full border-2 border-slate-200 px-8 py-4 font-bold text-slate-700 transition hover:border-indigo-600 hover:text-indigo-600"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}

