"use client";

import SplashScreen from "@/components/splash-screen";
import ErrorBoundary from "@/components/error-boundary";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SplashScreen />
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </>
  );
}
