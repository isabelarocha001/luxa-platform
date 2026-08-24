"use client";

import { useEffect, useState } from "react";

const KEY = "luxa_age_ok";

export function AgeGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) !== "1") setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-luxa-border bg-luxa-card p-6 text-center shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-luxa-accent">18+ only</p>
        <h2 className="mt-2 text-xl font-bold">Adult content</h2>
        <p className="mt-2 text-sm text-luxa-muted">
          Luxa is an adult creator platform for users 18 years or older.
          By continuing you confirm you are of legal age in your country (EU regulations apply).
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="flex-1 rounded-full bg-luxa-accent py-3 text-sm font-bold text-white hover:bg-luxa-accentHover"
            onClick={() => {
              try { localStorage.setItem(KEY, "1"); } catch {}
              setOpen(false);
            }}
          >
            I am 18 or older
          </button>
          <a href="https://www.google.com" className="flex-1 rounded-full border border-luxa-border py-3 text-sm font-medium text-luxa-muted hover:bg-luxa-surface">
            Exit
          </a>
        </div>
      </div>
    </div>
  );
}
