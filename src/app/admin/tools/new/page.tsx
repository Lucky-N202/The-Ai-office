import { prisma } from "@/lib/prisma";
import { ToolForm } from "@/components/admin/tool-form";

export default async function NewToolPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">New Tool</h1>
      <ToolForm categories={categories} />
    </div>
  );
}
