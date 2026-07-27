import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/article-form";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        {article.status === "DRAFT" ? "Review Draft" : "Edit"}: {article.title}
      </h1>
      <ArticleForm article={article} />
    </div>
  );
}
