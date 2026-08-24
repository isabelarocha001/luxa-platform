"use client";

import Link from "next/link";
import { Home, Search, MessageCircle, User, Menu } from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/account", label: "Account", icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-56 shrink-0 border-r border-luxa-border bg-luxa-surface lg:block">
        <div className="sticky top-0 flex h-screen flex-col p-4">
          <Link href="/" className="mb-8 text-xl font-bold text-luxa-accent">Luxa</Link>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-luxa-muted transition hover:bg-luxa-card hover:text-luxa-text">
                <Icon size={20} />
                {label}
              </Link>
            ))}
          </nav>
          <p className="mt-auto text-[10px] leading-relaxed text-luxa-muted/70">Card payments only · EU market · 18+</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-luxa-border bg-luxa-bg/90 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/" className="text-lg font-bold text-luxa-accent">Luxa</Link>
          <button type="button" aria-label="Menu" onClick={() => setOpen((v) => !v)} className="rounded-lg p-2 text-luxa-muted hover:bg-luxa-card">
            <Menu size={20} />
          </button>
        </header>
        {open && (
          <div className="border-b border-luxa-border bg-luxa-surface px-4 py-2 lg:hidden">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="block py-2 text-sm text-luxa-muted hover:text-luxa-text">{label}</Link>
            ))}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
