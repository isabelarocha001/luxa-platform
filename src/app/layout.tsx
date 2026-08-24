import type { Metadata } from "next";
import "./globals.css";
import { AgeGate } from "@/components/AgeGate";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Luxa — Creator platform for Europe",
  description: "Premium adult creator platform for the European market. Subscribe with card. 18+ only.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-luxa-bg text-luxa-text antialiased">
        <AgeGate />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
