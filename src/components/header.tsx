"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Menu, Search, X, LogOut, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/browse/tools/all", label: "Browse" },
  { href: "/browse/compare", label: "Compare" },
  { href: "/#categories", label: "Categories" },
  { href: "/blog", label: "Blog" },
  { href: "/bookmarks", label: "Saved" },
];

export function Header() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

          {status === "loading" ? (
            <div className="hidden h-9 w-20 animate-pulse rounded-[14px] bg-white/[0.04] sm:block" />
          ) : session?.user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="focus-ring flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                aria-label="Account menu"
              >
                {session.user.image ? (
                  <Image src={session.user.image} alt={session.user.name ?? "Account"} width={36} height={36} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon size={15} className="text-[var(--color-muted)]" />
                )}
              </button>
              {menuOpen && (
                <>
                  <button className="fixed inset-0 z-40 cursor-default" onClick={() => setMenuOpen(false)} aria-hidden="true" tabIndex={-1} />
                  <div className="glass absolute right-0 z-50 mt-2 w-48 rounded-[16px] p-1.5">
                    <p className="truncate px-3 py-2 text-xs text-[var(--color-muted-2)]">{session.user.email}</p>
                    <Link href="/welcome" onClick={() => setMenuOpen(false)} className="block rounded-[10px] px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-white/[0.06] hover:text-[var(--color-foreground)]">
                      Your dashboard
                    </Link>
                    <Link href="/account" onClick={() => setMenuOpen(false)} className="block rounded-[10px] px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-white/[0.06] hover:text-[var(--color-foreground)]">
                      Account settings
                    </Link>
                    {session.user.role === "ADMIN" && (
                      <Link href="/admin" onClick={() => setMenuOpen(false)} className="block rounded-[10px] px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-white/[0.06] hover:text-[var(--color-foreground)]">
                        Admin dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left text-sm text-[var(--color-muted)] hover:bg-white/[0.06] hover:text-[var(--color-foreground)]"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="hidden sm:inline-flex">
              <Button size="sm" variant="outline">Sign In</Button>
            </Link>
          )}

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
          <div className="my-1 border-t border-[var(--color-border)]" />
          {session?.user ? (
            <>
              <Link href="/welcome" className="rounded-lg px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-white/[0.04]" onClick={() => setOpen(false)}>
                Your dashboard
              </Link>
              <Link href="/account" className="rounded-lg px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-white/[0.04]" onClick={() => setOpen(false)}>
                Account settings
              </Link>
              {session.user.role === "ADMIN" && (
                <Link href="/admin" className="rounded-lg px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-white/[0.04]" onClick={() => setOpen(false)}>
                  Admin dashboard
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--color-muted)] hover:bg-white/[0.04]"
              >
                <LogOut size={14} /> Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-white/[0.04]" onClick={() => setOpen(false)}>
              Sign In
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
