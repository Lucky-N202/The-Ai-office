"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function AdminReviewDelete({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  async function handleDelete() {
    if (!confirm("Delete this review?")) return;
    const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Review deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete review");
    }
  }
  return (
    <button onClick={handleDelete} className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-red-500/10 hover:text-red-400">
      <Trash2 size={14} />
    </button>
  );
}
