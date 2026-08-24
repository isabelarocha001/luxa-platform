import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AgeGate } from "@/components/AgeGate";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Luxa — Creator platform for Europe",
  description:
    "Premium adult creator platform for the European market. Subscribe with card. 18+ only.",
  robots: { index: false, follow: false },
};

/** Viewport adaptativo — mobile e desktop, sem zoom forçado bugado */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full overflow-x-hidden">
      <body className="min-h-full min-h-dvh overflow-x-hidden bg-luxa-bg text-luxa-text antialiased">
        <AgeGate />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
