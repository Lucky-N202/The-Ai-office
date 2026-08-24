import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, Compass, PlusCircle, Shield } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ToolCard } from "@/components/tool-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Welcome back",
  robots: { index: false, follow: false }, // personal, signed-in-only page — nothing here for search engines
};

export default async function WelcomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    include: { tool: { include: { category: { select: { id: true, name: true, slug: true, color: true, icon: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  const firstName = session.user.name?.split(" ")[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 text-[var(--color-muted)]">Here&rsquo;s what&rsquo;s saved to your account.</p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/browse/tools/all" className="card-surface card-interactive flex items-center gap-3 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
            <Compass size={18} />
          </div>
          <div>
            <p className="font-medium">Browse Tools</p>
            <p className="text-xs text-[var(--color-muted-2)]">Explore the full directory</p>
          </div>
        </Link>
        <Link href="/submit" className="card-surface card-interactive flex items-center gap-3 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
            <PlusCircle size={18} />
          </div>
          <div>
            <p className="font-medium">Submit a Tool</p>
            <p className="text-xs text-[var(--color-muted-2)]">Suggest one for the directory</p>
          </div>
        </Link>
        {session.user.role === "ADMIN" ? (
          <Link href="/admin" className="card-surface card-interactive flex items-center gap-3 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
              <Shield size={18} />
            </div>
            <div>
              <p className="font-medium">Admin Dashboard</p>
              <p className="text-xs text-[var(--color-muted-2)]">Manage tools, changes, and more</p>
            </div>
          </Link>
        ) : (
          <Link href="/browse/compare" className="card-surface card-interactive flex items-center gap-3 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
              <Bookmark size={18} />
            </div>
            <div>
              <p className="font-medium">Compare Tools</p>
              <p className="text-xs text-[var(--color-muted-2)]">Side by side, up to 4 at once</p>
            </div>
          </Link>
        )}
      </div>

      <h2 className="mb-4 text-lg font-semibold">Your Saved Tools</h2>
      {bookmarks.length === 0 ? (
        <div className="card-surface flex flex-col items-center gap-3 p-12 text-center">
          <Bookmark size={22} className="text-[var(--color-muted-2)]" />
          <p className="text-[var(--color-muted)]">Nothing saved yet — tap the bookmark icon on any tool to keep track of it here.</p>
          <Link href="/browse/tools/all">
            <Button variant="outline" size="sm">Browse Tools</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((b, i) => (
            <ToolCard key={b.id} tool={b.tool} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
