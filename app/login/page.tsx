"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/auth-shell";
import JarLoader from "@/components/jar-loader";
import { motion } from "framer-motion";
import { logActivity } from "@/lib/activity";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Log admin login
      if (email === "admin@gmail.com") {
        await logActivity("admin_login", userCredential.user.uid, "System Admin", "Admin logged into the console");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error("Login error:", err);
      let message = "An unexpected error occurred. Please try again.";
      
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        message = "Invalid email or password. Please check your credentials.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many failed attempts. Your account is temporarily locked. Please try again later.";
      } else if (err.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (err.code === "auth/user-disabled") {
        message = "This account has been disabled. Please contact support.";
      }
      
      setError(message);
      setLoading(false);
    }
  }

  return (
    <AuthShell
      mode="login"
      title="Sign in to DSCC"
      subtitle="Access your profiles, QR cards, and smart digital contact tools."
    >
      {loading || success ? (
        <div className="py-12">
          <JarLoader />
          {success && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center text-sm font-bold text-emerald-600"
            >
              Login Successful!
            </motion.p>
          )}
        </div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 outline-none transition focus:border-[#36c1bf] focus:ring-4 focus:ring-[#36c1bf]/10"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 outline-none transition focus:border-[#36c1bf] focus:ring-4 focus:ring-[#36c1bf]/10"
              placeholder="********"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full rounded-2xl bg-[#36c1bf] px-6 py-4 font-bold text-white shadow-lg shadow-[#36c1bf]/20 transition hover:bg-[#29aeb2]"
          >
            Login
          </motion.button>
        </form>
      )}
    </AuthShell>
  );
}


