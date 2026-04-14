"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/auth-shell";
import JarLoader from "@/components/jar-loader";
import { motion } from "framer-motion";
import { logActivity } from "@/lib/activity";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update profile with full name
      await updateProfile(user, { displayName: fullName });

      // 3. Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        role: "user",
        createdAt: serverTimestamp(),
      });

      // Log activity
      await logActivity("user_signup", user.uid, fullName, `New user registered with email: ${email}`);

      setMessage("Account created successfully! Redirecting to login...");
      setMessageType("success");
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        setMessage("This email is already registered. Please go to the login page to sign in.");
      } else {
        setMessage(error.message || "An error occurred during signup.");
      }
      setMessageType("error");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      mode="signup"
      title="Create Account"
      subtitle="Create your account and start building your smart digital identity."
    >
      {loading && messageType !== "success" ? (
        <div className="py-12">
          <JarLoader />
        </div>
      ) : (
        <form onSubmit={handleSignup} className="space-y-5">
          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl px-5 py-4 text-sm font-medium ${
                messageType === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {message}
            </motion.div>
          )}

          {!messageType || messageType === "error" ? (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 outline-none transition focus:border-[#36c1bf] focus:ring-4 focus:ring-[#36c1bf]/10"
                  placeholder="Adekola Gabriel"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 outline-none transition focus:border-[#36c1bf] focus:ring-4 focus:ring-[#36c1bf]/10 lowercase"
                  placeholder="name@example.com"
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
                Sign Up
              </motion.button>
            </>
          ) : null}
        </form>
      )}
    </AuthShell>
  );
}
