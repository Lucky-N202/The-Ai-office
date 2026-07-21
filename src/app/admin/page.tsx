import { prisma } from "@/lib/prisma";

export default async function AdminOverview() {
  const [toolCount, categoryCount, reviewCount, userCount, pendingSubmissions] = await Promise.all([
    prisma.tool.count(),
    prisma.category.count(),
    prisma.review.count(),
    prisma.user.count(),
    prisma.toolSubmission.count({ where: { status: "PENDING" } }),
  ]);

  const stats = [
    { label: "Tools", value: toolCount },
    { label: "Categories", value: categoryCount },
    { label: "Reviews", value: reviewCount },
    { label: "Users", value: userCount },
    { label: "Pending Submissions", value: pendingSubmissions },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Admin Overview</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-5">
            <p className="text-xs text-[var(--color-muted-2)]">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
