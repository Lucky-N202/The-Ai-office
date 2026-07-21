import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutGrid, Wrench, FolderTree, MessageSquare, Inbox } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/tools", label: "Tools", icon: Wrench },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  const pendingCount = await prisma.toolSubmission.count({ where: { status: "PENDING" } });

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <aside className="hidden w-56 shrink-0 md:block">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-2)]">Admin</p>
        <nav className="space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center justify-between rounded-[14px] px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-white/[0.04] hover:text-[var(--color-foreground)]">
              <span className="flex items-center gap-2.5"><Icon size={15} /> {label}</span>
              {label === "Submissions" && pendingCount > 0 && (
                <span className="rounded-full bg-[var(--color-primary)] px-1.5 py-0.5 text-[10px] font-medium text-white">{pendingCount}</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
