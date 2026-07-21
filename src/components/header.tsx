"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/browse/tools/all", label: "Browse" },
  { href: "/browse/compare", label: "Compare" },
  { href: "/#categories", label: "Categories" },
  { href: "/bookmarks", label: "Saved" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-40 w-full">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm text-white">AI</span>
          <span className="hidden sm:inline">The AI Office</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("command-palette:open"))}
            className="focus-ring hidden items-center gap-2 rounded-[14px] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-muted)] transition-colors hover:border-[var(--color-border-hover)] sm:flex"
          >
            <Search size={14} />
            <span>Search tools…</span>
            <kbd className="ml-4 rounded border border-[var(--color-border)] bg-white/[0.04] px-1.5 py-0.5 text-[10px]">⌘K</kbd>
          </button>
          <ThemeToggle />
          <Link href="/submit">
            <Button size="sm" className="hidden sm:inline-flex">Submit a Tool</Button>
          </Link>
          <button className="focus-ring flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-muted)] md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-[var(--color-border)] px-4 py-3 md:hidden">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-white/[0.04]" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
