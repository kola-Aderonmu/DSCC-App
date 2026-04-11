import type { Metadata } from "next";
import "./globals.css";
import ErrorBoundary from "@/components/error-boundary";

export const metadata: Metadata = {
  title: "DSCC",
  description: "Digital Smart Complementary Card",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
