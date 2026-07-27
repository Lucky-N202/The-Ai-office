import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Articles</h1>
        <Link href="/admin/articles/new">
          <Button size="sm"><Plus size={14} /> New Article</Button>
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="card-surface p-10 text-center text-[var(--color-muted)]">
          No articles yet. The weekly digest cron will draft one automatically once there&rsquo;s data to report on,
          or write one yourself with &ldquo;New Article&rdquo;.
        </div>
      ) : (
        <div className="card-surface overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted-2)]">
                <th className="p-4">Title</th>
                <th className="p-4">Status</th>
                <th className="p-4">Source</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="p-4">
                    <Link href={`/admin/articles/${article.id}`} className="hover:text-[var(--color-primary)]">
                      {article.title}
                    </Link>
                  </td>
                  <td className="p-4">
                    <Badge className={article.status === "PUBLISHED" ? "text-[var(--color-primary)]" : ""}>
                      {article.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-[var(--color-muted)]">{article.aiGenerated ? "AI draft" : "Manual"}</td>
                  <td className="p-4 text-xs text-[var(--color-muted-2)]">
                    {(article.publishedAt ?? article.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
