"use client";

import Link from "next/link";
import { Home, Search, MessageCircle, User, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/account", label: "Account", icon: User },
];

/**
 * Shell responsivo:
 * - Desktop (lg+): sidebar fixa
 * - Mobile: header + bottom tab bar + drawer
 * - min-w-0 + overflow-x-hidden evita conteúdo sair da tela
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh w-full max-w-[100vw] overflow-x-hidden lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-luxa-border bg-luxa-surface lg:block">
        <div className="sticky top-0 flex h-dvh flex-col p-4">
          <Link href="/" className="mb-6 text-xl font-bold text-luxa-accent">
            Luxa
          </Link>
          <div className="mb-4 flex flex-wrap gap-2">
            <Link
              href="/auth/login"
              className="rounded-full border border-luxa-border px-3 py-1 text-xs text-luxa-muted hover:text-luxa-text"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full bg-luxa-accent px-3 py-1 text-xs font-semibold text-white"
            >
              Sign up
            </Link>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-luxa-card text-luxa-text"
                      : "text-luxa-muted hover:bg-luxa-card hover:text-luxa-text"
                  }`}
                >
                  <Icon size={20} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </nav>
          <p className="mt-auto text-[10px] leading-relaxed text-luxa-muted/70">
            Card payments only · EU · 18+
          </p>
        </div>
      </aside>

      {/* Main column — sempre min-w-0 para flex não estourar */}
      <div className="flex min-w-0 w-full flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-luxa-border bg-luxa-bg/95 px-3 py-2.5 pt-safe backdrop-blur sm:px-4 lg:hidden">
          <Link href="/" className="shrink-0 text-lg font-bold text-luxa-accent">
            Luxa
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/auth/login"
              className="truncate text-xs text-luxa-muted"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="truncate text-xs font-semibold text-luxa-accent"
            >
              Sign up
            </Link>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="shrink-0 rounded-lg p-2 text-luxa-muted hover:bg-luxa-card"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {open && (
          <div className="border-b border-luxa-border bg-luxa-surface px-4 py-2 lg:hidden">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-sm text-luxa-muted hover:text-luxa-text"
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* pb extra no mobile por causa da bottom bar */}
        <div className="min-w-0 w-full flex-1 overflow-x-hidden pb-20 lg:pb-0">
          {children}
        </div>

        {/* Bottom navigation — mobile only */}
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-luxa-border bg-luxa-bg/95 pb-safe backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium ${
                    active ? "text-luxa-accent" : "text-luxa-muted"
                  }`}
                >
                  <Icon size={20} className="shrink-0" />
                  <span className="max-w-full truncate">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
