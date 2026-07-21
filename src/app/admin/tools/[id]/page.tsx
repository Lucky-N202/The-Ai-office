import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ToolForm } from "@/components/admin/tool-form";

export default async function EditToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tool, categories] = await Promise.all([
    prisma.tool.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!tool) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Edit {tool.name}</h1>
      <ToolForm tool={tool} categories={categories} />
    </div>
  );
}
