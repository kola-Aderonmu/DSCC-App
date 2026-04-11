"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/auth-shell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      mode="login"
      title="Sign in to DSCC"
      subtitle="Access your profiles, QR cards, and smart digital contact tools."
    >
      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-full border border-slate-200 text-indigo-800 px-4 py-3 outline-none transition focus:border-[#36c1bf]"
            placeholder="you@example.com"
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
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </AuthShell>
  );
}


