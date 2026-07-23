import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { AdminToolActions } from "@/components/admin/tool-actions";

export default async function AdminToolsPage() {
  const tools = await prisma.tool.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Manage Tools</h1>
        <Link href="/admin/tools/new">
          <Button size="sm"><Plus size={14} /> New Tool</Button>
        </Link>
      </div>

      <div className="card-surface overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted-2)]">
              <th className="p-4">Tool</th>
              <th className="p-4">Category</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Clicks</th>
              <th className="p-4">Featured</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {tools.map((tool) => (
              <tr key={tool.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="flex items-center gap-3 p-4">
                  <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-[var(--color-border)] bg-white/5">
                    <Image src={tool.logoUrl} alt={tool.name} fill sizes="32px" className="object-cover" />
                  </div>
                  {tool.name}
                </td>
                <td className="p-4 text-[var(--color-muted)]">{tool.category.name}</td>
                <td className="p-4">{tool.rating.toFixed(1)}</td>
                <td className="p-4 text-[var(--color-muted)]">{tool.clickCount.toLocaleString("en-US")}</td>
                <td className="p-4">{tool.featured ? "Yes" : "—"}</td>
                <td className="p-4"><AdminToolActions toolId={tool.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
