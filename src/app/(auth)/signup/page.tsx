"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/auth-shell";

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

      setMessage("Account created successfully! Redirecting to login...");
      setMessageType("success");
      setLoading(false);

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
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-full border border-slate-200 text-indigo-800 px-4 py-3 outline-none transition focus:border-[#36c1bf]"
            placeholder="Adekola Gabriel"
            required
          />
        </div>

       <div className="space-y-2">
  <label className="text-sm font-medium text-slate-700">Email</label>
  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full rounded-full border border-slate-200 text-indigo-800 lowercase px-4 py-3 outline-none transition focus:border-[#36c1bf]"
    placeholder="name@example.com"
    required
  />

        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-full border border-slate-200 text-indigo-800 px-4 py-3 outline-none transition focus:border-[#36c1bf]"
            placeholder="********"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#36c1bf] px-4 py-3 font-medium text-white transition hover:bg-[#29aeb2] disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        {loading && (
          <div className="w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-2 w-1/2 animate-pulse rounded-full bg-green-500" />
          </div>
        )}

        {message && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              messageType === "success"
                ? "border border-green-300 bg-green-100 text-green-800"
                : "border border-red-300 bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </AuthShell>
  );
}
