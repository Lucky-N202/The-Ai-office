"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, Trash2 } from "lucide-react";

type ReviewWithTool = {
  id: string;
  rating: number;
  title: string;
  body: string;
  createdAt: Date;
  tool: { name: string; slug: string };
};

export function ReviewRow({ review }: { review: ReviewWithTool }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/reviews/${review.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Review deleted");
      router.refresh();
    } else {
      setDeleting(false);
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <Link href={`/browse/tools/${review.tool.slug}`} className="font-medium hover:text-[var(--color-primary)]">
            {review.tool.name}
          </Link>
          <span className="flex items-center gap-0.5 text-xs text-[var(--color-muted)]">
            <Star size={12} className="fill-current" /> {review.rating}
          </span>
        </div>
        <p className="text-sm font-medium text-[var(--color-foreground)]">{review.title}</p>
        <p className="line-clamp-2 text-sm text-[var(--color-muted)]">{review.body}</p>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        aria-label="Delete review"
        className="shrink-0 rounded-lg p-2 text-[var(--color-muted-2)] hover:bg-red-950/30 hover:text-red-500"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
