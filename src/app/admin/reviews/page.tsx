import { prisma } from "@/lib/prisma";
import { StarRating } from "@/components/ui/star-rating";
import { AdminReviewDelete } from "@/components/admin/review-delete";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: { tool: true, user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Manage Reviews</h1>
      <div className="space-y-3">
        {reviews.length === 0 && <p className="text-[var(--color-muted)]">No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="card-surface flex items-start justify-between gap-4 p-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <p className="font-medium">{r.title}</p>
                <StarRating rating={r.rating} size={12} />
              </div>
              <p className="text-sm text-[var(--color-muted)]">{r.body}</p>
              <p className="mt-2 text-xs text-[var(--color-muted-2)]">{r.tool.name} — {r.user.name ?? r.user.email}</p>
            </div>
            <AdminReviewDelete reviewId={r.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
