"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type AuthShellProps = {
  mode: "login" | "signup";
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function AuthShell({
  mode,
  title,
  subtitle,
  children,
}: AuthShellProps) {
  const isLogin = mode === "login";

  return (
    <main className="min-h-screen bg-[#eef1f4] px-4 py-4 md:px-6">
      <div className="mx-auto flex min-h-[95vh] max-w-[1600px] items-center justify-center">
        <div className="relative grid w-full overflow-hidden rounded-[40px] bg-white shadow-[0_20px_80px_rgba(0,0,0,0.06)] md:grid-cols-2">
          <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-28 rounded-tr-[60px] rounded-bl-[40px] bg-[#eecb84]" />
          <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-[36px] bg-[#ec9d82]" />

          <motion.div
            key={`panel-${mode}`}
            initial={{ opacity: 0, x: isLogin ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`relative hidden min-h-[720px] overflow-hidden md:flex ${
              isLogin ? "order-2" : "order-1"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#58d0cb] to-[#35bcbc]" />
            <div className="absolute inset-0 auth-pattern opacity-20" />

            <div className="absolute left-[-40px] top-1/2 h-[150px] w-[150px] -translate-y-1/2 rounded-full border border-white/40" />
            <div className="absolute bottom-20 right-14 h-[84px] w-[84px] rotate-12 rounded-[24px] border border-white/30" />

            <div className="relative z-10 flex w-full flex-col items-center justify-center px-10 text-center text-white">
              <h2 className="text-5xl font-bold">
                {isLogin ? "Hello, Friend!" : "Welcome Back!"}
              </h2>

              <p className="mt-6 max-w-md text-2xl leading-relaxed text-white/95">
                {isLogin
                  ? "Enter your personal details and begin building your smart digital complementary card."
                  : "Already have an account? Sign in to continue managing your smart digital complementary card."}
              </p>

              <Link
                href={isLogin ? "/signup" : "/login"}
                className="mt-12 inline-flex min-w-[250px] items-center justify-center rounded-full border border-white/70 px-8 py-4 text-2xl font-medium text-white transition hover:bg-white hover:text-[#32b8bb]"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </Link>
            </div>
          </motion.div>

          <motion.div
            key={`form-${mode}`}
            initial={{ opacity: 0, x: isLogin ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={`flex min-h-[720px] items-center justify-center px-8 py-10 md:px-14 md:py-14 ${
              isLogin ? "order-1" : "order-2"
            }`}
          >
            <div className="w-full max-w-xl">
              <h1 className="text-4xl font-bold tracking-tight text-[#284746] md:text-5xl">
                {title}
              </h1>

              <p className="mt-4 text-lg text-[#607095]">{subtitle}</p>

              <div className="mt-12">{children}</div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
