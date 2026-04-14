"use client";

import { motion } from "framer-motion";

type AppSplashProps = {
  progress: number;
};

export default function AppSplash({ progress }: AppSplashProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7fafc] px-6">
      <div className="w-full max-w-md text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mx-auto flex h-28 w-28 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#56d6cc] to-[#2db2b5] text-3xl font-bold text-white shadow-[0_15px_40px_rgba(45,178,181,0.35)]"
        >
          DS
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="mt-6 text-2xl font-bold text-slate-800"
        >
          Digital Smart Complementary Card
        </motion.h1>

        <p className="mt-2 text-sm text-slate-500">
          Preparing your smart identity experience...
        </p>

        <div className="mt-8 overflow-hidden rounded-full bg-slate-200">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-[#56d6cc] to-[#2db2b5]"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.25 }}
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-3 text-sm font-medium text-slate-600">{progress}%</p>
      </div>
    </div>
  );
}
