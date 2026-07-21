import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminCategoryForm } from "@/components/admin/category-form";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { tools: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Manage Categories</h1>

      <div className="mb-8 card-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-[var(--color-muted)]">Add a Category</h2>
        <AdminCategoryForm />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const Icon = (Icons[c.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Sparkles;
          return (
            <div key={c.id} className="card-surface flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${c.color}1a`, color: c.color }}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-xs text-[var(--color-muted-2)]">{c._count.tools} tools</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
